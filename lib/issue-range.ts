import { findByFuzzyWindow, findQuoteRange } from "./text-patch";

export type IssueSpan = {
  quote: string;
  start?: number;
  end?: number;
};

function spansMatchQuote(text: string, start: number, end: number, quote: string) {
  const slice = text.slice(start, end);
  if (slice === quote) return true;
  const located = findQuoteRange(text, quote);
  if (!located) return false;
  return located[0] === start && located[1] === end;
}

/** 优先使用模型给出的偏移，失败则回退到 quote 匹配 */
export function findIssueRange(
  text: string,
  issue: IssueSpan,
): [number, number] | null {
  const { quote, start, end } = issue;
  if (
    start != null &&
    end != null &&
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    end > start &&
    end <= text.length
  ) {
    if (spansMatchQuote(text, start, end, quote)) {
      return [start, end];
    }
    const slice = text.slice(start, end);
    const fromSlice = findQuoteRange(text, slice);
    if (fromSlice && fromSlice[0] === start && fromSlice[1] === end) {
      return [start, end];
    }
  }
  return findQuoteRange(text, quote);
}

/** 将模型给出的偏移规范为块内局部下标（模型偶发返回全文偏移） */
export function normalizeChunkLocalOffsets(
  chunkLength: number,
  chunkOffset: number,
  start?: number,
  end?: number,
): { start?: number; end?: number } {
  if (start == null) return { start, end };

  if (start >= chunkOffset && start < chunkOffset + chunkLength) {
    const localStart = start - chunkOffset;
    if (
      end != null &&
      end > chunkOffset &&
      end <= chunkOffset + chunkLength
    ) {
      return { start: localStart, end: end - chunkOffset };
    }
    return { start: localStart, end };
  }

  if (start >= 0 && start < chunkLength) {
    return { start, end };
  }

  return { start, end };
}

const LIST_MARKER = /^[\s\uFEFF]*(?:[-*+•]|\d+[.)）])\s+/;

export function stripMarkdownListMarker(text: string): string {
  return text.replace(LIST_MARKER, "");
}

/** 模型 quote 与正文常见差异：半角标点、连字符、空白、列表符 */
export function quoteMatchVariants(quote: string): string[] {
  const seen = new Set<string>();
  const add = (s: string) => {
    const t = s.trim();
    if (t && !seen.has(t)) seen.add(t);
  };

  add(quote);
  add(quote.trim());
  add(stripMarkdownListMarker(quote));

  const core = stripMarkdownListMarker(quote).trim();
  if (core) {
    add(`- ${core}`);
    add(`* ${core}`);
  }

  const unified = quote
    .replace(/;/g, "；")
    .replace(/,/g, "，")
    .replace(/:/g, "：")
    .replace(/!/g, "！")
    .replace(/\?/g, "？")
    .replace(/[\u2013\u2014~]/g, "-")
    .replace(/\s+/g, " ");
  add(unified);

  const toAsciiPunct = quote
    .replace(/；/g, ";")
    .replace(/，/g, ",")
    .replace(/：/g, ":")
    .replace(/[\u2013\u2014~至]/g, "-");
  add(toAsciiPunct);
  add(quote.replace(/\s+/g, ""));
  add(quote.replace(/\r?\n/g, ""));

  const collapsed = quote.replace(/\s+/g, " ").trim();
  if (collapsed !== quote) add(collapsed);

  const beforeEllipsis = quote.split(/…|\.{2,}/)[0]?.trim();
  if (beforeEllipsis && beforeEllipsis.length >= 8) {
    add(beforeEllipsis);
  }

  return [...seen];
}

function charOverlapScore(a: string, b: string): number {
  const af = a.replace(/\s/g, "");
  const bf = b.replace(/\s/g, "");
  if (!af.length || !bf.length) return 0;
  let shared = 0;
  const set = new Set([...bf]);
  for (const ch of af) {
    if (set.has(ch)) shared += 1;
  }
  return shared / Math.max(af.length, bf.length);
}

/** 前缀锚定在正文中，再按长度微调，应对模型 quote 尾部略偏 */
function locateByPrefixAnchor(
  text: string,
  quote: string,
): [number, number] | null {
  const q = stripMarkdownListMarker(quote).trim();
  if (q.length < 8) return null;

  const prefixLen = Math.min(16, Math.max(6, Math.floor(q.length * 0.38)));
  const prefix = q.slice(0, prefixLen);
  const idx = text.indexOf(prefix);
  if (idx < 0) return null;

  let best: [number, number] | null = null;
  let bestScore = 0;

  for (let delta = -8; delta <= 24; delta++) {
    const end = Math.min(text.length, idx + q.length + delta);
    if (end <= idx + 4) continue;
    const slice = text.slice(idx, end);
    const score = charOverlapScore(q, slice);
    if (score > bestScore) {
      bestScore = score;
      best = [idx, end];
    }
  }

  return bestScore >= 0.62 ? best : null;
}

/**
 * 在 text 中定位 issue：hint 偏移 → 精确 quote → 标点变体 → 前缀锚定 → 模糊窗口。
 */
export function locateIssueInText(
  text: string,
  quote: string,
  hint?: { start?: number; end?: number },
  fuzzyMinScore = 0.78,
): [number, number] | null {
  if (hint?.start != null || hint?.end != null) {
    const fromHint = findIssueRange(text, { quote, ...hint });
    if (fromHint) return fromHint;
  }

  for (const variant of quoteMatchVariants(quote)) {
    const exact = findQuoteRange(text, variant);
    if (exact) return exact;
  }

  const anchored = locateByPrefixAnchor(text, quote);
  if (anchored) return anchored;

  const trimmed = stripMarkdownListMarker(quote).trim();
  if (trimmed.length >= 4) {
    const minScore =
      trimmed.length > 120
        ? 0.65
        : trimmed.length > 60
          ? 0.7
          : fuzzyMinScore;
    return (
      findByFuzzyWindow(text, trimmed, minScore) ??
      findByFuzzyWindow(text, trimmed.replace(/\s+/g, ""), minScore)
    );
  }

  return null;
}
