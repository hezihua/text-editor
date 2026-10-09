import { NextResponse } from "next/server";
import { z } from "zod";

import { checkDirectionIdSchema } from "@/lib/check-directions";
import { REWRITE_MAX_CHARS, usesRewriteMode } from "@/lib/rewrite-directions";
import { runRewriteCheck } from "@/lib/run-rewrite";

const requestSchema = z.object({
  text: z.string().min(20).max(REWRITE_MAX_CHARS),
  direction: checkDirectionIdSchema,
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());
    if (!usesRewriteMode(body.direction)) {
      return NextResponse.json(
        { error: "该检查方向不支持全文改写模式" },
        { status: 400 },
      );
    }

    const { check, proposedText, meta } = await runRewriteCheck(
      body.text,
      body.direction,
    );

    return NextResponse.json({ check, meta, proposedText });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "全文改写失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
