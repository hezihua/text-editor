/**
 * 从 sibling 仓库 ai-tutorial 生成阅读器文集种子 JSON。
 *
 *   pnpm run reader:seed-ai-tutorial
 *
 * 默认源路径：../ai-tutorial
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const SOURCE_ROOT =
  process.argv[2] ?? resolve(process.cwd(), "..", "ai-tutorial");

const OUT_PATH = resolve(
  process.cwd(),
  "public",
  "reader-seeds",
  "ai-tutorial.json",
);

type CourseDef = {
  track: "ml" | "engineering" | "notes";
  courseSlug: string;
  groupKey: string;
  groupLabel: string;
  groupOrder: number;
};

const COURSES: CourseDef[] = [
  {
    track: "notes",
    courseSlug: ".",
    groupKey: "notes",
    groupLabel: "导览",
    groupOrder: 0,
  },
  {
    track: "ml",
    courseSlug: "machine-learning",
    groupKey: "ml-machine-learning",
    groupLabel: "机器学习 · 机器学习",
    groupOrder: 10,
  },
  {
    track: "ml",
    courseSlug: "reinforcement-learning",
    groupKey: "ml-reinforcement-learning",
    groupLabel: "机器学习 · 强化学习",
    groupOrder: 11,
  },
  {
    track: "ml",
    courseSlug: "generative-ai",
    groupKey: "ml-generative-ai",
    groupLabel: "机器学习 · 生成式 AI",
    groupOrder: 12,
  },
  {
    track: "engineering",
    courseSlug: "mlops-basics",
    groupKey: "eng-mlops",
    groupLabel: "AI 工程化 · MLOps",
    groupOrder: 20,
  },
  {
    track: "engineering",
    courseSlug: "llm-engineering",
    groupKey: "eng-llm",
    groupLabel: "AI 工程化 · LLM 工程",
    groupOrder: 21,
  },
  {
    track: "engineering",
    courseSlug: "ai-infra",
    groupKey: "eng-infra",
    groupLabel: "AI 工程化 · 基础设施",
    groupOrder: 22,
  },
  {
    track: "engineering",
    courseSlug: "quality-assurance",
    groupKey: "eng-quality",
    groupLabel: "AI 工程化 · 质量保障",
    groupOrder: 23,
  },
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
    title = titleLine[1]!.replace(/^["']|["']$/g, "").trim();
  }
  if (!title) {
    const h1 = body.match(/^#\s+(.+)$/m);
    if (h1) title = h1[1]!.trim();
  }
  return { title, body };
}

function fileOrder(name: string): number {
  const numPrefix = name.match(/^(\d+)-/);
  if (numPrefix) return parseInt(numPrefix[1]!, 10);
  const genai = name.match(/lihongyi_genai_lecture(\d+)/i);
  if (genai) return parseInt(genai[1]!, 10);
  return 999;
}

function listMarkdownFiles(course: CourseDef): string[] {
  const dir =
    course.track === "notes"
      ? join(SOURCE_ROOT, "content", "notes")
      : join(SOURCE_ROOT, "content", course.track, course.courseSlug);

  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && statSync(join(dir, f)).isFile())
    .sort((a, b) => {
      const oa = fileOrder(a);
      const ob = fileOrder(b);
      if (oa !== ob) return oa - ob;
      return a.localeCompare(b);
    });
}

function relPath(course: CourseDef, fileName: string): string {
  if (course.track === "notes") {
    return `content/notes/${fileName}`;
  }
  return `content/${course.track}/${course.courseSlug}/${fileName}`;
}

function main() {
  if (!existsSync(SOURCE_ROOT)) {
    console.error(
      `找不到 ai-tutorial 源目录: ${SOURCE_ROOT}\n` +
        "请先 clone https://github.com/hezihua/ai-tutorial 到同级目录。",
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
  }[] = [];

  for (const course of COURSES) {
    const files = listMarkdownFiles(course);
    let indexInGroup = 0;
    for (const file of files) {
      const rel = relPath(course, file);
      const full = join(SOURCE_ROOT, rel);
      const raw = readFileSync(full, "utf-8");
      const fallback = basename(file, ".md");
      const { title, body } = parseMarkdown(raw, fallback);
      const num = String(indexInGroup + 1).padStart(2, "0");
      indexInGroup++;

      articles.push({
        id: `ai-tutorial:${rel.replace(/\.md$/i, "").replace(/\\/g, "/")}`,
        title: `${num} · ${title}`,
        content: body,
        sortOrder: sortOrder++,
        groupKey: course.groupKey,
        groupLabel: course.groupLabel,
      });
    }
  }

  if (articles.length === 0) {
    console.error("未找到任何 markdown 文件");
    process.exit(1);
  }

  const bundle = {
    slug: "ai-tutorial",
    containerName: "AI Tutorial · 机器学习与工程化笔记",
    source: "https://github.com/hezihua/ai-tutorial",
    articles,
  };

  mkdirSync(join(OUT_PATH, ".."), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(bundle)}\n`, "utf-8");
  console.log(`已写入 ${articles.length} 篇 → ${OUT_PATH}`);
}

main();
