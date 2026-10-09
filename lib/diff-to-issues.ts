import type { CheckDirectionId } from "./check-directions";
import { diffSpans } from "./text-patch";
import type { CheckIssue, CheckResult } from "./schemas";

function issueCategoryForDirection(
  direction?: CheckDirectionId,
): CheckIssue["category"] {
  if (direction === "basic") return "grammar";
  if (
    direction === "game-compliance" ||
    direction === "copyright-compliance" ||
    direction === "ad-compliance" ||
    direction === "regulated-claims"
  ) {
    return "compliance";
  }
  return "style";
}

function issueTitleForDirection(direction?: CheckDirectionId): string {
  if (direction === "basic") return "纠错";
  if (
    direction === "game-compliance" ||
    direction === "copyright-compliance" ||
    direction === "ad-compliance" ||
    direction === "regulated-claims"
  ) {
    return "合规调整";
  }
  return "改写建议";
}

/**
 * 对比原文与模型全文改写结果，在原文上生成可准确定位的 issue 列表。
 */
export function buildIssuesFromRewriteDiff(
  original: string,
  rewritten: string,
  direction?: CheckDirectionId,
): CheckIssue[] {
  if (original === rewritten) return [];

  const oLines = original.split("\n");
  const rLines = rewritten.split("\n");
  const lineCount = Math.max(oLines.length, rLines.length);
  const issues: CheckIssue[] = [];
  let offset = 0;

  for (let i = 0; i < lineCount; i++) {
    const oLine = oLines[i] ?? "";
    const rLine = rLines[i] ?? "";
    const lineBreakAfter = i < lineCount - 1;

    if (oLine === rLine) {
      offset += oLine.length + (lineBreakAfter ? 1 : 0);
      continue;
    }

    if (!oLine && rLine) {
      offset += lineBreakAfter ? 1 : 0;
      continue;
    }

    if (oLine && !rLine) {
      pushIssue(
        issues,
        original,
        offset,
        offset + oLine.length,
        oLine,
        "",
        direction,
      );
      offset += oLine.length + (lineBreakAfter ? 1 : 0);
      continue;
    }

    const spans = diffSpans(oLine, rLine);
    const bh = spans.beforeHighlight;
    const ah = spans.afterHighlight;

    if (bh && bh[1] > bh[0]) {
      const start = offset + bh[0];
      const end = offset + bh[1];
      const quote = original.slice(start, end);
      const suggestion = ah ? rLine.slice(ah[0], ah[1]) : rLine;
      pushIssue(
        issues,
        original,
        start,
        end,
        quote,
        suggestion,
        direction,
      );
    } else if (oLine !== rLine) {
      const start = offset;
      const end = offset + oLine.length;
      pushIssue(issues, original, start, end, oLine, rLine, direction);
    }

    offset += oLine.length + (lineBreakAfter ? 1 : 0);
  }

  return dedupeIssues(issues);
}

function pushIssue(
  issues: CheckIssue[],
  original: string,
  start: number,
  end: number,
  quote: string,
  suggestion: string,
  direction?: CheckDirectionId,
) {
  if (end <= start && !suggestion) return;
  if (quote === suggestion) return;
  const clampedEnd = Math.min(end, original.length);
  const clampedStart = Math.min(start, clampedEnd);
  const q = original.slice(clampedStart, clampedEnd);
  if (!q && !suggestion) return;

  issues.push({
    id: `d${issues.length + 1}`,
    category: issueCategoryForDirection(direction),
    severity: "medium",
    title: issueTitleForDirection(direction),
    quote: q || quote,
    message: "由全文改写对比自动生成",
    suggestion,
    start: clampedStart,
    end: clampedEnd || clampedStart + q.length,
  });
}

function dedupeIssues(issues: CheckIssue[]): CheckIssue[] {
  const kept: CheckIssue[] = [];
  for (const issue of issues) {
    const overlap = kept.some(
      (k) => issue.start < k.end && issue.end > k.start,
    );
    if (!overlap) kept.push(issue);
  }
  return kept.map((issue, i) => ({ ...issue, id: `d${i + 1}` }));
}

export function buildCheckFromRewrite(
  original: string,
  rewritten: string,
  summary: string,
): CheckResult {
  return {
    summary,
    issues: buildIssuesFromRewriteDiff(original, rewritten),
  };
}
