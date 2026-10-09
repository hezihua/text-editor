import { NextResponse } from "next/server";
import { z } from "zod";

import { checkDirectionIdSchema } from "@/lib/check-directions";
import { usageToMetrics } from "@/lib/analyze-metrics";
import { applyDirectionIssueFilter } from "@/lib/filter-check";
import { normalizeChunkCheck } from "@/lib/normalize-check";
import { checkSingleChunk } from "@/lib/check-single-chunk";

const requestSchema = z.object({
  fullText: z.string().min(20).max(48_000),
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

    const check = applyDirectionIssueFilter(normalized.check, direction);

    return NextResponse.json({
      check,
      dropped: normalized.dropped,
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
    const message =
      err instanceof Error ? err.message : "分段检查失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
