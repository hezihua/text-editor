import type { LanguageModelUsage } from "ai";

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

export function logAnalyzeMetrics(metrics: AnalyzeMetrics) {
  console.info(JSON.stringify(metrics));
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
