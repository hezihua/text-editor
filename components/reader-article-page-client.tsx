"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MarkdownArticleView } from "@/components/markdown-article-view";
import {
  getArticle,
  loadReaderLibrary,
  type ReaderArticle,
} from "@/lib/reader-library";

type ReaderArticlePageClientProps = {
  articleId: string;
};

export function ReaderArticlePageClient({
  articleId,
}: ReaderArticlePageClientProps) {
  const [article, setArticle] = useState<ReaderArticle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lib = loadReaderLibrary();
    setArticle(getArticle(lib, articleId) ?? null);
    setLoaded(true);
  }, [articleId]);

  if (!loaded) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-stone-500">
        加载中…
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-stone-500">未找到文章，可能已被删除</p>
        <Link
          href="/reader"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800"
        >
          打开文集
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <header className="flex shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <Link
          href={
            article
              ? `/reader/${article.containerId}`
              : "/reader"
          }
          className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          阅读器
        </Link>
        <span className="text-stone-300">/</span>
        <h1 className="truncate text-sm font-semibold text-stone-900">
          {article.title}
        </h1>
      </header>
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div
          ref={mainScrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
        <MarkdownArticleView
          source={article.content}
          withToc
          scrollRootRef={mainScrollRef}
        />
        </div>
      </main>
    </div>
  );
}
