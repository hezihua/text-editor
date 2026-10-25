import {
  loadReaderLibrary,
  saveReaderLibrary,
  type ReaderArticle,
  type ReaderContainer,
  type ReaderLibrary,
} from "@/lib/reader-library";
import type { ReaderContentManifest } from "@/lib/reader-content-manifest";

const IMPORTED_SEEDS_KEY = "text-editor-reader-imported-seeds";

export type ReaderSeedArticle = {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
  groupKey?: string;
  groupLabel?: string;
  groupSortOrder?: number;
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
    groupSortOrder: a.groupSortOrder,
  }));

  const next: ReaderLibrary = {
    containers: [...lib.containers, container],
    articles: [...lib.articles, ...articles],
  };
  saveReaderLibrary(next);
  markSeedImported(seed.slug);
  return next;
}

/** 从 manifest + 各 .md 文件导入（frontmatter + 正文，非巨型 JSON） */
export async function ensureReaderCollectionFromContent(
  slug: string,
  basePath: string,
): Promise<ReaderLibrary | null> {
  if (typeof window === "undefined") return null;

  const lib = loadReaderLibrary();
  const containerId = containerIdForSeed(slug);
  if (lib.containers.some((c) => c.id === containerId)) {
    if (!getImportedSeedSlugs().includes(slug)) markSeedImported(slug);
    return null;
  }

  const manifestRes = await fetch(`${basePath}/manifest.json`);
  if (!manifestRes.ok) {
    console.warn(`阅读器文集 ${slug} manifest 加载失败: ${manifestRes.status}`);
    return null;
  }
  const manifest = (await manifestRes.json()) as ReaderContentManifest;
  if (manifest.slug !== slug || !manifest.articles?.length) {
    console.warn(`阅读器文集 ${slug} manifest 无效`);
    return null;
  }

  const articlesWithMd = await Promise.all(
    manifest.articles.map(async (meta) => {
      const mdRes = await fetch(`${basePath}/${meta.path}`);
      if (!mdRes.ok) {
        throw new Error(`无法加载 ${meta.path}`);
      }
      const content = await mdRes.text();
      return {
        id: meta.id,
        title: meta.title,
        content,
        sortOrder: meta.sortOrder,
        groupKey: meta.groupKey,
        groupLabel: meta.groupLabel,
        groupSortOrder: meta.groupSortOrder,
      } satisfies ReaderSeedArticle;
    }),
  );

  return mergeSeedBundle(lib, {
    slug: manifest.slug,
    containerName: manifest.containerName,
    source: manifest.source,
    articles: articlesWithMd,
  });
}

/** @deprecated 旧版单文件 JSON 种子 */
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
  return ensureReaderCollectionFromContent(
    "awesome-fde",
    "/reader-content/awesome-fde",
  );
}

export async function ensureAiTutorialReaderSeed(): Promise<ReaderLibrary | null> {
  return ensureReaderCollectionFromContent(
    "ai-tutorial",
    "/reader-content/ai-tutorial",
  );
}

export async function ensureSiluReaderSeed(): Promise<ReaderLibrary | null> {
  return ensureReaderCollectionFromContent("silu", "/reader-content/silu");
}

export async function ensureLeetcodeJournalReaderSeed(): Promise<
  ReaderLibrary | null
> {
  return ensureReaderCollectionFromContent(
    "leetcode-journal",
    "/reader-content/leetcode-journal",
  );
}

/** 导入内置课程文集（首次访问时写入 localStorage） */
export async function ensureBuiltinReaderSeeds(): Promise<ReaderLibrary | null> {
  let lib = loadReaderLibrary();
  let changed = false;
  for (const run of [
    ensureAwesomeFdeReaderSeed,
    ensureAiTutorialReaderSeed,
    ensureSiluReaderSeed,
    ensureLeetcodeJournalReaderSeed,
  ]) {
    const next = await run();
    if (next) {
      lib = next;
      changed = true;
    }
  }
  return changed ? lib : null;
}
