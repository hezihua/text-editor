import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { checkDirectionIdSchema } from "@/lib/check-directions";
import { getLanguageModel } from "@/lib/llm";
import { buildCheckPrompt } from "@/lib/prompts";
import { checkResultSchema, type AnalyzeResponse } from "@/lib/schemas";

const requestSchema = z.object({
  text: z.string().min(20, "正文至少 20 字").max(12000),
  direction: checkDirectionIdSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());
    const model = getLanguageModel();

    const { output } = await generateText({
      model,
      output: Output.object({ schema: checkResultSchema }),
      prompt: buildCheckPrompt(body.text, body.direction ?? "basic"),
    });

    if (!output) {
      return NextResponse.json(
        { error: "检查未返回有效结果，请重试" },
        { status: 502 },
      );
    }

    const result: AnalyzeResponse = { check: output };
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "分析失败，请稍后重试";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
