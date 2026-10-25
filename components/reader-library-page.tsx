"use client";

import { FolderPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  createContainer,
  deleteContainer,
  loadReaderLibrary,
  type ReaderLibrary,
} from "@/lib/reader-library";
import { ensureBuiltinReaderSeeds } from "@/lib/reader-seed-import";

export function ReaderLibraryPage() {
  const router = useRouter();
  const [library, setLibrary] = useState<ReaderLibrary | null>(null);
  const [newContainerName, setNewContainerName] = useState("");
  const [creatingContainer, setCreatingContainer] = useState(false);

  const refresh = useCallback(() => {
    setLibrary(loadReaderLibrary());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    void ensureBuiltinReaderSeeds().then((next) => {
      if (!cancelled && next) setLibrary(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!library) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-stone-500">
        加载文库…
      </div>
    );
  }

  function handleCreateContainer() {
    if (!library) return;
    const name = newContainerName.trim();
    if (!name) return;
    const next = createContainer(library, name);
    const id = next.containers[next.containers.length - 1]!.id;
    setLibrary(next);
    setNewContainerName("");
    setCreatingContainer(false);
    router.push(`/reader/${id}`);
  }

  function handleDeleteContainer(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const lib = library;
    if (!lib) return;
    if (!confirm("删除文集将同时删除其中的全部文章，确定吗？")) return;
    const next = deleteContainer(lib, id);
    setLibrary(next);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <header className="shrink-0 border-b border-stone-200 bg-white px-4 py-4">
        <h1 className="text-center text-sm font-semibold text-stone-800">文集</h1>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-800">文集</span>
            <button
              type="button"
              onClick={() => setCreatingContainer((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-600 hover:bg-stone-200/80"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              新建
            </button>
          </div>

          {creatingContainer && (
            <div className="mb-3 flex gap-1">
              <input
                value={newContainerName}
                onChange={(e) => setNewContainerName(e.target.value)}
                placeholder="文集名称"
                className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm"
                maxLength={48}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateContainer()}
              />
              <button
                type="button"
                onClick={handleCreateContainer}
                className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs text-white"
              >
                添加
              </button>
            </div>
          )}

          <ul className="space-y-1">
            {library.containers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/reader/${c.id}`}
                  className="group flex items-center gap-1 rounded-lg px-2 py-2 text-stone-700 transition hover:bg-stone-200/60"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteContainer(c.id, e)}
                    className="shrink-0 rounded p-1 text-stone-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                    title="删除文集"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-stone-400">
          点击文集进入阅读；在编辑器中改稿后可「保存到阅读器」。
        </p>
      </main>
    </div>
  );
}
