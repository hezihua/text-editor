"use client";

import { Activity } from "lucide-react";

import { formatAnalyzeMeta } from "@/lib/analyze-metrics";
import type { AnalyzeMeta } from "@/lib/schemas";

type CheckRunStatsProps = {
  meta: AnalyzeMeta;
  issueCount: number;
};

export function CheckRunStats({ meta, issueCount }: CheckRunStatsProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-lg border border-stone-200/80 bg-stone-50/80 px-3 py-2 text-[11px] leading-relaxed text-stone-500"
      title="本次检查的耗时、分段与 token 用量（响应 meta + 服务端 [analyze-metrics] 日志）"
    >
      <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden />
      <p>{formatAnalyzeMeta(meta, issueCount)}</p>
    </div>
  );
}
