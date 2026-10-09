import type { LanguageModelUsage } from "ai";

import type { AnalyzeMeta } from "./schemas";

export type AnalyzeMetrics = {
  event: "analyze";
  ok: boolean;
  durationMs: number;
  direction: string;
  textLength: number;
  chunkCount: number;
  issueCount: number;
  droppedIssueCount: number;
  retryCount: number;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  error?: string;
};

/** 服务端单行 JSON，Vercel / 本地终端可搜 `[analyze-metrics]` */
export function logAnalyzeMetrics(metrics: AnalyzeMetrics) {
  console.info("[analyze-metrics]", JSON.stringify(metrics));
}

/** 侧栏展示用 */
export function formatAnalyzeMeta(meta: AnalyzeMeta, issueCount: number): string {
  const parts: string[] = [
    `耗时 ${(meta.durationMs / 1000).toFixed(1)}s`,
  ];
  if (meta.chunkCount > 1) {
    parts.push(`${meta.chunkCount} 段`);
  }
  parts.push(`${issueCount} 条建议`);
  if (meta.usage?.totalTokens != null) {
    parts.push(`${meta.usage.totalTokens} tokens`);
  }
  if (meta.retryCount > 0) {
    parts.push(`重试 ${meta.retryCount}`);
  }
  if (meta.droppedIssueCount > 0) {
    parts.push(`丢弃 ${meta.droppedIssueCount}`);
  }
  return parts.join(" · ");
}

export function sumUsage(
  a: LanguageModelUsage | undefined,
  b: LanguageModelUsage | undefined,
): LanguageModelUsage | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return {
    ...a,
    inputTokens: (a.inputTokens ?? 0) + (b.inputTokens ?? 0),
    outputTokens: (a.outputTokens ?? 0) + (b.outputTokens ?? 0),
    totalTokens: (a.totalTokens ?? 0) + (b.totalTokens ?? 0),
  };
}

export function usageToMetrics(
  usage: LanguageModelUsage | undefined,
): AnalyzeMetrics["usage"] | undefined {
  if (!usage) return undefined;
  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  };
}
