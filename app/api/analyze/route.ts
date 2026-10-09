import { NextResponse } from "next/server";
import { z } from "zod";

import { checkDirectionIdSchema } from "@/lib/check-directions";
import { ANALYZE_MAX_CHARS } from "@/lib/analyze-limits";
import { runCheck } from "@/lib/run-check";
import type { AnalyzeResponse } from "@/lib/schemas";

const requestSchema = z.object({
  text: z.string().min(20, "正文至少 20 字").max(ANALYZE_MAX_CHARS),
  direction: checkDirectionIdSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());

    const { check, meta } = await runCheck({
      text: body.text,
      direction: body.direction ?? "basic",
    });

    const result: AnalyzeResponse = { check, meta };
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
    const status =
      message.includes("OPENAI_API_KEY") || message.includes("未配置")
        ? 503
        : message.includes("未返回有效")
          ? 502
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
