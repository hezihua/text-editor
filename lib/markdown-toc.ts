export type MarkdownHeading = {
  id: string;
  text: string;
  depth: number;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeMarkdownLines(markdown: string): string[] {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");
}

/** 从 Markdown 源码解析 h2/h3，生成与正文标题一致的 id */
export function parseMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const lines = normalizeMarkdownLines(markdown);
  const headings: MarkdownHeading[] = [];
  const slugCounts = new Map<string, number>();

  for (const line of lines) {
    const match = line.trimEnd().match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const depth = match[1]!.length;
    const rawText = match[2]!.trim();
    const cleanText = rawText
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();

    let id = slugify(cleanText || rawText);
    if (!id) continue;

    const count = slugCounts.get(id) ?? 0;
    slugCounts.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    headings.push({ id, text: cleanText || rawText, depth });
  }

  return headings;
}
