import {
  loadReaderLibrary,
  saveReaderLibrary,
  type ReaderArticle,
  type ReaderContainer,
  type ReaderLibrary,
} from "@/lib/reader-library";

const IMPORTED_SEEDS_KEY = "text-editor-reader-imported-seeds";

export type ReaderSeedArticle = {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
  groupKey?: string;
  groupLabel?: string;
};

export type ReaderSeedBundle = {
  slug: string;
  containerName: string;
  source?: string;
  articles: ReaderSeedArticle[];
};

export function getImportedSeedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(IMPORTED_SEEDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

function markSeedImported(slug: string): void {
  const slugs = getImportedSeedSlugs();
  if (slugs.includes(slug)) return;
  localStorage.setItem(
    IMPORTED_SEEDS_KEY,
    JSON.stringify([...slugs, slug]),
  );
}

export function containerIdForSeed(slug: string): string {
  return `seed-${slug}`;
}

export function mergeSeedBundle(
  lib: ReaderLibrary,
  seed: ReaderSeedBundle,
): ReaderLibrary {
  const containerId = containerIdForSeed(seed.slug);
  if (lib.containers.some((c) => c.id === containerId)) {
    markSeedImported(seed.slug);
    return lib;
  }

  const now = Date.now();
  const container: ReaderContainer = {
    id: containerId,
    name: seed.containerName,
    createdAt: now,
  };

  const articles: ReaderArticle[] = seed.articles.map((a) => ({
    id: a.id,
    containerId,
    title: a.title,
    content: a.content,
    savedAt: now,
    updatedAt: now + (seed.articles.length - a.sortOrder),
    groupKey: a.groupKey,
    groupLabel: a.groupLabel,
  }));

  const next: ReaderLibrary = {
    containers: [...lib.containers, container],
    articles: [...lib.articles, ...articles],
  };
  saveReaderLibrary(next);
  markSeedImported(seed.slug);
  return next;
}

export async function ensureReaderSeedFromUrl(
  slug: string,
  url: string,
): Promise<ReaderLibrary | null> {
  if (typeof window === "undefined") return null;

  const lib = loadReaderLibrary();
  const containerId = containerIdForSeed(slug);
  if (lib.containers.some((c) => c.id === containerId)) {
    if (!getImportedSeedSlugs().includes(slug)) markSeedImported(slug);
    return null;
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`阅读器种子 ${slug} 加载失败: ${res.status}`);
    return null;
  }
  const seed = (await res.json()) as ReaderSeedBundle;
  if (seed.slug !== slug || !seed.articles?.length) {
    console.warn(`阅读器种子 ${slug} 格式无效`);
    return null;
  }
  return mergeSeedBundle(lib, seed);
}

export async function ensureAwesomeFdeReaderSeed(): Promise<ReaderLibrary | null> {
  return ensureReaderSeedFromUrl(
    "awesome-fde",
    "/reader-seeds/awesome-fde.json",
  );
}

export async function ensureAiTutorialReaderSeed(): Promise<ReaderLibrary | null> {
  return ensureReaderSeedFromUrl(
    "ai-tutorial",
    "/reader-seeds/ai-tutorial.json",
  );
}

/** 导入内置课程文集（首次访问时写入 localStorage） */
export async function ensureBuiltinReaderSeeds(): Promise<ReaderLibrary | null> {
  let lib = loadReaderLibrary();
  let changed = false;
  for (const run of [ensureAwesomeFdeReaderSeed, ensureAiTutorialReaderSeed]) {
    const next = await run();
    if (next) {
      lib = next;
      changed = true;
    }
  }
  return changed ? lib : null;
}
