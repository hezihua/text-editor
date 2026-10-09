import { findIssueRange } from "./issue-range";
import type { IssueSpan } from "./issue-range";

/** 匹配时视为等价的引号 */
const QUOTE_EQUIV = new Set([
  '"',
  "'",
  "\u201c",
  "\u201d",
  "\u2018",
  "\u2019",
  "「",
  "」",
  "『",
  "』",
  "《",
  "》",
]);

function normalizeMatchChar(ch: string): string | null {
  if (/\s/.test(ch)) return null;
  if (QUOTE_EQUIV.has(ch)) return '"';
  const code = ch.charCodeAt(0);
  if (code >= 0xff01 && code <= 0xff5e) {
    return String.fromCharCode(code - 0xff00 + 0x20);
  }
  return ch;
}

/** 压缩空白与统一标点，并记录每个匹配字符在原文中的下标 */
function toMatchForm(text: string): { form: string; toOrig: number[] } {
  let form = "";
  const toOrig: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const n = normalizeMatchChar(text[i]!);
    if (n === null) continue;
    form += n;
    toOrig.push(i);
  }
  return { form, toOrig };
}

function rangeFromFormMatch(
  toOrig: number[],
  formStart: number,
  formLen: number,
): [number, number] {
  const start = toOrig[formStart]!;
  const end = toOrig[formStart + formLen - 1]! + 1;
  return [start, end];
}

function findByNormalizedForm(
  text: string,
  quote: string,
): [number, number] | null {
  const textF = toMatchForm(text);
  const quoteF = toMatchForm(quote);
  if (!quoteF.form.length) return null;

  const idx = textF.form.indexOf(quoteF.form);
  if (idx >= 0) {
    return rangeFromFormMatch(textF.toOrig, idx, quoteF.form.length);
  }
  return null;
}

function findByFuzzyWindow(
  text: string,
  quote: string,
  minScore = 0.82,
): [number, number] | null {
  const quoteF = toMatchForm(quote);
  const textF = toMatchForm(text);
  const qLen = quoteF.form.length;
  if (qLen < 4) return null;

  let best: { start: number; len: number; score: number } | null = null;

  for (let len = qLen; len <= Math.min(qLen + 8, textF.form.length); len++) {
    for (let i = 0; i <= textF.form.length - len; i++) {
      let match = 0;
      const compareLen = Math.min(len, qLen);
      for (let j = 0; j < compareLen; j++) {
        if (textF.form[i + j] === quoteF.form[j]) match += 1;
      }
      const score = match / qLen;
      if (score >= minScore && (!best || score > best.score)) {
        best = { start: i, len, score };
      }
    }
  }

  if (!best) return null;
  return rangeFromFormMatch(textF.toOrig, best.start, best.len);
}

export function findQuoteRange(
  text: string,
  quote: string,
): [number, number] | null {
  const candidates = [quote, quote.trim()];
  const seen = new Set<string>();

  for (const q of candidates) {
    if (!q || seen.has(q)) continue;
    seen.add(q);

    const exact = text.indexOf(q);
    if (exact >= 0) return [exact, exact + q.length];

    const normalized = findByNormalizedForm(text, q);
    if (normalized) return normalized;
  }

  const trimmed = quote.trim();
  if (trimmed.length >= 4) {
    const fuzzy = findByFuzzyWindow(text, trimmed);
    if (fuzzy) return fuzzy;
  }

  return null;
}

export function sliceByQuote(text: string, quote: string): string | null {
  const range = findQuoteRange(text, quote);
  if (!range) return null;
  return text.slice(range[0], range[1]);
}

export function lineNumberAt(text: string, offset: number): number {
  if (offset <= 0) return 1;
  return text.slice(0, offset).split("\n").length;
}

export function applyReplacement(
  text: string,
  quote: string,
  replacement: string,
  span?: Pick<IssueSpan, "start" | "end">,
): { next: string; ok: boolean } {
  const range = span
    ? findIssueRange(text, { quote, ...span })
    : findQuoteRange(text, quote);
  if (!range) return { next: text, ok: false };
  const [start, end] = range;
  return {
    next: text.slice(0, start) + replacement + text.slice(end),
    ok: true,
  };
}

export type PatchItem = {
  id: string;
  quote: string;
  suggestion: string;
  start?: number;
  end?: number;
};

/** 从后往前应用，避免前面的替换影响后面定位 */
export function applyAllReplacements(
  text: string,
  items: PatchItem[],
): { next: string; appliedIds: string[]; failedIds: string[] } {
  const appliedIds: string[] = [];
  const failedIds: string[] = [];

  const sortable: { item: PatchItem; start: number }[] = [];
  for (const item of items) {
    const range = findIssueRange(text, item);
    if (!range) {
      failedIds.push(item.id);
      continue;
    }
    sortable.push({ item, start: range[0] });
  }

  sortable.sort((a, b) => b.start - a.start);

  let next = text;
  for (const { item } of sortable) {
    const result = applyReplacement(
      next,
      item.quote,
      item.suggestion,
      item,
    );
    if (result.ok) {
      next = result.next;
      appliedIds.push(item.id);
    } else {
      failedIds.push(item.id);
    }
  }

  return { next, appliedIds, failedIds };
}

/** 找出 quote 与 replacement 的差异区间，用于 diff 高亮 */
export function diffSpans(
  before: string,
  after: string,
): {
  beforeHighlight: [number, number] | null;
  afterHighlight: [number, number] | null;
} {
  let prefix = 0;
  const minLen = Math.min(before.length, after.length);
  while (
    prefix < minLen &&
    before.charCodeAt(prefix) === after.charCodeAt(prefix)
  ) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < minLen - prefix &&
    before.charCodeAt(before.length - 1 - suffix) ===
      after.charCodeAt(after.length - 1 - suffix)
  ) {
    suffix += 1;
  }
  const beforeEnd = before.length - suffix;
  const afterEnd = after.length - suffix;
  if (prefix >= beforeEnd && prefix >= afterEnd) {
    return { beforeHighlight: null, afterHighlight: null };
  }
  return {
    beforeHighlight: [prefix, beforeEnd],
    afterHighlight: [prefix, afterEnd],
  };
}
