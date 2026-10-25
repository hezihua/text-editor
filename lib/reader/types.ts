/** 阅读器文档元数据（列表、导航） */
export type ReaderDocumentMeta = {
  id: string;
  containerId: string;
  title: string;
  description?: string;
  tags?: string[];
  savedAt: number;
  updatedAt: number;
};

/**
 * 完整文档。markdown 为源文本，可含 YAML frontmatter（与 awesome-fde 一致）。
 * 入库时建议存 raw markdown 字符串，渲染走 lib/mdx 管道。
 */
export type ReaderDocument = ReaderDocumentMeta & {
  markdown: string;
};
