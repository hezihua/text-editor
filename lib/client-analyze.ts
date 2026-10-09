import { toUserFacingApiError } from "./api-error-message";
import type { CheckDirectionId } from "./check-directions";
import { finalizeCheckResult } from "./filter-check";
import { mergeChunkResults } from "./normalize-check";
import { ANALYZE_MAX_CHARS } from "./analyze-limits";
import type { AnalyzeMeta, CheckIssue, CheckResult } from "./schemas";
import { splitTextIntoChunks } from "./text-chunks";

export type CheckProgress = {
  current: number;
  total: number;
};

type ChunkCheckResponse = {
  check: CheckResult;
  droppedLocate?: number;
  retries: number;
  usage?: AnalyzeMeta["usage"];
};

function sumUsage(
  a: AnalyzeMeta["usage"] | undefined,
  b: AnalyzeMeta["usage"] | undefined,
): AnalyzeMeta["usage"] | undefined {
  if (!b) return a;
  return {
    inputTokens: (a?.inputTokens ?? 0) + (b.inputTokens ?? 0),
    outputTokens: (a?.outputTokens ?? 0) + (b.outputTokens ?? 0),
    totalTokens: (a?.totalTokens ?? 0) + (b.totalTokens ?? 0),
  };
}

/** Text-Well 式：规则分段 + 并发调用模型，返回结构化 issue（quote/start/end/suggestion） */
export async function runCheckWithProgress(
  text: string,
  direction: CheckDirectionId,
  onProgress: (progress: CheckProgress) => void,
): Promise<{
  check: CheckResult;
  meta: AnalyzeMeta;
}> {
  if (text.length > ANALYZE_MAX_CHARS) {
    throw new Error(`正文超过 ${ANALYZE_MAX_CHARS} 字上限`);
  }

  const started = Date.now();
  const chunks = splitTextIntoChunks(text);
  onProgress({ current: 0, total: chunks.length });

  let completed = 0;
  let totalRetries = 0;
  let totalDroppedLocate = 0;
  let usageSum: AnalyzeMeta["usage"];
  let degraded: string | undefined;

  const partials = await Promise.all(
    chunks.map(async (chunk) => {
      try {
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
          throw new Error(
            toUserFacingApiError(
              typeof data.error === "string" ? data.error : "分段检查失败",
            ),
          );
        }

        const payload = data as ChunkCheckResponse;
        totalRetries += payload.retries;
        totalDroppedLocate += payload.droppedLocate ?? 0;
        usageSum = sumUsage(usageSum, payload.usage);
        completed += 1;
        onProgress({ current: completed, total: chunks.length });
        return payload.check;
      } catch (e) {
        completed += 1;
        onProgress({ current: completed, total: chunks.length });
        degraded =
          "部分分段检查失败，已跳过该段；建议缩短正文或重试。";
        return null;
      }
    }),
  );

  const valid = partials.filter((p): p is CheckResult => p != null);
  if (valid.length === 0) {
    throw new Error("检查未返回有效结果，请重试");
  }

  const merged = mergeChunkResults(valid);
  const { check } = finalizeCheckResult(merged, text, direction);
  const durationMs = Date.now() - started;

  return {
    check,
    meta: {
      durationMs,
      chunkCount: chunks.length,
      droppedLocateCount: totalDroppedLocate,
      droppedIssueCount: totalDroppedLocate,
      retryCount: totalRetries,
      usage: usageSum,
      degraded,
    },
  };
}

/** 仅对正文某一区间重新检查（带上下文的片段走单块 issue 检查） */
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

  const res = await fetch("/api/analyze/chunk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullText: snippet,
      chunk: { index: 0, text: snippet, offset: 0 },
      direction,
    }),
  });
  const data = await res.json();
  if (!res.ok) return null;

  const payload = data as ChunkCheckResponse;
  const { check } = finalizeCheckResult(payload.check, snippet, direction);
  if (check.issues.length === 0) return null;

  const localQuote = fullText.slice(issue.start, issue.end);
  const match =
    check.issues.find((i) => i.quote === localQuote) ??
    check.issues.find(
      (i) =>
        i.start + start <= issue.end && i.end + start >= issue.start,
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
