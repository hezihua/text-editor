"use client";

import {
  AlertCircle,
  Copy,
  Download,
  FileDiff,
  PanelRightOpen,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CheckPanel } from "@/components/check-panel";
import { MarkdownPreview } from "@/components/markdown-preview";
import { ResizeSplit } from "@/components/resize-split";
import { TranslateMenu } from "@/components/translate-menu";
import {
  DocumentEditor,
  type DocumentEditorHandle,
} from "@/components/document-editor";
import {
  DEFAULT_CHECK_DIRECTION,
  type CheckDirectionId,
} from "@/lib/check-directions";
import {
  downloadMarkdown,
  readTextFile,
  UPLOAD_ACCEPT,
} from "@/lib/file-markdown";
import { SAMPLE_DRAFT } from "@/lib/labels";
import {
  recheckIssueSpan,
  runCheckWithProgress,
  type CheckProgress,
} from "@/lib/client-analyze";
import {
  appendCheckHistory,
  loadCheckHistory,
  type CheckHistoryEntry,
} from "@/lib/check-history";
import { findIssueRange } from "@/lib/issue-range";
import type { AnalyzeResponse, CheckIssue } from "@/lib/schemas";
import type { TranslateTarget } from "@/lib/translate";
import {
  applyAllReplacements,
  applyReplacement,
} from "@/lib/text-patch";
import { splitTextIntoChunks } from "@/lib/text-chunks";

