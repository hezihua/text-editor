import type { CheckDirectionId } from "./check-directions";
import { applyDirectionIssueFilter } from "./filter-check";
import { mergeChunkResults } from "./normalize-check";
import type { AnalyzeMeta, CheckIssue, CheckResult } from "./schemas";
import { splitTextIntoChunks } from "./text-chunks";

type ChunkResponse = {
  check: CheckResult;
  dropped: number;
  retries: number;
  usage?: AnalyzeMeta["usage"];
};

export type CheckProgress = {
  current: number;
  total: number;
};

export async function runCheckWithProgress(
  text: string,
  direction: CheckDirectionId,
  onProgress: (progress: CheckProgress) => void,
): Promise<{ check: CheckResult; meta: AnalyzeMeta }> {
  const started = Date.now();
  const chunks = splitTextIntoChunks(text);
  onProgress({ current: 0, total: chunks.length });

  const partialResults: CheckResult[] = [];
  let totalDropped = 0;
  let totalRetries = 0;
  let degraded: string | undefined;
  let usageSum: ChunkResponse["usage"];
  let lastError: string | undefined;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    onProgress({ current: i, total: chunks.length });

    const res = await fetch("/api/analyze/chunk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullText: text,
        chunk,
        direction,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      lastError =
        typeof data.error === "string" ? data.error : "分段检查失败";
      degraded = "部分分段检查失败，已跳过该段；可缩短正文或重试。";
      continue;
    }
    const payload = data as ChunkResponse;
    totalDropped += payload.dropped;
    totalRetries += payload.retries;
    partialResults.push(payload.check);
    onProgress({ current: i + 1, total: chunks.length });
    if (payload.usage) {
      usageSum = {
        inputTokens:
          (usageSum?.inputTokens ?? 0) + (payload.usage.inputTokens ?? 0),
        outputTokens:
          (usageSum?.outputTokens ?? 0) + (payload.usage.outputTokens ?? 0),
        totalTokens:
          (usageSum?.totalTokens ?? 0) + (payload.usage.totalTokens ?? 0),
      };
    }
  }

  if (partialResults.length === 0) {
    throw new Error(lastError ?? "检查未返回有效结果，请重试");
  }

  const check = applyDirectionIssueFilter(
    mergeChunkResults(partialResults),
    direction,
  );
  const durationMs = Date.now() - started;

  return {
    check,
    meta: {
      durationMs,
      chunkCount: chunks.length,
      droppedIssueCount: totalDropped,
      retryCount: totalRetries,
      usage: usageSum,
      degraded,
    },
  };
}

/** 仅对正文某一区间重新检查，用于单条 issue 刷新建议 */
export async function recheckIssueSpan(
  fullText: string,
  issue: CheckIssue,
  direction: CheckDirectionId,
  contextPad = 320,
): Promise<CheckIssue | null> {
  const start = Math.max(0, issue.start - contextPad);
  const end = Math.min(fullText.length, issue.end + contextPad);
  const snippet = fullText.slice(start, end);
  if (snippet.length < 20) return null;

  const { check } = await runCheckWithProgress(
    snippet,
    direction,
    () => {},
  );

  if (check.issues.length === 0) return null;

  const localQuote = fullText.slice(issue.start, issue.end);
  const match =
    check.issues.find((i) => i.quote === localQuote) ??
    check.issues.find(
      (i) =>
        i.start + start <= issue.end &&
        i.end + start >= issue.start,
    ) ??
    check.issues[0];

  if (!match) return null;

  return {
    ...match,
    id: issue.id,
    start: match.start + start,
    end: match.end + start,
    quote: fullText.slice(match.start + start, match.end + start),
  };
}
