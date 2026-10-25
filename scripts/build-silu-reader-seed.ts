/**
 * 从 sibling 仓库 silu（思录）生成阅读器文集种子 JSON。
 *
 *   pnpm run reader:seed-silu
 *
 * 默认源路径：../silu
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
  process.argv[2] ?? resolve(process.cwd(), "..", "silu");

const OUT_PATH = resolve(
  process.cwd(),
  "public",
  "reader-seeds",
  "silu.json",
);

const POSTS_DIR = "content/posts";

type ParsedPost = {
  title: string;
  body: string;
  date: string;
  fileName: string;
};

function parseMarkdownFile(fullPath: string, fileName: string): ParsedPost {
  const raw = readFileSync(fullPath, "utf-8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) {
    return {
      title: fileName.replace(/\.md$/i, ""),
      body: raw.trim(),
      date: dateFromFileName(fileName) ?? "1970-01-01",
      fileName,
    };
  }

  const frontmatter = match[1]!;
  let body = match[2]!.trim();
  const titleLine = frontmatter.match(/^title:\s*(.+)\s*$/m);
  let title = titleLine
    ? titleLine[1]!.replace(/^["']|["']$/g, "").trim()
    : fileName.replace(/\.md$/i, "");

  const dateLine = frontmatter.match(/^date:\s*(.+)\s*$/m);
  let date =
    normalizeDate(dateLine?.[1]) ?? dateFromFileName(fileName) ?? "1970-01-01";

  if (!titleLine) {
    const h1 = body.match(/^#\s+(.+)$/m);
    if (h1) {
      title = h1[1]!.trim();
      body = body.replace(/^#\s+.+\n?/m, "").trim();
    }
  } else {
    const h1 = body.match(/^#\s+(.+)$/m);
    if (h1 && h1[1]!.trim() === title) {
      body = body.replace(/^#\s+.+\n?/m, "").trim();
    }
  }

  return { title, body, date, fileName };
}

function normalizeDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const s = raw.trim().replace(/^["']|["']$/g, "");
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m?.[1];
}

function dateFromFileName(fileName: string): string | undefined {
  const m = fileName.match(/^(\d{4}-\d{2}-\d{2})-/);
  return m?.[1];
}

function monthGroup(date: string): {
  groupKey: string;
  groupLabel: string;
  groupSortOrder: number;
} {
  const m = date.match(/^(\d{4})-(\d{2})/);
  if (!m) {
    return {
      groupKey: "silu-undated",
      groupLabel: "未标注日期",
      groupSortOrder: 0,
    };
  }
  const year = m[1]!;
  const month = m[2]!;
  return {
    groupKey: `silu-${year}-${month}`,
    groupLabel: `${year} 年 ${parseInt(month, 10)} 月`,
    groupSortOrder: parseInt(`${year}${month}`, 10),
  };
}

function main() {
  const postsPath = join(SOURCE_ROOT, POSTS_DIR);
  if (!existsSync(postsPath)) {
    console.error(
      `找不到 silu 文章目录: ${postsPath}\n` +
        "请先 clone https://github.com/hezihua/silu 到同级目录。",
    );
    process.exit(1);
  }

  const files = readdirSync(postsPath)
    .filter((f) => f.endsWith(".md") && statSync(join(postsPath, f)).isFile())
    .sort();

  const parsed = files.map((f) =>
    parseMarkdownFile(join(postsPath, f), f),
  );

  parsed.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const byMonth = new Map<string, ParsedPost[]>();
  for (const post of parsed) {
    const { groupKey } = monthGroup(post.date);
    const list = byMonth.get(groupKey) ?? [];
    list.push(post);
    byMonth.set(groupKey, list);
  }

  const monthKeys = [...byMonth.keys()].sort((a, b) => {
    const ga = monthGroup(byMonth.get(a)![0]!.date);
    const gb = monthGroup(byMonth.get(b)![0]!.date);
    return ga.groupSortOrder - gb.groupSortOrder;
  });

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

  for (const monthKey of monthKeys) {
    const posts = byMonth.get(monthKey)!;
    const { groupKey, groupLabel, groupSortOrder } = monthGroup(
      posts[0]!.date,
    );
    posts.forEach((post, indexInGroup) => {
      const num = String(indexInGroup + 1).padStart(2, "0");
      const rel = `${POSTS_DIR}/${post.fileName}`.replace(/\\/g, "/");
      articles.push({
        id: `silu:${rel.replace(/\.md$/i, "")}`,
        title: `${num} · ${post.title}`,
        content: post.body,
        sortOrder: sortOrder++,
        groupKey,
        groupLabel,
        groupSortOrder,
      });
    });
  }

  const bundle = {
    slug: "silu",
    containerName: "思录 · 学习与思考",
    source: "https://github.com/hezihua/silu",
    articles,
  };

  mkdirSync(join(OUT_PATH, ".."), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(bundle)}\n`, "utf-8");
  console.log(`已写入 ${articles.length} 篇 → ${OUT_PATH}`);
}

main();
