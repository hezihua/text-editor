import type { ReaderDocumentRepository } from "@/lib/reader/repository";

const NOT_CONFIGURED =
  "ReaderDocumentRepository: 尚未接入数据库。请实现 lib/reader/repository-db.ts 并在阅读页注入。";

/** 占位实现：接入 Postgres / Drizzle 等后替换为真实查询 */
export const readerDocumentRepository: ReaderDocumentRepository = {
  async getDocument() {
    throw new Error(NOT_CONFIGURED);
  },
  async listDocumentsByContainer() {
    throw new Error(NOT_CONFIGURED);
  },
};
