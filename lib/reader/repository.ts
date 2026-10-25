import type { ReaderDocument, ReaderDocumentMeta } from "@/lib/reader/types";

/**
 * 阅读器持久化接口。接入数据库后实现此接口，
 * 页面用 RSC + {@link @/components/mdx-document-server} 直接渲染 `markdown`。
 */
export interface ReaderDocumentRepository {
  getDocument(id: string): Promise<ReaderDocument | null>;
  listDocumentsByContainer(
    containerId: string,
  ): Promise<ReaderDocumentMeta[]>;
}
