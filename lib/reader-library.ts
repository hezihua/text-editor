const STORAGE_KEY = "text-editor-reader-v1";

export type ReaderContainer = {
  id: string;
  name: string;
  createdAt: number;
};

export type ReaderArticle = {
  id: string;
  containerId: string;
  title: string;
  content: string;
  savedAt: number;
  updatedAt: number;
  /** 侧栏分组（入库时可写入；缺省则按 id/标题推断） */
  groupKey?: string;
  groupLabel?: string;
};

export type ReaderLibrary = {
  containers: ReaderContainer[];
  articles: ReaderArticle[];
};

function newId(): string {
  if (
    typeof window !== "undefined" &&
    typeof globalThis.crypto?.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultLibrary(): ReaderLibrary {
  const id = newId();
  return {
    containers: [{ id, name: "默认文集", createdAt: Date.now() }],
    articles: [],
  };
}

function loadOrInitLibrary(): ReaderLibrary {
  const lib = defaultLibrary();
  saveReaderLibrary(lib);
  return lib;
}

export function loadReaderLibrary(): ReaderLibrary {
  if (typeof window === "undefined") return defaultLibrary();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return loadOrInitLibrary();
    const parsed = JSON.parse(raw) as ReaderLibrary;
    if (!parsed.containers?.length) return loadOrInitLibrary();
    return {
      containers: parsed.containers,
      articles: parsed.articles ?? [],
    };
  } catch {
    return loadOrInitLibrary();
  }
}

export function saveReaderLibrary(lib: ReaderLibrary): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
}

export function createContainer(lib: ReaderLibrary, name: string): ReaderLibrary {
  const trimmed = name.trim();
  if (!trimmed) return lib;
  const container: ReaderContainer = {
    id: newId(),
    name: trimmed,
    createdAt: Date.now(),
  };
  const next = {
    ...lib,
    containers: [...lib.containers, container],
  };
  saveReaderLibrary(next);
  return next;
}

export function deleteContainer(
  lib: ReaderLibrary,
  containerId: string,
): ReaderLibrary {
  const next = {
    containers: lib.containers.filter((c) => c.id !== containerId),
    articles: lib.articles.filter((a) => a.containerId !== containerId),
  };
  if (next.containers.length === 0) {
    const fresh = defaultLibrary();
    saveReaderLibrary(fresh);
    return fresh;
  }
  saveReaderLibrary(next);
  return next;
}

export function saveArticle(
  lib: ReaderLibrary,
  input: {
    containerId: string;
    title: string;
    content: string;
    articleId?: string;
  },
): { library: ReaderLibrary; article: ReaderArticle } {
  const title = input.title.trim() || "未命名文稿";
  const content = input.content;
  const now = Date.now();

  if (input.articleId) {
    const existing = lib.articles.find((a) => a.id === input.articleId);
    if (existing) {
      const article: ReaderArticle = {
        ...existing,
        containerId: input.containerId,
        title,
        content,
        updatedAt: now,
      };
      const library = {
        ...lib,
        articles: lib.articles.map((a) =>
          a.id === article.id ? article : a,
        ),
      };
      saveReaderLibrary(library);
      return { library, article };
    }
  }

  const article: ReaderArticle = {
    id: newId(),
    containerId: input.containerId,
    title,
    content,
    savedAt: now,
    updatedAt: now,
  };
  const library = {
    ...lib,
    articles: [...lib.articles, article],
  };
  saveReaderLibrary(library);
  return { library, article };
}

export function deleteArticle(
  lib: ReaderLibrary,
  articleId: string,
): ReaderLibrary {
  const next = {
    ...lib,
    articles: lib.articles.filter((a) => a.id !== articleId),
  };
  saveReaderLibrary(next);
  return next;
}

export function getArticle(
  lib: ReaderLibrary,
  articleId: string,
): ReaderArticle | undefined {
  return lib.articles.find((a) => a.id === articleId);
}

export function articlesInContainer(
  lib: ReaderLibrary,
  containerId: string,
): ReaderArticle[] {
  return lib.articles
    .filter((a) => a.containerId === containerId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** 从文件名得到展示标题 */
export function titleFromDocumentName(name: string): string {
  return name.replace(/\.(md|markdown|txt)$/i, "").trim() || "未命名文稿";
}