export function Workspace() {
  const [text, setText] = useState(SAMPLE_DRAFT);
  const [checkLoading, setCheckLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [issueResolved, setIssueResolved] = useState<
    Record<string, "applied" | "ignored">
  >({});
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [viewChanges, setViewChanges] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [checkBaselineText, setCheckBaselineText] = useState<string | null>(
    null,
  );
  const [checkDirection, setCheckDirection] = useState<CheckDirectionId>(
    DEFAULT_CHECK_DIRECTION,
  );
  const editorRef = useRef<DocumentEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentName, setDocumentName] = useState("文稿.md");
  const [mdPreviewOpen, setMdPreviewOpen] = useState(false);
  const [checkProgress, setCheckProgress] = useState<CheckProgress | null>(
    null,
  );
  const [checkHistory, setCheckHistory] = useState<CheckHistoryEntry[]>([]);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [recheckingIssueId, setRecheckingIssueId] = useState<string | null>(
    null,
  );
  const [issueActionHint, setIssueActionHint] = useState<string | null>(null);

  useEffect(() => {
    setCheckHistory(loadCheckHistory());
  }, []);

  function resetAfterDocumentChange() {
    setResult(null);
    setIssueResolved({});
    setCheckBaselineText(null);
    setViewChanges(false);
    setActiveQuote(null);
    setActiveIssueId(null);
  }

  async function handleUploadFile(file: File) {
    setError(null);
    try {
      const content = await readTextFile(file);
      setText(content);
      setDocumentName(
        file.name.match(/\.(md|markdown|txt)$/i) ? file.name : `${file.name}.md`,
      );
      resetAfterDocumentChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    }
  }

  function exportMarkdown() {
    if (!text.trim()) {
      setError("正文为空，无法导出");
      return;
    }
    downloadMarkdown(text, documentName);
    setError(null);
  }

  const focusIssue = useCallback(
    (issue: CheckIssue) => {
      setActiveIssueId(issue.id);
      setActiveQuote(issue.quote);
      const range = findIssueRange(text, issue);
      if (!range) return;
      editorRef.current?.focusRange(range[0], range[1]);
    },
    [text],
  );

  async function runCheck() {
    setCheckLoading(true);
    setError(null);
    const total = splitTextIntoChunks(text).length;
    setCheckProgress({ current: 0, total });
    try {
      const { check, meta } = await runCheckWithProgress(
        text,
        checkDirection,
        setCheckProgress,
      );
      const payload: AnalyzeResponse = { check, meta };
      setResult(payload);
      if (meta.degraded) {
        setError(meta.degraded);
      } else if (meta.droppedIssueCount) {
        setError(
          `有 ${meta.droppedIssueCount} 条建议因无法定位已自动忽略。`,
        );
      } else {
        setError(null);
      }
      setIssueResolved({});
      setCheckBaselineText(text);
      setViewChanges(false);
      setActiveIssueId(check.issues[0]?.id ?? null);
      setCheckHistory(
        appendCheckHistory({
          direction: checkDirection,
          summary: check.summary,
          issueCount: check.issues.length,
          textLength: text.length,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setCheckLoading(false);
      setCheckProgress(null);
    }
  }

  async function handleCopyIssueQuote(issue: CheckIssue) {
    const range = findIssueRange(text, issue);
    const snippet = range ? text.slice(range[0], range[1]) : issue.quote;
    try {
      await navigator.clipboard.writeText(snippet);
      setIssueActionHint("已复制片段");
      window.setTimeout(() => setIssueActionHint(null), 1500);
    } catch {
      setIssueActionHint("复制失败");
    }
  }

  async function handleRecheckIssue(issue: CheckIssue) {
    setRecheckingIssueId(issue.id);
    setError(null);
    try {
      const updated = await recheckIssueSpan(
        text,
        issue,
        checkDirection,
      );
      if (!updated) {
        setIssueActionHint("该片段未发现新问题");
        window.setTimeout(() => setIssueActionHint(null), 2000);
        return;
      }
      setResult((prev) => {
        if (!prev?.check) return prev;
        return {
          ...prev,
          check: {
            ...prev.check,
            issues: prev.check.issues.map((i) =>
              i.id === issue.id ? updated : i,
            ),
          },
        };
      });
      focusIssue(updated);
      setIssueActionHint("已更新本条建议");
      window.setTimeout(() => setIssueActionHint(null), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "重新检查失败");
    } finally {
      setRecheckingIssueId(null);
    }
  }

  const handleApplyIssue = useCallback(
    (
      issueId: string,
      quote: string,
      suggestion: string,
      span?: { start: number; end: number },
    ) => {
      const { next, ok } = applyReplacement(text, quote, suggestion, span);
      if (!ok) {
        setError("无法在正文中定位该片段，可能已被修改。请重新检查。");
        return;
      }
      setText(next);
      setIssueResolved((prev) => ({ ...prev, [issueId]: "applied" }));
      setActiveQuote(null);
      setError(null);
    },
    [text],
  );

  const handleIgnoreIssue = useCallback((issueId: string) => {
    setIssueResolved((prev) => ({ ...prev, [issueId]: "ignored" }));
  }, []);

  function handleApplyAllIssues() {
    const issues = result?.check?.issues;
    if (!issues) return;

    const pending = issues.filter((i) => !issueResolved[i.id]);
    if (pending.length === 0) return;

    const { next, appliedIds, failedIds } = applyAllReplacements(
      text,
      pending.map((i) => ({
        id: i.id,
        quote: i.quote,
        suggestion: i.suggestion,
        start: i.start,
        end: i.end,
      })),
    );

    setText(next);
    setActiveQuote(null);
    setIssueResolved((prev) => {
      const updated = { ...prev };
      for (const id of appliedIds) updated[id] = "applied";
      return updated;
    });

    if (failedIds.length > 0) {
      setError(
        `已应用 ${appliedIds.length} 条，${failedIds.length} 条未能定位，请手动处理或重新检查。`,
      );
    } else {
      setError(null);
    }
  }

  const checkIssues = result?.check?.issues ?? [];
  const pendingIssues = useMemo(
    () => checkIssues.filter((i) => !issueResolved[i.id]),
    [checkIssues, issueResolved],
  );
  const pendingCheckCount = pendingIssues.length;

  const activeIssue = useMemo(() => {
    if (!activeIssueId) return pendingIssues[0] ?? null;
    return (
      pendingIssues.find((i) => i.id === activeIssueId) ??
      pendingIssues[0] ??
      null
    );
  }, [activeIssueId, pendingIssues]);

  const selectRelativeIssue = useCallback(
    (delta: number) => {
      if (pendingIssues.length === 0) return;
      const idx = activeIssue
        ? pendingIssues.findIndex((i) => i.id === activeIssue.id)
        : -1;
      const nextIdx =
        idx < 0
          ? 0
          : (idx + delta + pendingIssues.length) % pendingIssues.length;
      focusIssue(pendingIssues[nextIdx]!);
    },
    [activeIssue, focusIssue, pendingIssues],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.altKey || pendingIssues.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectRelativeIssue(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        selectRelativeIssue(-1);
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        if (activeIssue) focusIssue(activeIssue);
        return;
      }
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (!activeIssue) return;
        handleApplyIssue(
          activeIssue.id,
          activeIssue.quote,
          activeIssue.suggestion,
          { start: activeIssue.start, end: activeIssue.end },
        );
        selectRelativeIssue(1);
        return;
      }
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        if (!activeIssue) return;
        handleIgnoreIssue(activeIssue.id);
        selectRelativeIssue(1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeIssue,
    focusIssue,
    handleApplyIssue,
    handleIgnoreIssue,
    pendingIssues.length,
    selectRelativeIssue,
  ]);
  const canRun = text.trim().length >= 20;
  const showIssueUnderlines =
    pendingCheckCount > 0 && Boolean(result?.check);
  const canViewChanges =
    Boolean(result?.check && checkBaselineText) &&
    (pendingCheckCount > 0 || text !== checkBaselineText);

  useEffect(() => {
    if (!canViewChanges) setViewChanges(false);
  }, [canViewChanges]);

  async function runTranslate(target: TranslateTarget) {
    if (!text.trim()) return;
    setTranslateLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "翻译失败");
      }
      setText(data.translated as string);
      setResult(null);
      setIssueResolved({});
      setCheckBaselineText(null);
      setViewChanges(false);
      setActiveQuote(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setTranslateLoading(false);
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint("已复制");
      window.setTimeout(() => setCopyHint(null), 1500);
    } catch {
      setCopyHint("复制失败");
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-stone-200/80 text-stone-900">
      <main className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
        <ResizeSplit
          className="min-h-0 flex-1"
          storageKey="split-main-sidebar"
          initialRatio={0.68}
          minFirstPx={360}
          minSecondPx={300}
          stackBelowLg
          first={
        <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white lg:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-sm font-medium text-stone-600">正文</span>
              <span
                className="max-w-[140px] truncate text-xs text-stone-400 sm:max-w-[200px]"
                title={documentName}
              >
                {documentName}
              </span>
              <span className="text-xs text-stone-400">{text.length} 字符</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={UPLOAD_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUploadFile(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <Upload className="h-3.5 w-3.5" />
                上传
              </button>
              <button
                type="button"
                disabled={!text.trim()}
                onClick={exportMarkdown}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                导出
              </button>
              <TranslateMenu
                disabled={!text.trim()}
                loading={translateLoading}
                onTranslate={runTranslate}
              />
              <button
                type="button"
                disabled={!canViewChanges}
                onClick={() => setViewChanges((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  viewChanges && canViewChanges
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                <FileDiff className="h-3.5 w-3.5" />
                查看变更
              </button>
              <button
                type="button"
                onClick={copyText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <Copy className="h-3.5 w-3.5" />
                {copyHint ?? "复制"}
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col p-3">
            {!mdPreviewOpen && (
              <button
                type="button"
                onClick={() => setMdPreviewOpen(true)}
                className="absolute top-5 right-5 z-20 inline-flex items-center gap-1.5 rounded-lg border border-stone-700/10 bg-stone-800 px-3 py-1.5 text-xs font-medium text-white shadow-md transition hover:bg-stone-700"
              >
                <PanelRightOpen className="h-3.5 w-3.5" />
                打开 Markdown 预览
              </button>
            )}
            {mdPreviewOpen ? (
              <ResizeSplit
                className="min-h-0 flex-1"
                storageKey="split-editor-preview"
                initialRatio={0.5}
                minFirstPx={280}
                minSecondPx={280}
                stackBelowLg
                first={
                  <DocumentEditor
                    ref={editorRef}
                    text={text}
                    onChange={(value) => {
                      setText(value);
                      setActiveQuote(null);
                      if (!documentName.trim()) setDocumentName("文稿.md");
                    }}
                    placeholder="粘贴或输入任意中文写作文案…"
                    checkIssues={result?.check?.issues}
                    issueResolved={issueResolved}
                    showIssueUnderlines={showIssueUnderlines && !viewChanges}
                    viewChanges={viewChanges}
                    checkBaselineText={checkBaselineText}
                    pendingIssueCount={pendingCheckCount}
                    activeQuote={activeQuote}
                    activeIssueId={activeIssue?.id ?? null}
                  />
                }
                second={
                  <MarkdownPreview
                    content={text}
                    onClose={() => setMdPreviewOpen(false)}
                  />
                }
              />
            ) : (
              <DocumentEditor
                ref={editorRef}
                text={text}
                onChange={(value) => {
                  setText(value);
                  setActiveQuote(null);
                  if (!documentName.trim()) setDocumentName("文稿.md");
                }}
                placeholder="粘贴或输入任意中文写作文案…"
                checkIssues={result?.check?.issues}
                issueResolved={issueResolved}
                showIssueUnderlines={showIssueUnderlines && !viewChanges}
                viewChanges={viewChanges}
                checkBaselineText={checkBaselineText}
                pendingIssueCount={pendingCheckCount}
                activeQuote={activeQuote}
                activeIssueId={activeIssue?.id ?? null}
              />
            )}
          </div>
        </section>
          }
          second={
        <aside className="flex h-full min-h-0 flex-col overflow-hidden border-t border-stone-200 bg-white lg:border-t-0">
          {(error || issueActionHint) && (
            <div
              className={`mx-3 mt-3 flex shrink-0 gap-2 rounded-xl border p-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-stone-200 bg-stone-50 text-stone-700"
              }`}
            >
              {error && (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p>{error ?? issueActionHint}</p>
            </div>
          )}
          <CheckPanel
            check={result?.check ?? null}
            text={text}
            loading={checkLoading}
            checkProgress={checkProgress}
            resolved={issueResolved}
            onRunCheck={runCheck}
            onApply={handleApplyIssue}
            onApplyAll={handleApplyAllIssues}
            onIgnore={handleIgnoreIssue}
            onFocusIssue={focusIssue}
            onCopyIssueQuote={handleCopyIssueQuote}
            onRecheckIssue={handleRecheckIssue}
            recheckingIssueId={recheckingIssueId}
            canRun={canRun}
            direction={checkDirection}
            onDirectionChange={setCheckDirection}
            checkMeta={result?.meta ?? null}
            checkHistory={checkHistory}
            activeIssueId={activeIssue?.id ?? null}
          />
        </aside>
          }
        />
      </main>
    </div>
  );
}
