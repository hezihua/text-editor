import type { ReaderArticle } from "@/lib/reader-library";

export type ArticleGroupMeta = {
  key: string;
  label: string;
  order: number;
};

export type GroupedReaderArticles = {
  group: ArticleGroupMeta;
  articles: ReaderArticle[];
};

const KNOWN_GROUPS: Record<string, ArticleGroupMeta> = {
  basics: { key: "basics", label: "基础课", order: 1 },
  technical: { key: "technical", label: "技术课", order: 2 },
  cases: { key: "cases", label: "实战案例", order: 3 },
  qa: { key: "qa", label: "Q&A", order: 4 },
  notes: { key: "notes", label: "导览", order: 0 },
  "ml-machine-learning": {
    key: "ml-machine-learning",
    label: "机器学习 · 机器学习",
    order: 10,
  },
  "ml-reinforcement-learning": {
    key: "ml-reinforcement-learning",
    label: "机器学习 · 强化学习",
    order: 11,
  },
  "ml-generative-ai": {
    key: "ml-generative-ai",
    label: "机器学习 · 生成式 AI",
    order: 12,
  },
  "eng-mlops": { key: "eng-mlops", label: "AI 工程化 · MLOps", order: 20 },
  "eng-llm": { key: "eng-llm", label: "AI 工程化 · LLM 工程", order: 21 },
  "eng-infra": {
    key: "eng-infra",
    label: "AI 工程化 · 基础设施",
    order: 22,
  },
  "eng-quality": {
    key: "eng-quality",
    label: "AI 工程化 · 质量保障",
    order: 23,
  },
  misc: { key: "misc", label: "文稿", order: 99 },
};

export function lectureOrderFromTitle(title: string): number {
  const match = title.match(/^(\d{1,2})\s*[·•.\-—]/);
  return match ? parseInt(match[1]!, 10) : 9999;
}

const TITLE_PREFIX = /^\d{1,2}\s*[·•.\-—]\s*/;

/** 去掉标题前的全局序号（如「07 ·」） */
export function stripTitleNumberPrefix(title: string): string {
  return title.replace(TITLE_PREFIX, "").trim() || title;
}

/** 分组内从 01 起显示 */
export function titleInGroupIndex(title: string, indexInGroup: number): string {
  const num = String(indexInGroup + 1).padStart(2, "0");
  const label = stripTitleNumberPrefix(title);
  return `${num} · ${label}`;
}

function inferGroupKey(article: ReaderArticle): string {
  if (article.groupKey) {
    return article.groupKey;
  }

  const id = article.id.toLowerCase();
  if (id.includes("/basics/") || id.includes("/fundamentals/")) return "basics";
  if (id.includes("/q&a/")) return "qa";
  if (id.includes("/cases/")) return "cases";
  if (id.includes("/technical/")) return "technical";

  const num = lectureOrderFromTitle(article.title);
  if (num >= 1 && num <= 6) return "basics";
  if (num >= 7 && num <= 11) return "technical";
  if (num >= 12 && num <= 15) return "cases";
  if (num <= 5 && /q\s*&?\s*a|问答/i.test(article.title)) return "qa";

  return "misc";
}

function groupMetaFor(article: ReaderArticle): ArticleGroupMeta {
  if (article.groupKey && article.groupLabel) {
    const known = KNOWN_GROUPS[article.groupKey];
    return {
      key: article.groupKey,
      label: article.groupLabel,
      order: known?.order ?? 50,
    };
  }
  const key = inferGroupKey(article);
  return KNOWN_GROUPS[key] ?? KNOWN_GROUPS.misc!;
}

function compareArticles(a: ReaderArticle, b: ReaderArticle): number {
  const oa = lectureOrderFromTitle(a.title);
  const ob = lectureOrderFromTitle(b.title);
  if (oa !== ob) return oa - ob;
  return a.title.localeCompare(b.title, "zh-CN");
}

/** 将文集内文章按分组归类并排序（单组时不强制折叠 UI，由组件决定） */
export function groupReaderArticles(
  articles: ReaderArticle[],
): GroupedReaderArticles[] {
  const map = new Map<string, GroupedReaderArticles>();

  for (const article of articles) {
    const group = groupMetaFor(article);
    let entry = map.get(group.key);
    if (!entry) {
      entry = { group, articles: [] };
      map.set(group.key, entry);
    }
    entry.articles.push(article);
  }

  for (const entry of map.values()) {
    entry.articles.sort(compareArticles);
  }

  return [...map.values()].sort((a, b) => a.group.order - b.group.order);
}

export function shouldUseGroupedSidebar(groups: GroupedReaderArticles[]): boolean {
  if (groups.length <= 1) return false;
  if (groups.length === 1 && groups[0]!.group.key === "misc") return false;
  return true;
}
