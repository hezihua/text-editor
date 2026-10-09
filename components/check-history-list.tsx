"use client";

import type { CheckHistoryEntry } from "@/lib/check-history";

type CheckHistoryListProps = {
  entries?: CheckHistoryEntry[];
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CheckHistoryList({ entries = [] }: CheckHistoryListProps) {
  if (!entries?.length) return null;

  return (
    <details className="rounded-lg border border-stone-200 bg-white text-xs">
      <summary className="cursor-pointer px-3 py-2 font-medium text-stone-700">
        最近检查（{entries.length}）
      </summary>
      <ul className="max-h-40 space-y-2 overflow-y-auto border-t border-stone-100 px-3 py-2">
        {entries.map((e) => (
          <li key={e.id} className="text-stone-600">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-400">
              <time dateTime={new Date(e.at).toISOString()}>
                {formatTime(e.at)}
              </time>
              <span>{e.directionLabel}</span>
              <span>{e.issueCount} 条</span>
              <span>{e.textLength} 字</span>
            </div>
            <p className="mt-0.5 line-clamp-2 leading-relaxed text-stone-600">
              {e.summary}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
