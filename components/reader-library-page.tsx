"use client";

import { ArrowUpRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BookCover } from "@/components/book-cover";
import { SiteHeader } from "@/components/site-header";
import {
  deleteContainer,
  isExcludedContainer,
  loadReaderLibrary,
  type ReaderLibrary,
} from "@/lib/reader-library";
import { ensureBuiltinReaderSeeds } from "@/lib/reader-seed-import";

function bookFace(name: string): {
  coverTitle: string;
  footer: string;
  mark: string;
} {
  const parts = name
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const footer = parts[0] || name;
  const coverTitle = parts.length > 1 ? parts.slice(1).join(" · ") : footer;
  return {
    coverTitle,
    footer: footer === coverTitle ? "" : footer,
    mark: footer.slice(0, 1) || "文",
  };
}

function ShelfCard({
  href,
  coverTitle,
  seed,
  footer,
  kicker,
  title,
  meta,
  mark,
  layout = "auto",
  onDelete,
}: {
  href: string;
  coverTitle: string;
  seed: string;
  footer: string;
  kicker: string;
  title: string;
  meta: string;
  mark: string;
  layout?: "auto" | "title";
  onDelete?: () => void;
}) {
  return (
    <li className="group relative min-w-0">
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-2 right-2 z-10 rounded p-1 text-stone-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
          title="删除文集"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <Link
        href={href}
        className="group/card block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-800"
      >
        <span className="block transition duration-200 group-hover/card:-translate-y-1">
          <BookCover
            title={coverTitle}
            seed={seed}
            footer={footer}
            layout={layout}
          />
        </span>
        <p className="mt-3 truncate text-[10px] font-semibold tracking-[0.14em] text-stone-400">
          {kicker}
        </p>
        <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug group-hover/card:underline">
          {title}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-medium text-emerald-800">
            {mark}
          </span>
          <span className="truncate">{meta}</span>
        </p>
        <p className="mt-1.5 inline-flex items-center gap-0.5 text-xs text-stone-400">
          阅读
          <ArrowUpRight className="h-3 w-3" />
        </p>
      </Link>
    </li>
  );
}

export function ReaderLibraryPage() {
  const [library, setLibrary] = useState<ReaderLibrary | null>(null);

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

  const shelf = useMemo(() => {
    if (!library) return [];
    return library.containers
      .filter((container) => !isExcludedContainer(container.name))
      .map((container) => ({
        container,
        articles: library.articles.filter(
          (article) => article.containerId === container.id,
        ),
      }));
  }, [library]);

  const bookCount = shelf.length;

  if (!library) {
    return (
      <div className="shelf-paper flex h-dvh items-center justify-center text-sm text-stone-500">
        加载文库…
      </div>
    );
  }

  function handleDeleteContainer(id: string) {
    const lib = library;
    if (!lib) return;
    if (!confirm("删除文集将同时删除其中的全部文章，确定吗？")) return;
    setLibrary(deleteContainer(lib, id));
  }

  return (
    <div className="shelf-paper h-dvh overflow-y-auto text-stone-900">
      <SiteHeader active="/reader" />

      <main className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">精选收录</h1>
            <p className="mt-2 text-sm text-stone-500">
              按文集陈列已收录的文章。点封面进入目录。
            </p>
          </div>
          <p className="shrink-0 pb-1 text-sm text-stone-500">共 {bookCount} 本</p>
        </div>

        <ul className="mt-10 grid grid-cols-4 gap-x-8 gap-y-10">
          {shelf.map(({ container, articles }) => {
            const face = bookFace(container.name);
            return (
              <ShelfCard
                key={container.id}
                href={`/reader/${container.id}`}
                coverTitle={face.coverTitle}
                seed={container.id}
                footer={face.footer}
                kicker="文集"
                title={face.coverTitle}
                meta={`${articles.length} 篇`}
                mark={face.mark}
                layout="title"
                onDelete={() => handleDeleteContainer(container.id)}
              />
            );
          })}
        </ul>
      </main>
    </div>
  );
}
