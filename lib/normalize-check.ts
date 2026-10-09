import { z } from "zod";

import {
  locateIssueInText,
  normalizeChunkLocalOffsets,
} from "./issue-range";
import type { TextChunk } from "./text-chunks";
import {
  checkIssueModelSchema,
  checkResultSchema,
  type CheckIssue,
  type CheckResult,
} from "./schemas";

const rawCheckResultSchema = checkResultSchema;

export type NormalizeDropStats = {
  /** 模型 quote/偏移无法在正文对齐 */
  locate: number;
  /** 多条圈选重叠，合并为一条 */
  duplicate: number;
};

export type NormalizeResult = {
  check: CheckResult;
  dropped: NormalizeDropStats;
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
  const dropped: NormalizeDropStats = { locate: 0, duplicate: 0 };

  parsed.data.issues.forEach((issue, localIndex) => {
    const single = checkIssueModelSchema.safeParse(issue);
    if (!single.success) {
      dropped.locate += 1;
      return;
    }

    const { start: hintStart, end: hintEnd } = normalizeChunkLocalOffsets(
      chunk.text.length,
      chunk.offset,
      single.data.start,
      single.data.end,
    );

    const local = locateIssueInText(chunk.text, single.data.quote, {
      start: hintStart,
      end: hintEnd,
    });
    if (!local) {
      dropped.locate += 1;
      return;
    }

    const globalStart = chunk.offset + local[0];
    const globalEnd = chunk.offset + local[1];
    const canonicalQuote = fullText.slice(globalStart, globalEnd);
    if (!canonicalQuote || globalEnd > fullText.length) {
      dropped.locate += 1;
      return;
    }

    issues.push({
      ...single.data,
      id: `c${chunk.index}-i${localIndex + 1}`,
      start: globalStart,
      end: globalEnd,
      quote: canonicalQuote,
    });
  });

  const merged = dedupeIssues(issues);
  dropped.duplicate += issues.length - merged.length;

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
