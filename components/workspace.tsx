"use client";

import { AlertCircle, Copy, Download, FileDiff, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CheckPanel } from "@/components/check-panel";
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
import type { AnalyzeResponse } from "@/lib/schemas";
import type { TranslateTarget } from "@/lib/translate";
import {
  applyAllReplacements,
  applyReplacement,
  findQuoteRange,
} from "@/lib/text-patch";

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

  function resetAfterDocumentChange() {
    setResult(null);
    setIssueResolved({});
    setCheckBaselineText(null);
    setViewChanges(false);
    setActiveQuote(null);
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

  const focusQuote = useCallback(
    (quote: string) => {
      setActiveQuote(quote);
      const range = findQuoteRange(text, quote);
      if (!range) return;
      editorRef.current?.focusRange(range[0], range[1]);
    },
    [text],
  );

  async function runCheck() {
    setCheckLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction: checkDirection }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "请求失败");
      }
      setResult(data as AnalyzeResponse);
      setIssueResolved({});
      setCheckBaselineText(text);
      setViewChanges(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setCheckLoading(false);
    }
  }

  function handleApplyIssue(
    issueId: string,
    quote: string,
    suggestion: string,
  ) {
    const { next, ok } = applyReplacement(text, quote, suggestion);
    if (!ok) {
      setError("无法在正文中定位该片段，可能已被修改。请重新检查。");
      return;
    }
    setText(next);
    setIssueResolved((prev) => ({ ...prev, [issueId]: "applied" }));
    setActiveQuote(null);
    setError(null);
  }

  function handleIgnoreIssue(issueId: string) {
    setIssueResolved((prev) => ({ ...prev, [issueId]: "ignored" }));
  }

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
  const pendingCheckCount = checkIssues.filter(
    (i) => !issueResolved[i.id],
  ).length;
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
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f4f2ef] p-4 text-stone-900 lg:p-6">
      <main className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 grid-rows-1 gap-4 lg:grid-cols-[1fr_380px]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
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
            />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {error && (
            <div className="mx-3 mt-3 flex shrink-0 gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <CheckPanel
            check={result?.check ?? null}
            text={text}
            loading={checkLoading}
            resolved={issueResolved}
            onRunCheck={runCheck}
            onApply={handleApplyIssue}
            onApplyAll={handleApplyAllIssues}
            onIgnore={handleIgnoreIssue}
            onLocate={focusQuote}
            canRun={canRun}
            direction={checkDirection}
            onDirectionChange={setCheckDirection}
          />
        </aside>
      </main>
    </div>
  );
}
