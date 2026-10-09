"use client";

import { Check, CheckCheck, Loader2, X } from "lucide-react";
import { useMemo } from "react";

import { CheckDirectionSelect } from "@/components/check-direction-select";
import { SEVERITY_LABEL } from "@/lib/labels";
import type { CheckDirectionId } from "@/lib/check-directions";
import type { CheckResult } from "@/lib/schemas";
import {
  diffSpans,
  findQuoteRange,
  lineNumberAt,
  sliceByQuote,
} from "@/lib/text-patch";

type CheckPanelProps = {
  check: CheckResult | null;
  text: string;
  loading: boolean;
  resolved: Record<string, "applied" | "ignored">;
  onRunCheck: () => void;
  onApply: (issueId: string, quote: string, suggestion: string) => void;
  onApplyAll: () => void;
  onIgnore: (issueId: string) => void;
  onLocate: (quote: string) => void;
  canRun: boolean;
  direction: CheckDirectionId;
  onDirectionChange: (id: CheckDirectionId) => void;
};

export function CheckPanel({
  check,
  text,
  loading,
  resolved,
  onRunCheck,
  onApply,
  onApplyAll,
  onIgnore,
  onLocate,
  canRun,
  direction,
  onDirectionChange,
}: CheckPanelProps) {
  const visibleIssues = useMemo(() => {
    if (!check) return [];
    return check.issues.filter((issue) => !resolved[issue.id]);
  }, [check, resolved]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 border-b border-stone-100 p-3">
        <CheckDirectionSelect
          value={direction}
          onChange={onDirectionChange}
          disabled={loading}
        />
        <button
          type="button"
          onClick={onRunCheck}
          disabled={loading || !canRun}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-2.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {loading ? "检查中…" : "开始检查"}
        </button>
        <button
          type="button"
          onClick={onApplyAll}
          disabled={loading || visibleIssues.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-900 bg-stone-900 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck className="h-4 w-4" />
          全部应用
          {visibleIssues.length > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-xs">
              {visibleIssues.length}
            </span>
          )}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-3 pb-10">
        {!check && !loading && (
          <p className="py-6 text-center text-sm text-stone-500">
            点击「开始检查」分析语法、标点与表达问题。
          </p>
        )}

        {check && (
          <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
            {check.summary}
          </p>
        )}

        {check && visibleIssues.length === 0 && !loading && (
          <p className="py-4 text-center text-sm text-stone-500">
            {check.issues.length === 0
              ? "未发现明显问题。"
              : "所有问题已处理完毕。"}
          </p>
        )}

        {visibleIssues.map((issue) => {
          const range = findQuoteRange(text, issue.quote);
          const line = range ? lineNumberAt(text, range[0]) : null;
          const matched = sliceByQuote(text, issue.quote) ?? issue.quote;
          const spans = diffSpans(matched, issue.suggestion);

          return (
            <article
              key={issue.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-3 py-2">
                {line != null && (
                  <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[11px] font-medium text-stone-600">
                    L{line}
                  </span>
                )}
                <SeverityBadge severity={issue.severity} />
              </div>

              <div className="space-y-2 px-3 py-2.5">
                <h3 className="font-semibold text-stone-900">
                  {issue.title || issue.message}
                </h3>
                {issue.title && (
                  <p className="text-xs text-stone-500">{issue.message}</p>
                )}

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onLocate(issue.quote)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onLocate(issue.quote);
                  }}
                  className="cursor-pointer rounded-lg border border-stone-200 bg-stone-50/80 p-2 font-mono text-[13px] leading-relaxed"
                >
                  <div className="flex gap-2 text-red-700">
                    <span className="select-none font-bold">−</span>
                    <span className="break-all">
                      <Highlighted
                        value={matched}
                        span={spans.beforeHighlight}
                        tone="remove"
                      />
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-2 text-emerald-800">
                    <span className="select-none font-bold">+</span>
                    <span className="break-all">
                      <Highlighted
                        value={issue.suggestion}
                        span={spans.afterHighlight}
                        tone="add"
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-stone-100 p-2">
                <button
                  type="button"
                  onClick={() =>
                    onApply(issue.id, issue.quote, issue.suggestion)
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
                >
                  <Check className="h-4 w-4" />
                  应用
                </button>
                <button
                  type="button"
                  onClick={() => onIgnore(issue.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  <X className="h-4 w-4" />
                  忽略
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: CheckResult["issues"][number]["severity"];
}) {
  const styles = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    low: "border-stone-200 bg-stone-50 text-stone-600",
  } as const;

  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${styles[severity]}`}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

function Highlighted({
  value,
  span,
  tone,
}: {
  value: string;
  span: [number, number] | null;
  tone: "remove" | "add";
}) {
  if (!span || span[0] >= span[1]) {
    return <>{value}</>;
  }
  const [start, end] = span;
  const cls =
    tone === "remove"
      ? "rounded bg-red-100 text-red-900"
      : "rounded bg-emerald-100 text-emerald-900";
  return (
    <>
      {value.slice(0, start)}
      <mark className={cls}>{value.slice(start, end)}</mark>
      {value.slice(end)}
    </>
  );
}
