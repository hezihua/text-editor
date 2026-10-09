/**
 * 回归检查：默认跑离线归一化样例；加 --live 调用真实 LLM（需 .env.local）。
 *
 *   pnpm run check:regression
 *   pnpm run check:regression -- --live
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

import { normalizeChunkCheck } from "../lib/normalize-check";
import { LIVE_FIXTURES, OFFLINE_FIXTURES } from "../lib/regression/fixtures";
import { runCheck } from "../lib/run-check";
import { splitTextIntoChunks } from "../lib/text-chunks";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function runOffline() {
  console.log("— 离线：分块 —");
  const long = "段落一。\n\n".repeat(1500);
  assert(long.length > 5500, `样例长文长度异常: ${long.length}`);
  assert(long.length > 5500, `样例长文长度异常: ${long.length}`);
  const chunks = splitTextIntoChunks(long, 5500);
  assert(chunks.length > 1, "长文应被切成多块");
  assert(
    chunks.every((c, i) => c.index === i && c.offset >= 0),
    "chunk index/offset 应合法",
  );

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

  console.log("— Live：API / runCheck —");
  for (const fx of LIVE_FIXTURES) {
    const { check, meta } = await runCheck({
      text: fx.text,
      direction: fx.direction,
    });
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
