import matter from "gray-matter";

export type ParsedReaderMarkdown = {
  frontmatter: Record<string, unknown>;
  /** 去掉 frontmatter 后的正文，用于目录解析 */
  body: string;
  raw: string;
};

export function parseReaderMarkdown(raw: string): ParsedReaderMarkdown {
  const { data, content } = matter(raw);
  return {
    frontmatter: data as Record<string, unknown>,
    body: content.trim(),
    raw,
  };
}
