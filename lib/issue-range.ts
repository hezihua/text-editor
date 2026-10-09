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

/**
 * 在 text 中定位 issue：hint 偏移 → 精确 quote → trim → 模糊窗口。
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

  const exact = findQuoteRange(text, quote);
  if (exact) return exact;

  const trimmed = quote.trim();
  if (trimmed && trimmed !== quote) {
    const t = findQuoteRange(text, trimmed);
    if (t) return t;
  }

  if (trimmed.length >= 4) {
    return findByFuzzyWindow(text, trimmed, fuzzyMinScore);
  }

  return null;
}
