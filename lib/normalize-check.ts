import { z } from "zod";

import type { TextChunk } from "./text-chunks";
import { findIssueRange } from "./issue-range";
import {
  checkIssueModelSchema,
  checkResultSchema,
  type CheckIssue,
  type CheckResult,
} from "./schemas";

const rawCheckResultSchema = checkResultSchema;

export type NormalizeResult = {
  check: CheckResult;
  dropped: number;
  warnings: string[];
};

function dedupeIssues(issues: CheckIssue[]): CheckIssue[] {
  const sorted = [...issues].sort((a, b) => a.start - b.start);
  const kept: CheckIssue[] = [];

  for (const issue of sorted) {
    const overlaps = kept.some(
      (k) =>
        issue.start < k.end &&
        issue.end > k.start &&
        (k.category === issue.category || k.quote === issue.quote),
    );
    if (!overlaps) kept.push(issue);
  }
  return kept;
}

/** 校验单块模型输出，补全偏移与稳定 id，丢弃无法定位的条目 */
export function normalizeChunkCheck(
  raw: unknown,
  chunk: TextChunk,
  fullText: string,
): NormalizeResult {
  const parsed = rawCheckResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new z.ZodError(parsed.error.issues);
  }

  const warnings: string[] = [];
  const issues: CheckIssue[] = [];
  let dropped = 0;

  parsed.data.issues.forEach((issue, localIndex) => {
    const single = checkIssueModelSchema.safeParse(issue);
    if (!single.success) {
      dropped += 1;
      return;
    }

    const localStart =
      single.data.start ?? findIssueRange(chunk.text, single.data)?.[0];
    const localEnd =
      single.data.end ??
      (localStart != null
        ? localStart + single.data.quote.length
        : undefined);

    let start = localStart;
    let end = localEnd;

    if (start == null || end == null) {
      const range = findIssueRange(chunk.text, single.data);
      if (!range) {
        dropped += 1;
        return;
      }
      [start, end] = range;
    }

    const globalStart = chunk.offset + start;
    const globalEnd = chunk.offset + end;

    const located = findIssueRange(fullText, {
      quote: single.data.quote,
      start: globalStart,
      end: globalEnd,
    });
    if (!located) {
      dropped += 1;
      return;
    }

    issues.push({
      ...single.data,
      id: `c${chunk.index}-i${localIndex + 1}`,
      start: located[0],
      end: located[1],
      quote: fullText.slice(located[0], located[1]),
    });
  });

  const merged = dedupeIssues(issues);
  dropped += issues.length - merged.length;

  return {
    check: {
      summary: parsed.data.summary.trim(),
      issues: merged,
    },
    dropped,
    warnings,
  };
}

export function mergeChunkResults(
  parts: CheckResult[],
  fullSummary?: string,
): CheckResult {
  const issues = dedupeIssues(parts.flatMap((p) => p.issues));
  const summary =
    fullSummary?.trim() ||
    parts.map((p) => p.summary).filter(Boolean).join(" ") ||
    "已完成分段检查。";

  return { summary: summary.slice(0, 500), issues };
}
