"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="shelf-paper flex h-dvh flex-col overflow-hidden text-stone-900">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-stone-300/60 px-5 text-sm text-stone-500">
        <Link href="/reader" className="inline-flex items-center gap-1 hover:text-stone-900">
          <ArrowLeft className="h-3.5 w-3.5" />
          精选收录
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/reader/${article.containerId}`}
          className="hover:text-stone-900"
        >
          文集
        </Link>
        <span aria-hidden>/</span>
        <h1 className="truncate text-stone-800">
          {article.title.replace(/^\d{1,2}\s*[·•.\-—]\s*/, "")}
        </h1>
      </header>
      <main className="flex min-h-0 w-full flex-1">
        <MarkdownArticleView source={article.content} withToc />
      </main>
    </div>
  );
}
