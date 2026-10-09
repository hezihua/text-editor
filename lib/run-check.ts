import { generateText, Output, type LanguageModelUsage } from "ai";

import {
  logAnalyzeMetrics,
  sumUsage,
  usageToMetrics,
} from "./analyze-metrics";
import type { CheckDirectionId } from "./check-directions";
import { getLanguageModel } from "./llm";
import { mergeChunkResults, normalizeChunkCheck } from "./normalize-check";
import { buildCheckPrompt, buildCheckPromptStrict } from "./prompts";
import { checkResultSchema, type CheckResult } from "./schemas";
import { splitTextIntoChunks } from "./text-chunks";

const MAX_ATTEMPTS = 3;

export type RunCheckOptions = {
  text: string;
  direction: CheckDirectionId;
};

export type RunCheckResult = {
  check: CheckResult;
  meta: {
    durationMs: number;
    chunkCount: number;
    droppedIssueCount: number;
    retryCount: number;
    usage?: ReturnType<typeof usageToMetrics>;
    degraded?: string;
  };
};

async function callCheckOnce(
  chunkText: string,
  direction: CheckDirectionId,
  strict: boolean,
): Promise<{
  output: unknown;
  usage?: LanguageModelUsage;
}> {
  const model = getLanguageModel();
  const prompt = strict
    ? buildCheckPromptStrict(chunkText, direction)
    : buildCheckPrompt(chunkText, direction);

  const { output, usage } = await generateText({
    model,
    output: Output.object({ schema: checkResultSchema }),
    prompt,
  });

  return { output, usage };
}

async function checkSingleChunk(
  chunkText: string,
  direction: CheckDirectionId,
): Promise<{ raw: unknown; usage?: LanguageModelUsage; retries: number }> {
  let lastError: unknown;
  let retries = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const strict = attempt > 0;
    try {
      const { output, usage } = await callCheckOnce(
        chunkText,
        direction,
        strict,
      );
      if (output == null) {
        throw new Error("empty_output");
      }
      const validated = checkResultSchema.safeParse(output);
      if (!validated.success) {
        retries += 1;
        lastError = validated.error;
        continue;
      }
      return { raw: validated.data, usage, retries };
    } catch (e) {
      retries += 1;
      lastError = e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("检查块失败，请稍后重试");
}

export async function runCheck({
  text,
  direction,
}: RunCheckOptions): Promise<RunCheckResult> {
  const started = Date.now();
  const chunks = splitTextIntoChunks(text);
  let totalUsage: LanguageModelUsage | undefined;
  let totalDropped = 0;
  let totalRetries = 0;
  let degraded: string | undefined;

  const partialResults: CheckResult[] = [];

  for (const chunk of chunks) {
    const { raw, usage, retries } = await checkSingleChunk(
      chunk.text,
      direction,
    );
    totalRetries += retries;
    totalUsage = sumUsage(totalUsage, usage);

    try {
      const normalized = normalizeChunkCheck(raw, chunk, text);
      totalDropped += normalized.dropped;
      partialResults.push(normalized.check);
    } catch (e) {
      totalRetries += 1;
      degraded =
        "部分分段结果格式异常，已跳过该段；建议缩短正文或重试。";
      logAnalyzeMetrics({
        event: "analyze",
        ok: false,
        durationMs: Date.now() - started,
        direction,
        textLength: text.length,
        chunkCount: chunks.length,
        issueCount: 0,
        droppedIssueCount: totalDropped,
        retryCount: totalRetries,
        error: e instanceof Error ? e.message : "normalize_failed",
      });
    }
  }

  if (partialResults.length === 0) {
    const err = new Error("检查未返回有效结果，请重试");
    logAnalyzeMetrics({
      event: "analyze",
      ok: false,
      durationMs: Date.now() - started,
      direction,
      textLength: text.length,
      chunkCount: chunks.length,
      issueCount: 0,
      droppedIssueCount: totalDropped,
      retryCount: totalRetries,
      error: err.message,
    });
    throw err;
  }

  const check = mergeChunkResults(partialResults);
  const durationMs = Date.now() - started;

  logAnalyzeMetrics({
    event: "analyze",
    ok: true,
    durationMs,
    direction,
    textLength: text.length,
    chunkCount: chunks.length,
    issueCount: check.issues.length,
    droppedIssueCount: totalDropped,
    retryCount: totalRetries,
    usage: usageToMetrics(totalUsage),
  });

  return {
    check,
    meta: {
      durationMs,
      chunkCount: chunks.length,
      droppedIssueCount: totalDropped,
      retryCount: totalRetries,
      usage: usageToMetrics(totalUsage),
      degraded,
    },
  };
}
