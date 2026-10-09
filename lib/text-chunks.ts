export type TextChunk = {
  index: number;
  text: string;
  /** 该块在全文中的起始字符下标（UTF-16） */
  offset: number;
};

const DEFAULT_MAX = 5500;

/**
 * 按段落优先切分，保证每块不超过 maxChars，便于分批调用模型。
 */
export function splitTextIntoChunks(
  text: string,
  maxChars = DEFAULT_MAX,
): TextChunk[] {
  if (text.length <= maxChars) {
    return [{ index: 0, text, offset: 0 }];
  }

  const chunks: TextChunk[] = [];
  let offset = 0;
  let index = 0;

  while (offset < text.length) {
    const remaining = text.length - offset;
    if (remaining <= maxChars) {
      chunks.push({ index, text: text.slice(offset), offset });
      break;
    }

    let cut = offset + maxChars;
    const window = text.slice(offset, cut);
    const paraBreak = window.lastIndexOf("\n\n");
    const lineBreak = window.lastIndexOf("\n");
    const sentenceBreak = Math.max(
      window.lastIndexOf("。"),
      window.lastIndexOf("！"),
      window.lastIndexOf("？"),
      window.lastIndexOf("；"),
    );

    let localCut = maxChars;
    if (paraBreak > maxChars * 0.35) localCut = paraBreak + 2;
    else if (lineBreak > maxChars * 0.35) localCut = lineBreak + 1;
    else if (sentenceBreak > maxChars * 0.25) localCut = sentenceBreak + 1;

    const piece = text.slice(offset, offset + localCut);
    chunks.push({ index, text: piece, offset });
    offset += localCut;
    index += 1;
  }

  return chunks;
}
