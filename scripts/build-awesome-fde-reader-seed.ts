/**
 * 从 sibling 仓库 awesome-fde 生成阅读器文集种子 JSON。
 *
 *   pnpm run reader:seed-awesome-fde
 *
 * 默认源路径：../awesome-fde（与 text-editor 同级）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const SOURCE_ROOT =
  process.argv[2] ??
  resolve(process.cwd(), "..", "awesome-fde");

const OUT_PATH = resolve(
  process.cwd(),
  "public",
  "reader-seeds",
  "awesome-fde.json",
);

function groupForPath(rel: string): { groupKey: string; groupLabel: string } {
  if (rel.includes("content/basics/")) {
    return { groupKey: "basics", groupLabel: "基础课" };
  }
  if (rel.includes("content/technical/")) {
    return { groupKey: "technical", groupLabel: "技术课" };
  }
  if (rel.includes("content/cases/")) {
    return { groupKey: "cases", groupLabel: "实战案例" };
  }
  if (rel.includes("content/q&a/")) {
    return { groupKey: "qa", groupLabel: "Q&A" };
  }
  return { groupKey: "misc", groupLabel: "文稿" };
}

const ARTICLE_FILES: string[] = [
  "content/basics/fundamentals/01-opening-and-market.md",
  "content/basics/fundamentals/02-model-and-product.md",
  "content/basics/fundamentals/03-data-governance.md",
  "content/basics/fundamentals/04-organization-process.md",
  "content/basics/fundamentals/05-business-model.md",
  "content/basics/fundamentals/06-legal-compliance.md",
  "content/technical/practice/07-tech-terms.md",
  "content/technical/practice/08-knowledge-base-101.md",
  "content/technical/practice/09-rag-practice.md",
  "content/technical/practice/10-workflow.md",
  "content/technical/practice/11-agent-delivery.md",
  "content/cases/delivery/12-xiaohongshu-case.md",
  "content/cases/delivery/13-wan-yuan-case.md",
  "content/cases/delivery/14-shi-wan-case.md",
  "content/cases/delivery/15-presales-and-crm.md",
  "content/q&a/00-qa-original.md",
  "content/q&a/01-business-and-organization.md",
  "content/q&a/02-discovery-and-delivery.md",
  "content/q&a/03-knowledge-and-data.md",
  "content/q&a/04-agents-and-automation.md",
  "content/q&a/05-pilot-and-operations.md",
];

type ParsedMd = { title: string; body: string };

function parseMarkdown(raw: string, fallbackTitle: string): ParsedMd {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) {
    return { title: fallbackTitle, body: raw.trim() };
  }
  const frontmatter = match[1]!;
  const body = match[2]!.trim();
  const titleLine = frontmatter.match(/^title:\s*(.+)\s*$/m);
  let title = fallbackTitle;
  if (titleLine) {
    title = titleLine[1]!
      .replace(/^["']|["']$/g, "")
      .trim();
  }
  return { title, body };
}

function slugFromPath(relativePath: string): string {
  return relativePath.replace(/\.md$/i, "").replace(/\\/g, "/");
}

function main() {
  if (!existsSync(SOURCE_ROOT)) {
    console.error(
      `找不到 awesome-fde 源目录: ${SOURCE_ROOT}\n` +
        "请先 clone https://github.com/hezihua/awesome-fde 到同级目录，或传入路径参数。",
    );
    process.exit(1);
  }

  const articles = ARTICLE_FILES.map((rel, index) => {
    const full = join(SOURCE_ROOT, rel);
    if (!existsSync(full)) {
      throw new Error(`缺少文件: ${full}`);
    }
    const raw = readFileSync(full, "utf-8");
    const fileSlug = slugFromPath(rel);
    const prefix = basename(rel).replace(/\.md$/i, "").slice(0, 2);
    const { title, body } = parseMarkdown(
      raw,
      titleFromSlug(basename(rel, ".md")),
    );
    const displayTitle = /^\d{2}$/.test(prefix)
      ? `${prefix} · ${title}`
      : title;

    const { groupKey, groupLabel } = groupForPath(rel);
    return {
      id: `awesome-fde:${fileSlug}`,
      title: displayTitle,
      content: body,
      sortOrder: index,
      groupKey,
      groupLabel,
    };
  });

  const bundle = {
    slug: "awesome-fde",
    containerName: "Awesome FDE · 实战训练营笔记",
    source: "https://github.com/hezihua/awesome-fde",
    articles,
  };

  mkdirSync(join(OUT_PATH, ".."), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(bundle)}\n`, "utf-8");
  console.log(`已写入 ${articles.length} 篇 → ${OUT_PATH}`);
}

function titleFromSlug(slug: string): string {
  return slug
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

main();
