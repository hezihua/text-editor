/**
 * 将 sibling 仓库的 Markdown 同步到 public/reader-content/{slug}/
 * 结构：manifest.json + 与源仓库一致的 .md 目录树（frontmatter + 正文）
 *
 *   pnpm run reader:sync
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const REPO_ROOT = resolve(process.cwd());
const OUT_ROOT = join(REPO_ROOT, "public", "reader-content");

type ManifestArticle = {
  id: string;
  path: string;
  title: string;
  sortOrder: number;
  groupKey?: string;
  groupLabel?: string;
  groupSortOrder?: number;
};

type CollectionManifest = {
  slug: string;
  containerName: string;
  source: string;
  version: number;
  articles: ManifestArticle[];
};

function parseMdTitle(raw: string, fallback: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) return fallback;
  const fm = match[1]!;
  const titleLine = fm.match(/^title:\s*(.+)\s*$/m);
  if (titleLine) {
    return titleLine[1]!.replace(/^["']|["']$/g, "").trim();
  }
  const body = match[2]!;
  const h1 = body.match(/^#\s+(.+)$/m);
  return h1 ? h1[1]!.trim() : fallback;
}

function copyMd(
  srcFile: string,
  destFile: string,
): string {
  mkdirSync(dirname(destFile), { recursive: true });
  copyFileSync(srcFile, destFile);
  return destFile;
}

function writeManifest(manifest: CollectionManifest) {
  const dir = join(OUT_ROOT, manifest.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf-8",
  );
}

function resetCollection(slug: string) {
  const dir = join(OUT_ROOT, slug);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

function syncAwesomeFde(sourceRoot: string) {
  const slug = "awesome-fde";
  resetCollection(slug);
  const files = [
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
  const group = (rel: string) => {
    if (rel.includes("content/basics/")) return { key: "basics", label: "基础课", order: 1 };
    if (rel.includes("content/technical/")) return { key: "technical", label: "技术课", order: 2 };
    if (rel.includes("content/cases/")) return { key: "cases", label: "实战案例", order: 3 };
    if (rel.includes("content/q&a/")) return { key: "qa", label: "Q&A", order: 4 };
    return { key: "misc", label: "文稿", order: 99 };
  };

  const articles: ManifestArticle[] = [];
  files.forEach((rel, index) => {
    const src = join(sourceRoot, rel);
    if (!existsSync(src)) throw new Error(`缺少 ${src}`);
    const destRel = rel.replace(/^content\//, "");
    const dest = join(OUT_ROOT, slug, destRel);
    copyMd(src, dest);
    const raw = readFileSync(src, "utf-8");
    const prefix = basename(rel).slice(0, 2);
    const title = parseMdTitle(raw, basename(rel, ".md"));
    const display = /^\d{2}$/.test(prefix) ? `${prefix} · ${title}` : title;
    const g = group(rel);
    articles.push({
      id: `awesome-fde:${rel.replace(/\.md$/i, "").replace(/\\/g, "/")}`,
      path: destRel.replace(/\\/g, "/"),
      title: display,
      sortOrder: index,
      groupKey: g.key,
      groupLabel: g.label,
      groupSortOrder: g.order,
    });
  });

  writeManifest({
    slug,
    containerName: "Awesome FDE · 实战训练营笔记",
    source: "https://github.com/hezihua/awesome-fde",
    version: 1,
    articles,
  });
  console.log(`  ${slug}: ${articles.length} 篇`);
}

function syncAiTutorial(sourceRoot: string) {
  const slug = "ai-tutorial";
  resetCollection(slug);
  const courses: {
    relDir: string;
    groupKey: string;
    groupLabel: string;
    groupSortOrder: number;
  }[] = [
    { relDir: "content/notes", groupKey: "notes", groupLabel: "导览", groupSortOrder: 0 },
    { relDir: "content/ml/machine-learning", groupKey: "ml-machine-learning", groupLabel: "机器学习 · 机器学习", groupSortOrder: 10 },
    { relDir: "content/ml/reinforcement-learning", groupKey: "ml-reinforcement-learning", groupLabel: "机器学习 · 强化学习", groupSortOrder: 11 },
    { relDir: "content/ml/generative-ai", groupKey: "ml-generative-ai", groupLabel: "机器学习 · 生成式 AI", groupSortOrder: 12 },
    { relDir: "content/engineering/mlops-basics", groupKey: "eng-mlops", groupLabel: "AI 工程化 · MLOps", groupSortOrder: 20 },
    { relDir: "content/engineering/llm-engineering", groupKey: "eng-llm", groupLabel: "AI 工程化 · LLM 工程", groupSortOrder: 21 },
    { relDir: "content/engineering/ai-infra", groupKey: "eng-infra", groupLabel: "AI 工程化 · 基础设施", groupSortOrder: 22 },
    { relDir: "content/engineering/quality-assurance", groupKey: "eng-quality", groupLabel: "AI 工程化 · 质量保障", groupSortOrder: 23 },
  ];

  const articles: ManifestArticle[] = [];
  let sortOrder = 0;

  for (const course of courses) {
    const srcDir = join(sourceRoot, course.relDir);
    if (!existsSync(srcDir)) continue;
    const files = readdirSync(srcDir)
      .filter((f) => f.endsWith(".md"))
      .sort();
    files.forEach((file, indexInGroup) => {
      const rel = `${course.relDir}/${file}`.replace(/\\/g, "/");
      const src = join(sourceRoot, rel);
      const destRel = rel.replace(/^content\//, "");
      copyMd(src, join(OUT_ROOT, slug, destRel));
      const raw = readFileSync(src, "utf-8");
      const title = parseMdTitle(raw, basename(file, ".md"));
      const num = String(indexInGroup + 1).padStart(2, "0");
      articles.push({
        id: `ai-tutorial:${rel.replace(/\.md$/i, "")}`,
        path: destRel,
        title: `${num} · ${title}`,
        sortOrder: sortOrder++,
        groupKey: course.groupKey,
        groupLabel: course.groupLabel,
        groupSortOrder: course.groupSortOrder,
      });
    });
  }

  writeManifest({
    slug,
    containerName: "AI Tutorial · 机器学习与工程化笔记",
    source: "https://github.com/hezihua/ai-tutorial",
    version: 1,
    articles,
  });
  console.log(`  ${slug}: ${articles.length} 篇`);
}

function syncSilu(sourceRoot: string) {
  const slug = "silu";
  resetCollection(slug);
  const postsDir = join(sourceRoot, "content/posts");
  const files = readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const parsed = files.map((file) => {
    const src = join(postsDir, file);
    const raw = readFileSync(src, "utf-8");
    const date =
      file.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ??
      raw.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)?.[1] ??
      "1970-01-01";
    return { file, src, raw, date };
  });
  parsed.sort((a, b) => a.date.localeCompare(b.date));

  const articles: ManifestArticle[] = [];
  let sortOrder = 0;
  const byMonth = new Map<string, typeof parsed>();
  for (const p of parsed) {
    const key = p.date.slice(0, 7);
    const list = byMonth.get(key) ?? [];
    list.push(p);
    byMonth.set(key, list);
  }

  for (const key of [...byMonth.keys()].sort()) {
    const posts = byMonth.get(key)!;
    const [y, m] = key.split("-");
    const groupLabel = `${y} 年 ${parseInt(m!, 10)} 月`;
    const groupSortOrder = parseInt(`${y}${m}`, 10);
    posts.forEach((post, indexInGroup) => {
      const destRel = `posts/${post.file}`;
      copyMd(post.src, join(OUT_ROOT, slug, destRel));
      const title = parseMdTitle(post.raw, post.file);
      const num = String(indexInGroup + 1).padStart(2, "0");
      articles.push({
        id: `silu:content/posts/${post.file.replace(/\.md$/i, "")}`,
        path: destRel,
        title: `${num} · ${title}`,
        sortOrder: sortOrder++,
        groupKey: `silu-${key}`,
        groupLabel,
        groupSortOrder,
      });
    });
  }

  writeManifest({
    slug,
    containerName: "思录 · 学习与思考",
    source: "https://github.com/hezihua/silu",
    version: 1,
    articles,
  });
  console.log(`  ${slug}: ${articles.length} 篇`);
}

function syncLeetcodeJournal(sourceRoot: string) {
  const slug = "leetcode-journal";
  resetCollection(slug);
  const topics = [
    { dir: "theory", groupKey: "lc-theory", groupLabel: "算法理论", groupSortOrder: 1 },
    { dir: "patterns", groupKey: "lc-patterns", groupLabel: "常用算法", groupSortOrder: 2 },
    { dir: "array", groupKey: "lc-array", groupLabel: "数组", groupSortOrder: 3 },
    { dir: "string", groupKey: "lc-string", groupLabel: "字符串", groupSortOrder: 4 },
    { dir: "linked-list", groupKey: "lc-linked-list", groupLabel: "链表", groupSortOrder: 5 },
    { dir: "stack", groupKey: "lc-stack", groupLabel: "栈", groupSortOrder: 6 },
    { dir: "tree", groupKey: "lc-tree", groupLabel: "二叉树", groupSortOrder: 7 },
  ];

  const articles: ManifestArticle[] = [];
  let sortOrder = 0;

  for (const topic of topics) {
    const srcDir = join(sourceRoot, "content", topic.dir);
    if (!existsSync(srcDir)) continue;
    const files = readdirSync(srcDir)
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => {
        const oa = parseInt(a.match(/^(\d+)-/)?.[1] ?? "999", 10);
        const ob = parseInt(b.match(/^(\d+)-/)?.[1] ?? "999", 10);
        return oa - ob || a.localeCompare(b);
      });

    files.forEach((file, indexInGroup) => {
      const rel = `${topic.dir}/${file}`;
      const src = join(srcDir, file);
      const destRel = rel.replace(/\\/g, "/");
      copyMd(src, join(OUT_ROOT, slug, destRel));
      const raw = readFileSync(src, "utf-8");
      const title = parseMdTitle(raw, file);
      const num = String(indexInGroup + 1).padStart(2, "0");
      const lc = raw.match(/^number:\s*(\d+)\s*$/m)?.[1];
      const display = lc ? `${num} · ${title} (LC ${lc})` : `${num} · ${title}`;
      articles.push({
        id: `leetcode-journal:content/${rel.replace(/\.md$/i, "")}`,
        path: destRel,
        title: display,
        sortOrder: sortOrder++,
        groupKey: topic.groupKey,
        groupLabel: topic.groupLabel,
        groupSortOrder: topic.groupSortOrder,
      });
    });
  }

  writeManifest({
    slug,
    containerName: "LeetCode Journal · 刷题笔记",
    source: "https://github.com/hezihua/leetcode-journal",
    version: 1,
    articles,
  });
  console.log(`  ${slug}: ${articles.length} 篇`);
}

function main() {
  const sibling = (name: string) => resolve(REPO_ROOT, "..", name);

  console.log("同步内置文集 → public/reader-content/");
  syncAwesomeFde(sibling("awesome-fde"));
  syncAiTutorial(sibling("ai-tutorial"));
  syncSilu(sibling("silu"));
  syncLeetcodeJournal(sibling("leetcode-journal"));
  console.log("完成");
}

main();
