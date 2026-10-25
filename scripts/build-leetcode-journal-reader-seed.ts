/**
 * 从 sibling 仓库 leetcode-journal 生成阅读器文集种子 JSON。
 *
 *   pnpm run reader:seed-leetcode-journal
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const SOURCE_ROOT =
  process.argv[2] ?? resolve(process.cwd(), "..", "leetcode-journal");

const OUT_PATH = resolve(
  process.cwd(),
  "public",
  "reader-seeds",
  "leetcode-journal.json",
);

type TopicDef = {
  slug: string;
  groupKey: string;
  groupLabel: string;
  groupSortOrder: number;
};

/** 与 leetcode-journal src/app/lib/content.ts 中 topicMetaOverrides 顺序一致 */
const TOPICS: TopicDef[] = [
  {
    slug: "theory",
    groupKey: "lc-theory",
    groupLabel: "算法理论",
    groupSortOrder: 1,
  },
  {
    slug: "patterns",
    groupKey: "lc-patterns",
    groupLabel: "常用算法",
    groupSortOrder: 2,
  },
  {
    slug: "array",
    groupKey: "lc-array",
    groupLabel: "数组",
    groupSortOrder: 3,
  },
  {
    slug: "string",
    groupKey: "lc-string",
    groupLabel: "字符串",
    groupSortOrder: 4,
  },
  {
    slug: "linked-list",
    groupKey: "lc-linked-list",
    groupLabel: "链表",
    groupSortOrder: 5,
  },
  {
    slug: "stack",
    groupKey: "lc-stack",
    groupLabel: "栈",
    groupSortOrder: 6,
  },
  {
    slug: "tree",
    groupKey: "lc-tree",
    groupLabel: "二叉树",
    groupSortOrder: 7,
  },
];

type ParsedFile = {
  title: string;
  body: string;
  leetcodeNumber?: number;
  fileOrder: number;
  fileName: string;
};

function parseMarkdown(raw: string, fileName: string): ParsedFile {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  const orderMatch = fileName.match(/^(\d+)-/);
  const fileOrder = orderMatch ? parseInt(orderMatch[1]!, 10) : 999;

  if (!match) {
    return {
      title: fileName.replace(/\.md$/i, ""),
      body: raw.trim(),
      fileOrder,
      fileName,
    };
  }

  const frontmatter = match[1]!;
  let body = match[2]!.trim();
  const titleLine = frontmatter.match(/^title:\s*(.+)\s*$/m);
  let title = titleLine
    ? titleLine[1]!.replace(/^["']|["']$/g, "").trim()
    : fileName;

  const numLine = frontmatter.match(/^number:\s*(\d+)\s*$/m);
  const leetcodeNumber = numLine ? parseInt(numLine[1]!, 10) : undefined;

  if (!titleLine) {
    const h1 = body.match(/^#\s+(.+)$/m);
    if (h1) {
      title = h1[1]!.trim();
      body = body.replace(/^#\s+.+\n?/m, "").trim();
    }
  }

  return { title, body, leetcodeNumber, fileOrder, fileName };
}

function main() {
  const contentRoot = join(SOURCE_ROOT, "content");
  if (!existsSync(contentRoot)) {
    console.error(
      `找不到 leetcode-journal content: ${contentRoot}\n` +
        "请先 clone https://github.com/hezihua/leetcode-journal",
    );
    process.exit(1);
  }

  let sortOrder = 0;
  const articles: {
    id: string;
    title: string;
    content: string;
    sortOrder: number;
    groupKey: string;
    groupLabel: string;
    groupSortOrder: number;
  }[] = [];

  for (const topic of TOPICS) {
    const dir = join(contentRoot, topic.slug);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".md") && statSync(join(dir, f)).isFile())
      .sort((a, b) => {
        const oa = parseInt(a.match(/^(\d+)-/)?.[1] ?? "999", 10);
        const ob = parseInt(b.match(/^(\d+)-/)?.[1] ?? "999", 10);
        if (oa !== ob) return oa - ob;
        return a.localeCompare(b);
      });

    files.forEach((fileName, indexInGroup) => {
      const full = join(dir, fileName);
      const raw = readFileSync(full, "utf-8");
      const parsed = parseMarkdown(raw, fileName);
      const num = String(indexInGroup + 1).padStart(2, "0");
      const lc =
        parsed.leetcodeNumber != null
          ? ` (LC ${parsed.leetcodeNumber})`
          : "";
      const rel = `content/${topic.slug}/${fileName}`.replace(/\\/g, "/");

      articles.push({
        id: `leetcode-journal:${rel.replace(/\.md$/i, "")}`,
        title: `${num} · ${parsed.title}${lc}`,
        content: parsed.body,
        sortOrder: sortOrder++,
        groupKey: topic.groupKey,
        groupLabel: topic.groupLabel,
        groupSortOrder: topic.groupSortOrder,
      });
    });
  }

  if (articles.length === 0) {
    console.error("未找到题解 markdown");
    process.exit(1);
  }

  const bundle = {
    slug: "leetcode-journal",
    containerName: "LeetCode Journal · 刷题笔记",
    source: "https://github.com/hezihua/leetcode-journal",
    articles,
  };

  mkdirSync(join(OUT_PATH, ".."), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(bundle)}\n`, "utf-8");
  console.log(`已写入 ${articles.length} 篇 → ${OUT_PATH}`);
}

main();
