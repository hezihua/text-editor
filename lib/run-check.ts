import type { LanguageModelUsage } from "ai";

import {
  logAnalyzeMetrics,
  sumUsage,
  usageToMetrics,
} from "./analyze-metrics";
import type { CheckDirectionId } from "./check-directions";
import { checkSingleChunk } from "./check-single-chunk";
import { finalizeCheckResult } from "./filter-check";
import { mergeChunkResults, normalizeChunkCheck } from "./normalize-check";
import type { CheckResult } from "./schemas";
import { splitTextIntoChunks } from "./text-chunks";

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

  const check = finalizeCheckResult(
    mergeChunkResults(partialResults),
    text,
    direction,
  );
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
