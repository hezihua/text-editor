"use client";

import {
  Check,
  CheckCheck,
  Copy,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { CheckDirectionSelect } from "@/components/check-direction-select";
import { CheckHistoryList } from "@/components/check-history-list";
import { CheckProgressBar } from "@/components/check-progress";
import { CheckRunStats } from "@/components/check-run-stats";
import type { CheckHistoryEntry } from "@/lib/check-history";
import type { CheckDirectionId } from "@/lib/check-directions";
import { findIssueRange } from "@/lib/issue-range";
import { SEVERITY_LABEL } from "@/lib/labels";
import type { AnalyzeMeta, CheckIssue, CheckResult } from "@/lib/schemas";
import type { CheckProgress } from "@/lib/client-analyze";
import { diffSpans, lineNumberAt } from "@/lib/text-patch";

type CheckPanelProps = {
  check: CheckResult | null;
  text: string;
  loading: boolean;
  checkProgress: CheckProgress | null;
  resolved: Record<string, "applied" | "ignored">;
  onRunCheck: () => void;
  onApply: (
    issueId: string,
    quote: string,
    suggestion: string,
    span: { start: number; end: number },
  ) => void;
  onApplyAll: () => void;
  onIgnore: (issueId: string) => void;
  onFocusIssue: (issue: CheckIssue) => void;
  onCopyIssueQuote: (issue: CheckIssue) => void;
  onRecheckIssue: (issue: CheckIssue) => void;
  recheckingIssueId: string | null;
  canRun: boolean;
  direction: CheckDirectionId;
  onDirectionChange: (id: CheckDirectionId) => void;
  checkMeta?: AnalyzeMeta | null;
  checkHistory: CheckHistoryEntry[];
  activeIssueId: string | null;
  proposedText?: string | null;
  onApplyFullRewrite?: () => void;
};

export function CheckPanel({
  check,
  text,
  loading,
  checkProgress,
  resolved,
  onRunCheck,
  onApply,
  onApplyAll,
  onIgnore,
  onFocusIssue,
  onCopyIssueQuote,
  onRecheckIssue,
  recheckingIssueId,
  canRun,
  direction,
  onDirectionChange,
  checkMeta,
  checkHistory,
  activeIssueId,
  proposedText,
  onApplyFullRewrite,
}: CheckPanelProps) {
  const visibleIssues = useMemo(() => {
    if (!check) return [];
    return check.issues.filter((issue) => !resolved[issue.id]);
  }, [check, resolved]);

  const activeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIssueId, visibleIssues.length]);

  const progressLabel =
    checkProgress && checkProgress.total > 1
      ? `检查中（${checkProgress.current}/${checkProgress.total} 段）`
      : "检查中…";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 border-b border-stone-100 p-3">
        <CheckDirectionSelect
          value={direction}
          onChange={onDirectionChange}
          disabled={loading}
        />
        {loading && checkProgress && checkProgress.total > 1 && (
          <CheckProgressBar
            current={checkProgress.current}
            total={checkProgress.total}
          />
        )}
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
          {loading ? progressLabel : "开始检查"}
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
        <p className="text-[10px] leading-snug text-stone-400">
          快捷键：Alt+↓ 下一条 · Alt+↑ 上一条 · Alt+A 应用 · Alt+I 忽略 ·
          Alt+L 定位
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-3 pb-10">
        <CheckHistoryList entries={checkHistory} />

        {!check && !loading && (
          <p className="py-6 text-center text-sm text-stone-500">
            点击「开始检查」分析语法、标点与表达问题。
          </p>
        )}

        {check && checkMeta && (
          <CheckRunStats meta={checkMeta} issueCount={check.issues.length} />
        )}

        {check && checkMeta?.mode === "issues" && (
          <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] leading-relaxed text-stone-600">
            模型逐条给出原文片段与修改建议（Text-Well 式），右侧高亮定位，可应用、忽略或编辑后再应用。
          </p>
        )}

        {proposedText && onApplyFullRewrite && (
          <button
            type="button"
            onClick={onApplyFullRewrite}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-900 bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            应用全文改写
          </button>
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
          const range = findIssueRange(text, issue);
          const line = range ? lineNumberAt(text, range[0]) : null;
          const matched = range ? text.slice(range[0], range[1]) : issue.quote;
          const spans = diffSpans(matched, issue.suggestion);
          const isActive = issue.id === activeIssueId;
          const isRechecking = recheckingIssueId === issue.id;

          return (
            <article
              key={issue.id}
              ref={isActive ? (el) => { activeRef.current = el; } : undefined}
              className={`overflow-hidden rounded-xl border bg-white text-sm shadow-sm transition ${
                isActive
                  ? "border-stone-400 ring-2 ring-stone-300/80"
                  : "border-stone-200"
              }`}
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
                  onClick={() => onFocusIssue(issue)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onFocusIssue(issue);
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

              <div className="space-y-2 border-t border-stone-100 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onApply(issue.id, issue.quote, issue.suggestion, {
                        start: issue.start,
                        end: issue.end,
                      })
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onCopyIssueQuote(issue)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-100 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    复制片段
                  </button>
                  <button
                    type="button"
                    disabled={loading || isRechecking}
                    onClick={() => onRecheckIssue(issue)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-100 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                  >
                    {isRechecking ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    重新检查本条
                  </button>
                </div>
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
