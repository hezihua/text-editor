import { generateText, Output } from "ai";
import { z } from "zod";

import { buildIssuesFromRewriteDiff } from "./diff-to-issues";
import { logAnalyzeMetrics, usageToMetrics } from "./analyze-metrics";
import type { CheckDirectionId } from "./check-directions";
import { finalizeCheckResult } from "./filter-check";
import { getLanguageModel } from "./llm";
import { buildRewritePrompt } from "./rewrite-prompt";
import type { CheckResult } from "./schemas";
import { splitTextIntoChunks, type TextChunk } from "./text-chunks";

export const rewriteResultSchema = z.object({
  summary: z.string().min(1).max(500),
  text: z.string().min(1),
});

export type RewriteChunkResult = {
  text: string;
  summary: string;
  retries: number;
  usage?: ReturnType<typeof usageToMetrics>;
};

export async function rewriteTextChunk(
  chunkText: string,
  direction: CheckDirectionId,
  chunk: Pick<TextChunk, "index">,
  totalChunks: number,
): Promise<RewriteChunkResult> {
  const model = getLanguageModel();
  let retries = 0;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: rewriteResultSchema }),
        prompt: buildRewritePrompt(
          chunkText,
          direction,
          attempt > 0,
          chunk.index,
          totalChunks,
        ),
      });

      if (!output?.text?.trim()) {
        throw new Error("empty_rewrite");
      }

      const parsed = rewriteResultSchema.safeParse(output);
      if (!parsed.success) {
        retries += 1;
        lastError = parsed.error;
        continue;
      }

      return {
        text: parsed.data.text.trim(),
        summary: parsed.data.summary.trim(),
        retries,
        usage: usageToMetrics(usage),
      };
    } catch (e) {
      retries += 1;
      lastError = e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("分段改写失败，请重试");
}

export type RunRewriteResult = {
  check: CheckResult;
  proposedText: string;
  meta: {
    durationMs: number;
    chunkCount: number;
    droppedIssueCount: number;
    retryCount: number;
    usage?: ReturnType<typeof usageToMetrics>;
    mode: "rewrite";
  };
};

export async function runRewriteCheck(
  original: string,
  direction: CheckDirectionId,
): Promise<RunRewriteResult> {
  const started = Date.now();
  const chunks = splitTextIntoChunks(original);
  const rewrittenParts: string[] = [];
  const summaries: string[] = [];
  let totalRetries = 0;
  let usageSum: ReturnType<typeof usageToMetrics>;

  for (const chunk of chunks) {
    const part = await rewriteTextChunk(
      chunk.text,
      direction,
      chunk,
      chunks.length,
    );
    rewrittenParts.push(part.text);
    summaries.push(part.summary);
    totalRetries += part.retries;
    if (part.usage) {
      usageSum = {
        inputTokens:
          (usageSum?.inputTokens ?? 0) + (part.usage.inputTokens ?? 0),
        outputTokens:
          (usageSum?.outputTokens ?? 0) + (part.usage.outputTokens ?? 0),
        totalTokens:
          (usageSum?.totalTokens ?? 0) + (part.usage.totalTokens ?? 0),
      };
    }
  }

  const proposedText = rewrittenParts.join("");
  const summary =
    summaries.length === 1
      ? summaries[0]!
      : summaries.filter(Boolean).slice(0, 2).join("；") ||
        "已完成分段全文改写。";

  const rawCheck: CheckResult = {
    summary,
    issues: buildIssuesFromRewriteDiff(original, proposedText, direction),
  };
  const check = finalizeCheckResult(rawCheck, original, direction);
  const durationMs = Date.now() - started;

  logAnalyzeMetrics({
    event: "analyze",
    ok: true,
    durationMs,
    direction,
    textLength: original.length,
    chunkCount: chunks.length,
    issueCount: check.issues.length,
    droppedIssueCount: Math.max(0, rawCheck.issues.length - check.issues.length),
    retryCount: totalRetries,
    usage: usageSum,
  });

  return {
    check,
    proposedText,
    meta: {
      durationMs,
      chunkCount: chunks.length,
      droppedIssueCount: Math.max(
        0,
        rawCheck.issues.length - check.issues.length,
      ),
      retryCount: totalRetries,
      usage: usageSum,
      mode: "rewrite",
    },
  };
}
