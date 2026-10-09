"use client";

type CheckProgressProps = {
  current: number;
  total: number;
};

export function CheckProgressBar({ current, total }: CheckProgressProps) {
  const ratio = total > 0 ? Math.min(1, current / total) : 0;
  const segment =
    total <= 1 ? null : Math.min(total, Math.max(1, current + 1));
  const label =
    total <= 1
      ? "正在检查…"
      : current >= total
        ? "正在合并结果…"
        : `正在检查第 ${segment}/${total} 段…`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span>{label}</span>
        {total > 1 && (
          <span>{Math.round(ratio * 100)}%</span>
        )}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-stone-800 transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
