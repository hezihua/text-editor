"use client";

import { useRef, type ReactNode } from "react";

import { ArticleTableOfContents } from "@/components/article-table-of-contents";
import { parseMarkdownHeadings } from "@/lib/markdown-toc";

type MdxReaderLayoutProps = {
  /** 不含 frontmatter 的正文，用于目录 */
  markdownBody: string;
  withToc?: boolean;
  scrollRootRef?: React.RefObject<HTMLElement | null>;
  children: ReactNode;
};

export function MdxReaderLayout({
  markdownBody,
  withToc = true,
  scrollRootRef: scrollRootRefProp,
  children,
}: MdxReaderLayoutProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = scrollRootRefProp ?? internalScrollRef;
  const useExternalScroll = Boolean(scrollRootRefProp);
  const tocItems = parseMarkdownHeadings(markdownBody);

  const column = useExternalScroll ? (
    children
  ) : (
    <div
      ref={internalScrollRef}
      className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
    >
      {children}
    </div>
  );

  if (!withToc || tocItems.length === 0) {
    return <div className="min-h-0 min-w-0 flex-1">{column}</div>;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="min-h-0 min-w-0 flex-1">{column}</div>
      <aside className="hidden w-48 shrink-0 border-l border-stone-100 bg-stone-50/50 lg:block xl:w-52">
        <ArticleTableOfContents
          items={tocItems}
          scrollRootRef={scrollRootRef}
        />
      </aside>
    </div>
  );
}
