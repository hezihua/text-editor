import { z } from "zod";

export const issueCategorySchema = z.enum([
  "grammar",
  "punctuation",
  "clarity",
  "style",
  "platform",
  "compliance",
]);

export const issueSeveritySchema = z.enum(["high", "medium", "low"]);

/** 模型结构化输出（单块正文内的局部偏移） */
export const checkIssueModelSchema = z.object({
  id: z.string().min(1).max(40).optional(),
  category: issueCategorySchema,
  severity: issueSeveritySchema,
  title: z.string().min(1).max(120),
  quote: z.string().min(1).max(2000),
  message: z.string().min(1).max(800),
  suggestion: z.string().min(1).max(2000),
  /** 0-based，相对于当前块正文，左闭右开 */
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().nonnegative().optional(),
});

/** 归一化后返回给前端的 issue（全文偏移 + 稳定 id） */
export const checkIssueSchema = checkIssueModelSchema.extend({
  id: z.string().min(1).max(64),
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
});

export type CheckIssue = z.infer<typeof checkIssueSchema>;

export const checkResultSchema = z.object({
  summary: z.string().min(1).max(500).describe("对全文的一句话总评，中文"),
  issues: z
    .array(checkIssueModelSchema)
    .max(40)
    .describe("问题列表，不宜过多"),
});

export type CheckResultModel = z.infer<typeof checkResultSchema>;

export type CheckResult = {
  summary: string;
  issues: CheckIssue[];
};

export type AnalyzeMeta = {
  durationMs: number;
  chunkCount: number;
  droppedIssueCount: number;
  retryCount: number;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  degraded?: string;
};

export type AnalyzeResponse = {
  check: CheckResult;
  meta?: AnalyzeMeta;
};
