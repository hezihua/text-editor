"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createContainer,
  loadReaderLibrary,
  saveArticle,
  titleFromDocumentName,
  type ReaderLibrary,
} from "@/lib/reader-library";

type SaveToReaderDialogProps = {
  open: boolean;
  onClose: () => void;
  content: string;
  documentName: string;
  onSaved?: (articleId: string, containerId: string) => void;
};

export function SaveToReaderDialog({
  open,
  onClose,
  content,
  documentName,
  onSaved,
}: SaveToReaderDialogProps) {
  const [library, setLibrary] = useState<ReaderLibrary>({
    containers: [],
    articles: [],
  });
  const [containerId, setContainerId] = useState("");
  const [newContainerName, setNewContainerName] = useState("");
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const lib = loadReaderLibrary();
    setLibrary(lib);
    setTitle(titleFromDocumentName(documentName));
    setContainerId(lib.containers[0]?.id ?? "");
    setNewContainerName("");
    setMode("existing");
    setError(null);
  }, [open, documentName]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("正文为空，无法保存");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let lib = library;
      let targetContainerId = containerId;

      if (mode === "new") {
        if (!newContainerName.trim()) {
          setError("请输入新文集名称");
          setSaving(false);
          return;
        }
        lib = createContainer(lib, newContainerName);
        targetContainerId = lib.containers[lib.containers.length - 1]!.id;
        setLibrary(lib);
      } else if (!targetContainerId) {
        setError("请选择文集");
        setSaving(false);
        return;
      }

      const { article } = saveArticle(lib, {
        containerId: targetContainerId,
        title,
        content,
      });
      onSaved?.(article.id, targetContainerId);
      onClose();
    } catch {
      setError("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-reader-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 id="save-reader-title" className="text-sm font-semibold text-stone-900">
            保存到阅读器
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              文章标题
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-stone-600">
              保存到文集
            </span>
            <div className="flex gap-3 text-sm">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="container-mode"
                  checked={mode === "existing"}
                  onChange={() => setMode("existing")}
                />
                已有文集
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="container-mode"
                  checked={mode === "new"}
                  onChange={() => setMode("new")}
                />
                新建文集
              </label>
            </div>
          </div>

          {mode === "existing" ? (
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
            >
              {library.containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
              placeholder="例如：项目邮件、随笔"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
              maxLength={48}
            />
          )}

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
