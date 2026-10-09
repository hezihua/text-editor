import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getLanguageModel } from "@/lib/llm";
import {
  buildTranslatePrompt,
  translateTargetSchema,
} from "@/lib/translate";

const requestSchema = z.object({
  text: z.string().min(1, "正文不能为空").max(12000),
  target: translateTargetSchema,
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());
    const model = getLanguageModel();

    const { text } = await generateText({
      model,
      prompt: buildTranslatePrompt(body.text, body.target),
    });

    const translated = text.trim();
    if (!translated) {
      return NextResponse.json(
        { error: "翻译未返回有效内容，请重试" },
        { status: 502 },
      );
    }

    return NextResponse.json({ translated, target: body.target });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "翻译失败，请稍后重试";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
