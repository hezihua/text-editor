"use client";

import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MarkdownArticleView } from "@/components/markdown-article-view";
import { ReaderArticleList } from "@/components/reader-article-list";
import { ResizeSplit } from "@/components/resize-split";
import {
  articlesInContainer,
  deleteArticle,
  getArticle,
  loadReaderLibrary,
  type ReaderLibrary,
} from "@/lib/reader-library";
import { ensureAwesomeFdeReaderSeed } from "@/lib/reader-seed-import";

type ReaderAppProps = {
  containerId: string;
};

export function ReaderApp({ containerId }: ReaderAppProps) {
  const router = useRouter();
  const articleScrollRef = useRef<HTMLDivElement>(null);
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
    void ensureAwesomeFdeReaderSeed().then((next) => {
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
    router.replace(`/reader/article/${articleForMisroutedId.id}`);
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

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col border-r border-stone-200 bg-stone-50">
      <div className="shrink-0 border-b border-stone-200 px-3 py-3">
        <Link
          href="/reader"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          文集
        </Link>
        <div className="mt-2 flex items-center gap-2 text-stone-800">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm font-semibold">{container.name}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        <span className="mb-2 text-xs font-medium text-stone-600">文章</span>
        <ReaderArticleList
          containerId={containerId}
          articles={articles}
          selectedArticleId={selectedArticleId}
          onSelect={setSelectedArticleId}
          onDelete={handleDeleteArticle}
        />
      </div>
    </div>
  );

  const readerPane = (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {selectedArticle ? (
        <>
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-4 py-3">
            <h1 className="text-lg font-semibold text-stone-900">
              {selectedArticle.title}
            </h1>
            <Link
              href={`/reader/article/${selectedArticle.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              新标签页阅读
            </Link>
          </header>
          <div
            ref={articleScrollRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            <MarkdownArticleView
              source={selectedArticle.content}
              withToc
              scrollRootRef={articleScrollRef}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-stone-400">
          <BookOpen className="h-10 w-10 opacity-40" />
          <p className="text-sm">选择左侧文章开始阅读</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <ResizeSplit
        className="min-h-0 flex-1"
        storageKey="split-reader-main"
        initialRatio={0.32}
        minFirstPx={240}
        minSecondPx={320}
        stackBelowLg
        first={sidebar}
        second={readerPane}
      />
    </div>
  );
}
