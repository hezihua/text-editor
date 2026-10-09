import type { CheckDirectionId } from "./check-directions";
import { buildIssuesFromRewriteDiff } from "./diff-to-issues";
import { finalizeCheckResult } from "./filter-check";
import { REWRITE_MAX_CHARS, usesRewriteMode } from "./rewrite-directions";
import type { AnalyzeMeta, CheckIssue, CheckResult } from "./schemas";
import { splitTextIntoChunks } from "./text-chunks";

export type CheckProgress = {
  current: number;
  total: number;
};

type RewriteChunkResponse = {
  text: string;
  summary: string;
  retries: number;
  usage?: AnalyzeMeta["usage"];
};

export async function runCheckWithProgress(
  text: string,
  direction: CheckDirectionId,
  onProgress: (progress: CheckProgress) => void,
): Promise<{
  check: CheckResult;
  meta: AnalyzeMeta;
  proposedText?: string;
}> {
  if (!usesRewriteMode(direction)) {
    throw new Error("不支持的检查方向");
  }

  if (text.length > REWRITE_MAX_CHARS) {
    throw new Error(`正文超过 ${REWRITE_MAX_CHARS} 字上限`);
  }

  const started = Date.now();
  const chunks = splitTextIntoChunks(text);
  onProgress({ current: 0, total: chunks.length });

  const rewrittenParts: string[] = [];
  const summaries: string[] = [];
  let totalRetries = 0;
  let usageSum: AnalyzeMeta["usage"];
  let lastError: string | undefined;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    onProgress({ current: i, total: chunks.length });

    const res = await fetch("/api/analyze/rewrite/chunk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullText: text,
        chunk,
        direction,
        totalChunks: chunks.length,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      lastError =
        typeof data.error === "string" ? data.error : "分段改写失败";
      throw new Error(lastError);
    }

    const payload = data as RewriteChunkResponse;
    rewrittenParts.push(payload.text);
    summaries.push(payload.summary);
    totalRetries += payload.retries;
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
    onProgress({ current: i + 1, total: chunks.length });
  }

  const proposedText = rewrittenParts.join("");
  const summary =
    summaries.length === 1
      ? summaries[0]!
      : summaries.filter(Boolean).slice(0, 2).join("；") ||
        "已完成分段全文改写。";

  const rawCheck: CheckResult = {
    summary,
    issues: buildIssuesFromRewriteDiff(text, proposedText, direction),
  };
  const check = finalizeCheckResult(rawCheck, text, direction);
  const durationMs = Date.now() - started;

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

/** 仅对正文某一区间重新检查（改写该片段并 diff） */
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

  const { proposedText, check } = await runCheckWithProgress(
    snippet,
    direction,
    () => {},
  );

  if (!proposedText || check.issues.length === 0) return null;

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
