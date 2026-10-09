import { z } from "zod";

export const translateTargetSchema = z.enum(["zh", "en"]);

export type TranslateTarget = z.infer<typeof translateTargetSchema>;

export function buildTranslatePrompt(text: string, target: TranslateTarget) {
  const targetLabel = target === "zh" ? "简体中文" : "English";

  return `你是专业翻译。将下面正文译为${targetLabel}。

要求：
1. 保留段落换行、emoji、话题标签（#）、括号与标点风格
2. 符合原文体裁与语气：自然、可读，不要翻译腔
3. 只输出译文本身，不要解释、不要 markdown 代码块

正文：
"""
${text}
"""
`;
}
