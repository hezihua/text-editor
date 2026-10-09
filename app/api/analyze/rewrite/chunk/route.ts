import { NextResponse } from "next/server";
import { z } from "zod";

import { toUserFacingApiError } from "@/lib/api-error-message";
import { checkDirectionIdSchema } from "@/lib/check-directions";
import { REWRITE_MAX_CHARS, usesRewriteMode } from "@/lib/rewrite-directions";
import { rewriteTextChunk } from "@/lib/run-rewrite";

const requestSchema = z.object({
  fullText: z.string().min(20).max(REWRITE_MAX_CHARS),
  chunk: z.object({
    index: z.number().int().nonnegative(),
    text: z.string().min(1),
    offset: z.number().int().nonnegative(),
  }),
  direction: checkDirectionIdSchema,
  totalChunks: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());
    if (!usesRewriteMode(body.direction)) {
      return NextResponse.json({ error: "无效检查方向" }, { status: 400 });
    }

    const result = await rewriteTextChunk(
      body.chunk.text,
      body.direction,
      body.chunk,
      body.totalChunks,
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    const raw =
      err instanceof Error ? err.message : "分段改写失败";
    return NextResponse.json(
      { error: toUserFacingApiError(raw) },
      { status: 502 },
    );
  }
}
