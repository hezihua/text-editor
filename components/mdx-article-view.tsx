"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";

import { MdxReaderLayout } from "@/components/mdx-reader-layout";
import { mdxContentComponents } from "@/components/mdx-content-components";
import { parseReaderMarkdown } from "@/lib/mdx/parse-document";

type MdxArticleViewProps = {
  /** 完整 Markdown，可含 frontmatter */
  source: string;
  className?: string;
  withToc?: boolean;
  scrollRootRef?: RefObject<HTMLElement | null>;
};

export function MdxArticleView({
  source,
  className = "",
  withToc = false,
  scrollRootRef,
}: MdxArticleViewProps) {
  const [compiled, setCompiled] = useState<MDXRemoteSerializeResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { body, frontmatter } = useMemo(
    () => parseReaderMarkdown(source),
    [source],
  );

  const title =
    typeof frontmatter.title === "string" ? frontmatter.title : undefined;
  const description =
    typeof frontmatter.description === "string"
      ? frontmatter.description
      : undefined;
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.filter((t): t is string => typeof t === "string")
    : [];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCompiled(null);

    void (async () => {
      try {
        const res = await fetch("/api/mdx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source }),
        });
        const data = (await res.json()) as MDXRemoteSerializeResult & {
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error ?? "渲染失败");
        }
        if (!cancelled) setCompiled(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "渲染失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source]);

  const articleInner = (
    <div className="mx-auto max-w-3xl px-6 py-6 lg:px-8">
      {loading && (
        <p className="text-sm text-stone-500">正在排版…</p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && compiled && (
        <article
          className={`mdx-document prose prose-stone max-w-none text-[15px] leading-relaxed text-stone-800 ${className}`}
        >
          {(title || description || tags.length > 0) && (
            <header className="not-prose mb-8 border-b border-stone-200 pb-6">
              {title && (
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-stone-900">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm leading-relaxed text-stone-600">
                  {description}
                </p>
              )}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>
          )}
          <MDXRemote {...compiled} components={mdxContentComponents} />
        </article>
      )}
      {!source.trim() && !loading && (
        <p className="text-sm text-stone-400">暂无内容</p>
      )}
    </div>
  );

  if (!withToc) {
    return articleInner;
  }

  return (
    <MdxReaderLayout
      markdownBody={body}
      withToc
      scrollRootRef={scrollRootRef}
    >
      {articleInner}
    </MdxReaderLayout>
  );
}

/** @deprecated 名称兼容，请用 MdxArticleView */
export const MarkdownArticleView = MdxArticleView;
