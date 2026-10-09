import { z } from "zod";

export const checkResultSchema = z.object({
  summary: z.string().describe("对全文的一句话总评，中文"),
  issues: z.array(
    z.object({
      id: z.string(),
      category: z.enum([
        "grammar",
        "punctuation",
        "clarity",
        "style",
        "platform",
        "compliance",
      ]),
      severity: z.enum(["high", "medium", "low"]),
      title: z
        .string()
        .describe("简短问题标题，如「时间状语后缺少逗号」「用词错误」"),
      quote: z
        .string()
        .describe("原文中需要指出的片段，必须与用户正文完全一致"),
      message: z.string().describe("问题说明"),
      suggestion: z
        .string()
        .describe("替换 quote 后的完整片段，应用时会写入正文"),
    }),
  ),
});

export type CheckResult = z.infer<typeof checkResultSchema>;

export type AnalyzeResponse = {
  check: CheckResult;
};
