import { NextResponse } from "next/server";
import { z } from "zod";

import { toUserFacingApiError } from "@/lib/api-error-message";
import { ANALYZE_MAX_CHARS } from "@/lib/analyze-limits";
import { checkDirectionIdSchema } from "@/lib/check-directions";
import { usageToMetrics } from "@/lib/analyze-metrics";
import { finalizeCheckResult } from "@/lib/filter-check";
import { normalizeChunkCheck } from "@/lib/normalize-check";
import { checkSingleChunk } from "@/lib/check-single-chunk";

const requestSchema = z.object({
  fullText: z.string().min(20).max(ANALYZE_MAX_CHARS),
  chunk: z.object({
    index: z.number().int().nonnegative(),
    text: z.string().min(1),
    offset: z.number().int().nonnegative(),
  }),
  direction: checkDirectionIdSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());
    const direction = body.direction ?? "basic";
    const { raw, usage, retries } = await checkSingleChunk(
      body.chunk.text,
      direction,
    );

    const normalized = normalizeChunkCheck(
      raw,
      body.chunk,
      body.fullText,
    );

    const { check } = finalizeCheckResult(
      normalized.check,
      body.fullText,
      direction,
    );

    return NextResponse.json({
      check,
      droppedLocate: normalized.dropped.locate,
      droppedDuplicate: normalized.dropped.duplicate,
      retries,
      usage: usageToMetrics(usage),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    const raw =
      err instanceof Error ? err.message : "分段检查失败";
    return NextResponse.json(
      { error: toUserFacingApiError(raw) },
      { status: 502 },
    );
  }
}
