/** 内置文集：manifest.json + 目录内 .md（与源仓库 content 结构一致） */

export type ReaderContentManifestArticle = {
  id: string;
  /** 相对文集根路径，如 array/01-two-sum.md */
  path: string;
  title: string;
  sortOrder: number;
  groupKey?: string;
  groupLabel?: string;
  groupSortOrder?: number;
};

export type ReaderContentManifest = {
  slug: string;
  containerName: string;
  source?: string;
  version?: number;
  articles: ReaderContentManifestArticle[];
};

export function readerContentBase(slug: string): string {
  return `/reader-content/${slug}`;
}
