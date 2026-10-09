import { findQuoteRange } from "./text-patch";

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
