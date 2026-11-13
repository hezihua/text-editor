"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MarkdownArticleView } from "@/components/markdown-article-view";
import { ReaderArticleList } from "@/components/reader-article-list";
import { ResizeSplit } from "@/components/resize-split";
import {
  articlesInContainer,
  deleteArticle,
  getArticle,
  loadReaderLibrary,
  readerArticleHref,
  type ReaderLibrary,
} from "@/lib/reader-library";
import { ensureBuiltinReaderSeeds } from "@/lib/reader-seed-import";

type ReaderAppProps = {
  containerId: string;
};

export function ReaderApp({ containerId }: ReaderAppProps) {
  const router = useRouter();
  const [library, setLibrary] = useState<ReaderLibrary | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );

  const refresh = useCallback(() => {
    const lib = loadReaderLibrary();
    setLibrary(lib);
    setSelectedArticleId((prev) => {
      if (prev && lib.articles.some((a) => a.id === prev)) return prev;
      return null;
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    void ensureBuiltinReaderSeeds().then((next) => {
      if (!cancelled && next) {
        setLibrary(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const container = useMemo(() => {
    if (!library) return null;
    return library.containers.find((c) => c.id === containerId) ?? null;
  }, [library, containerId]);

  const articleForMisroutedId = useMemo(() => {
    if (!library || container) return null;
    return getArticle(library, containerId) ?? null;
  }, [library, container, containerId]);

  useEffect(() => {
    if (!articleForMisroutedId) return;
    router.replace(readerArticleHref(articleForMisroutedId.id));
  }, [articleForMisroutedId, router]);

  const articles = useMemo(() => {
    if (!library) return [];
    return articlesInContainer(library, containerId);
  }, [library, containerId]);

  const selectedArticle = useMemo(() => {
    if (!library || !selectedArticleId) return null;
    return library.articles.find((a) => a.id === selectedArticleId) ?? null;
  }, [library, selectedArticleId]);

  useEffect(() => {
    if (articles.length === 0) {
      setSelectedArticleId(null);
      return;
    }
    if (!selectedArticleId || !articles.some((a) => a.id === selectedArticleId)) {
      setSelectedArticleId(articles[0]!.id);
    }
  }, [articles, selectedArticleId]);

  if (!library) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-stone-500">
        加载文库…
      </div>
    );
  }

  if (!container) {
    if (articleForMisroutedId) {
      return (
        <div className="flex h-dvh items-center justify-center text-sm text-stone-500">
          正在打开文章…
        </div>
      );
    }
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-stone-500">未找到该文集</p>
        <p className="max-w-sm text-center text-xs leading-relaxed text-stone-400">
          阅读数据保存在本机浏览器中。若曾清除站点数据或换了浏览器，旧链接会失效。
        </p>
        <Link
          href="/reader"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800"
        >
          返回文集列表
        </Link>
      </div>
    );
  }

  function handleDeleteArticle(id: string) {
    const lib = library;
    if (!lib) return;
    if (!confirm("确定删除这篇文章？")) return;
    const next = deleteArticle(lib, id);
    setLibrary(next);
    if (selectedArticleId === id) setSelectedArticleId(null);
  }

  const bookName = container.name.split("·")[0]?.trim() || container.name;

  return (
    <div className="shelf-paper flex h-dvh flex-col overflow-hidden text-stone-900">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-stone-300/60 px-5 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-900">
          笔耕
        </Link>
        <span aria-hidden>/</span>
        <Link href="/reader" className="hover:text-stone-900">
          精选收录
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-stone-800">{bookName}</span>
        {selectedArticle && (
          <>
            <span aria-hidden>/</span>
            <span className="truncate text-stone-800">
              {selectedArticle.title.replace(/^\d{1,2}\s*[·•.\-—]\s*/, "")}
            </span>
          </>
        )}
      </header>

      <ResizeSplit
        className="min-h-0 flex-1"
        storageKey="split-reader-main"
        initialRatio={0.22}
        minFirstPx={200}
        minSecondPx={480}
        first={
          <aside className="scrollbar-none flex h-full min-h-0 flex-col overflow-y-auto px-3 py-6">
            <p className="mb-3 truncate px-2 text-[11px] tracking-wide text-stone-400">
              {bookName}
            </p>
            <ReaderArticleList
              containerId={containerId}
              articles={articles}
              selectedArticleId={selectedArticleId}
              onSelect={setSelectedArticleId}
              onDelete={handleDeleteArticle}
            />
          </aside>
        }
        second={
          <div className="flex h-full min-h-0 min-w-0">
            {selectedArticle ? (
              <MarkdownArticleView source={selectedArticle.content} withToc />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-stone-400">
                <BookOpen className="h-10 w-10 opacity-40" />
                <p className="text-sm">选择左侧文章开始阅读</p>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
