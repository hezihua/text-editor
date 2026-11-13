"use client";

import { useEffect, useState, type RefObject } from "react";

import type { MarkdownHeading } from "@/lib/markdown-toc";

type ArticleTableOfContentsProps = {
  items: MarkdownHeading[];
  scrollRootRef: RefObject<HTMLElement | null>;
};

export function ArticleTableOfContents({
  items,
  scrollRootRef,
}: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      {
        root,
        rootMargin: "-72px 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    for (const item of items) {
      const el = root.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`);
      if (el) observer.observe(el);
    }

    setActiveId(items[0]?.id ?? null);

    return () => observer.disconnect();
  }, [items, scrollRootRef]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const root = scrollRootRef.current;
    const el = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!root || !el) return;
    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = root.scrollTop + (elRect.top - rootRect.top) - 12;
    root.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  }

  if (items.length === 0) return null;

  return (
    <div className="py-6 pl-2 pr-4">
      <div className="mb-3 px-2 text-[11px] tracking-wide text-stone-400">
        本篇目录
      </div>
      <nav aria-label="本篇目录">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const isH2 = item.depth === 2;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block px-2 py-1 leading-snug transition-colors ${
                    isH2 ? "text-[13px]" : "pl-5 text-xs"
                  } ${
                    isActive
                      ? "font-medium text-stone-900"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title={item.text}
                >
                  <span className="line-clamp-2 block">{item.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
