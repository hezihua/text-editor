import type { CheckDirectionId } from "./check-directions";
import { applyIssueSanityFilter } from "./issue-sanity";
import type { CheckResult } from "./schemas";

/** 基础纠错：丢弃非语法/标点类建议 */
export function applyDirectionIssueFilter(
  check: CheckResult,
  direction: CheckDirectionId,
): CheckResult {
  if (direction !== "basic") return check;

  const issues = check.issues.filter(
    (i) => i.category === "grammar" || i.category === "punctuation",
  );

  if (issues.length === check.issues.length) return check;

  return {
    ...check,
    issues,
    summary:
      issues.length === 0
        ? "未发现明确的语法、拼写或标点错误。"
        : check.summary,
  };
}

/** 方向过滤 + 语义/错位类建议剔除 */
export function finalizeCheckResult(
  check: CheckResult,
  fullText: string,
  direction: CheckDirectionId,
): CheckResult {
  return applyIssueSanityFilter(
    applyDirectionIssueFilter(check, direction),
    fullText,
  );
}
