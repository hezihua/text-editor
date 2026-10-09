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
      dropped += 1;
      return;
    }

    const globalHint = {
      start: chunk.offset + local[0],
      end: chunk.offset + local[1],
    };
    const global = locateIssueInText(
      fullText,
      single.data.quote,
      globalHint,
    );
    if (!global) {
      dropped += 1;
      return;
    }

    issues.push({
      ...single.data,
      id: `c${chunk.index}-i${localIndex + 1}`,
      start: global[0],
      end: global[1],
      quote: fullText.slice(global[0], global[1]),
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
