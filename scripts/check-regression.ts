/**
 * 回归检查：默认跑离线归一化样例；加 --live 调用真实 LLM（需 .env.local）。
 *
 *   pnpm run check:regression
 *   pnpm run check:regression -- --live
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

import { buildIssuesFromRewriteDiff } from "../lib/diff-to-issues";
import { filterUnsafeIssues } from "../lib/issue-sanity";
import { normalizeChunkCheck } from "../lib/normalize-check";
import { LIVE_FIXTURES, OFFLINE_FIXTURES } from "../lib/regression/fixtures";
import { runRewriteCheck } from "../lib/run-rewrite";
import { splitTextIntoChunks } from "../lib/text-chunks";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function runOffline() {
  console.log("— 离线：分块 —");
  const long = "段落一。\n\n".repeat(1500);
  assert(long.length > 5500, `样例长文长度异常: ${long.length}`);
  const chunks = splitTextIntoChunks(long, 5500);
  assert(chunks.length > 1, "长文应被切成多块");
  assert(
    chunks.every((c, i) => c.index === i && c.offset >= 0),
    "chunk index/offset 应合法",
  );

  console.log("— 离线：rewrite diff —");
  const before = "各位同事好。\n\n接下来我们会优先保证核心流程。";
  const after = "大家好。\n\n接下来会优先保障核心流程。";
  const diffIssues = buildIssuesFromRewriteDiff(before, after);
  assert(diffIssues.length >= 2, "应对每处差异生成 issue");
  assert(
    before.slice(diffIssues[0]!.start, diffIssues[0]!.end) ===
      diffIssues[0]!.quote,
    "diff issue 偏移应准确",
  );
  console.log("  ✓ diff-to-issues");

  console.log("— 离线：语义 sanity —");
  const sampleDoc =
    "关于项目延期的情况说明\n\n各位同事好，写这封信是想同步一下项目进展。";
  const bad = filterUnsafeIssues(
    [
      {
        id: "x",
        category: "style",
        severity: "medium",
        title: "Formal greeting",
        quote: "关于项目延期",
        message: "Use a casual greeting",
        suggestion: "大家好",
        start: 0,
        end: 6,
      },
    ],
    sampleDoc,
  );
  assert(bad.length === 0, "应过滤标题/问候错位建议");
  console.log("  ✓ title-greeting mismatch");

  const overDelete = filterUnsafeIssues(
    [
      {
        id: "y",
        category: "clarity",
        severity: "medium",
        title: "重复表达",
        quote:
          "占用了我们不少工时。按照现在的节奏，整体上线可能会推迟一到两周。接下来我们会优先保证核心流程可用，非核心模块放到下一迭代。",
        message: "表述重复，可精简",
        suggestion:
          "但接口联调时，由于文档不完整，排查工作比预期多花了我们不少时间。",
        start: 0,
        end: 80,
      },
    ],
    sampleDoc,
  );
  assert(overDelete.length === 0, "应过滤整段删改导致丢信息的建议");
  console.log("  ✓ over-deletion replacement");

  const delayDoc =
    "目前前端已完成，但接口联调比预期久，主要是第三方登录文档不完整，排查占用了不少工时。\n\n接下来我们会优先保证核心流程可用，非核心模块放到下一迭代。";
  const redundantCause = filterUnsafeIssues(
    [
      {
        id: "z",
        category: "style",
        severity: "medium",
        title: "技术描述口语化",
        quote: "接下来我们会优先保证核心流程可用，非核心模块放到下一",
        message: "技术细节可更口语",
        suggestion: "迭代。主要卡在第三方登录文档不够详细，排查花了挺多时间。",
        start: delayDoc.indexOf("接下来"),
        end: delayDoc.indexOf("接下来") + "接下来我们会优先保证核心流程可用，非核心模块放到下一".length,
      },
    ],
    delayDoc,
  );
  assert(redundantCause.length === 0, "应过滤计划句被重复原因句替换");
  console.log("  ✓ redundant-cause swap");

  console.log("— 离线：归一化样例 —");
  for (const fx of OFFLINE_FIXTURES) {
    const result = normalizeChunkCheck(
      fx.raw,
      {
        index: 0,
        text: fx.chunkText,
        offset: fx.chunkOffset,
      },
      fx.fullText,
    );
    assert(
      result.check.issues.length === fx.expectIssueCount,
      `${fx.name}: 期望 ${fx.expectIssueCount} 条，实际 ${result.check.issues.length}（丢弃 ${result.dropped}）`,
    );
    for (const cat of fx.expectCategories) {
      assert(
        result.check.issues.some((i) => i.category === cat),
        `${fx.name}: 缺少类别 ${cat}`,
      );
    }
    for (const issue of result.check.issues) {
      const slice = fx.fullText.slice(issue.start, issue.end);
      assert(
        slice.length > 0,
        `${fx.name}: issue ${issue.id} 偏移无效`,
      );
    }
    console.log(`  ✓ ${fx.name}`);
  }
}

async function runLive() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("跳过 live：未设置 OPENAI_API_KEY");
    return;
  }

  console.log("— Live：runRewriteCheck —");
  for (const fx of LIVE_FIXTURES) {
    const { check, meta } = await runRewriteCheck(fx.text, fx.direction);
    const min = fx.minIssues ?? 1;
    assert(
      check.issues.length >= min,
      `${fx.name}: 期望至少 ${min} 条 issue，实际 ${check.issues.length}`,
    );
    const cats = new Set(check.issues.map((i) => i.category));
    const hit = fx.expectAnyCategory.some((c) => cats.has(c));
    assert(hit, `${fx.name}: 未命中期望类别 ${fx.expectAnyCategory.join(",")}`);
    for (const issue of check.issues) {
      const slice = fx.text.slice(issue.start, issue.end);
      assert(
        slice === issue.quote,
        `${fx.name}: issue ${issue.id} quote 与偏移不一致`,
      );
    }
    console.log(
      `  ✓ ${fx.name} (${check.issues.length} issues, ${meta.durationMs}ms, chunks=${meta.chunkCount})`,
    );
  }
}

async function main() {
  const live = process.argv.includes("--live");
  runOffline();
  if (live) await runLive();
  console.log("\n全部回归通过。");
}

main().catch((e) => {
  console.error("\n回归失败:", e instanceof Error ? e.message : e);
  process.exit(1);
});
