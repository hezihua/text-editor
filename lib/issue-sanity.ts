import type { CheckIssue, CheckResult } from "./schemas";

const GREETING_IN_TEXT =
  /各位|您好|你好|大家好|同事们|同事好|hi\b|hello/i;
const GREETING_TOPIC =
  /问候|称呼|打招呼|寒暄|greeting|salutation/i;
const TITLE_LIKE =
  /^(关于|【|\[)?[^。\n]{2,48}(说明|通知|报告|公告|函|邮件|备忘|情况)/;
const TITLE_SUBJECT =
  /关于|说明|通知|报告|延期|项目|情况|公告|函/;

/** quote 里常见、不应被「润色」整段删掉的事实信息 */
const FACT_TERMS =
  /推迟|延期|上线|迭代|保证|核心|流程|模块|安排|计划|同步|进展|\d+\s*[到至\-—~]\s*\d+\s*周|一到两|两周|一周/;

const CAUSE_TERMS =
  /文档|排查|第三方|联调|工时|接口|不完整|不够详细|比预期|花了|卡住|详细/;
const PLAN_TERMS =
  /接下来|将会|优先|保障|安排|后续|保证|放到下|核心流程|下一迭代|迭代/;

function sentenceCount(text: string): number {
  return text.split(/[。！？；]/).filter((s) => s.trim().length > 0).length;
}

/** 各检查方向通用：title/message 描述的主题与 quote 内容明显不符 */
const TOPIC_QUOTE_RULES: {
  topic: RegExp;
  quoteShould: RegExp;
}[] = [
  { topic: GREETING_TOPIC, quoteShould: GREETING_IN_TEXT },
  {
    topic: /标题|题目|文首|首行|title/i,
    quoteShould: TITLE_SUBJECT,
  },
  {
    topic: /正式|书面|敬语|尊称/i,
    quoteShould: /您|敬|谨|此致|顺祝|各位|同事/,
  },
];

function isTopicQuoteMismatch(issue: CheckIssue): boolean {
  const blob = `${issue.title}\n${issue.message}`;
  const q = issue.quote.trim();
  for (const { topic, quoteShould } of TOPIC_QUOTE_RULES) {
    if (!topic.test(blob)) continue;
    if (!quoteShould.test(q)) {
      if (TITLE_SUBJECT.test(q) || TITLE_LIKE.test(q)) return true;
    }
  }
  return false;
}

/** 建议把标题/主题句改成问候语等，语义严重偏离 */
function isAbsurdTitleToGreetingSwap(issue: CheckIssue): boolean {
  const q = issue.quote.trim();
  const s = issue.suggestion.trim();

  if (isTopicQuoteMismatch(issue)) return true;

  if (TITLE_SUBJECT.test(q) && GREETING_IN_TEXT.test(s) && !TITLE_SUBJECT.test(s)) {
    return true;
  }

  return false;
}

/** 独立标题行被改成与主题无关的内容 */
function isFirstLineTitleDestroyed(
  fullText: string,
  issue: CheckIssue,
): boolean {
  const firstLine = fullText.split("\n").find((l) => l.trim().length > 0)?.trim();
  if (!firstLine) return false;

  const q = issue.quote.trim();
  if (!firstLine.includes(q) && q !== firstLine) return false;

  const looksLikeTitle =
    TITLE_LIKE.test(firstLine) ||
    (firstLine.length <= 48 &&
      !/[。！？；]$/.test(firstLine) &&
      TITLE_SUBJECT.test(firstLine));

  if (!looksLikeTitle) return false;

  const s = issue.suggestion.trim();
  if (GREETING_IN_TEXT.test(s) && !TITLE_SUBJECT.test(s)) return true;
  if (isLowOverlapRewrite(issue) && TITLE_SUBJECT.test(q)) return true;

  return false;
}

/** title 应中文；纯英文 title 多为模型偷懒 */
function isEnglishOnlyTitle(issue: CheckIssue): boolean {
  const t = issue.title.trim();
  if (!t) return false;
  if (/[\u4e00-\u9fff]/.test(t)) return false;
  return /^[a-zA-Z0-9\s\-–—:,.'"]+$/.test(t);
}

/** quote 与 suggestion 几乎无关（长度足够时） */
function isLowOverlapRewrite(issue: CheckIssue): boolean {
  if (issue.quote.length < 8 || issue.suggestion.length < 4) return false;
  const a = [...issue.quote.replace(/\s/g, "")];
  const b = new Set([...issue.suggestion.replace(/\s/g, "")]);
  let shared = 0;
  for (const ch of a) {
    if (b.has(ch)) shared += 1;
  }
  return shared / a.length < 0.25;
}

/**
 * suggestion 整段替换 quote 时删掉过多内容（如重复表达却删掉延期/计划整句）
 */
function isOverDeletionReplacement(issue: CheckIssue): boolean {
  const q = issue.quote.trim();
  const s = issue.suggestion.trim();
  if (q.length < 20) return false;

  const meta = `${issue.title}${issue.message}`;

  if (sentenceCount(q) >= 2 && s.length < q.length * 0.65) {
    return true;
  }

  if (FACT_TERMS.test(q) && !FACT_TERMS.test(s) && s.length < q.length * 0.85) {
    return true;
  }

  if (/重复|冗余|啰嗦|赘述|精简/.test(meta) && s.length < q.length * 0.55) {
    return true;
  }

  if (q.length >= 36 && s.length < q.length * 0.6 && isLowOverlapRewrite(issue)) {
    return true;
  }

  return false;
}

/** quote 跨多句时，单条 issue 极易误删 — 要求拆条或过滤 */
function isOversizedQuoteSpan(issue: CheckIssue): boolean {
  const q = issue.quote.trim();
  if (sentenceCount(q) >= 3) return true;
  if (sentenceCount(q) >= 2 && q.length > 80) return true;
  return false;
}

/** 用已在段首说过的「原因句」替换「计划/安排句」，读下来重复、跳断 */
function isContextRedundantCauseSwap(
  fullText: string,
  issue: CheckIssue,
): boolean {
  const q = issue.quote.trim();
  const s = issue.suggestion.trim();
  const before = fullText.slice(Math.max(0, issue.start - 400), issue.start);

  const causeBefore = CAUSE_TERMS.test(before);
  const planInQuote = PLAN_TERMS.test(q);
  const causeInSuggestion = CAUSE_TERMS.test(s);
  const planInSuggestion = PLAN_TERMS.test(s);

  if (planInQuote && causeInSuggestion && causeBefore && !planInSuggestion) {
    return true;
  }

  if (s.length >= 12 && causeInSuggestion && causeBefore) {
    const sig = s.replace(/\s/g, "").slice(0, 16);
    const beforeCompact = before.replace(/\s/g, "");
    if (sig.length >= 8 && beforeCompact.includes(sig) && !q.includes(sig.slice(0, 6))) {
      return true;
    }
  }

  return false;
}

/** quote 在段中未结束，suggestion 却另起句号，容易与后文拼接不通 */
function isBrokenBoundarySwap(fullText: string, issue: CheckIssue): boolean {
  const q = issue.quote.trim();
  const s = issue.suggestion.trim();
  const after = fullText.slice(issue.end, issue.end + 40).trim();

  if (!after) return false;
  if (/[。！？；]$/.test(q)) return false;
  if (!/[。！？；]$/.test(s)) return false;
  if (/^[，、；：]/.test(after)) return false;

  return /^[\u4e00-\u9fa5a-zA-Z0-9「『（(]/.test(after);
}

export function filterUnsafeIssues(
  issues: CheckIssue[],
  fullText: string,
): CheckIssue[] {
  return issues.filter((issue) => {
    if (isEnglishOnlyTitle(issue)) return false;
    if (isAbsurdTitleToGreetingSwap(issue)) return false;
    if (isFirstLineTitleDestroyed(fullText, issue)) return false;
    if (isTopicQuoteMismatch(issue)) return false;
    if (isOverDeletionReplacement(issue)) return false;
    if (isOversizedQuoteSpan(issue)) return false;
    if (isContextRedundantCauseSwap(fullText, issue)) return false;
    if (isBrokenBoundarySwap(fullText, issue)) return false;
    return true;
  });
}

export function applyIssueSanityFilter(
  check: CheckResult,
  fullText: string,
): CheckResult {
  const issues = filterUnsafeIssues(check.issues, fullText);
  if (issues.length === check.issues.length) return check;
  return { ...check, issues };
}
