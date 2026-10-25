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
    <div className="sticky top-0 max-h-full overflow-y-auto py-6 pl-2 pr-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">
        目录导航
      </div>
      <nav aria-label="目录导航">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const isH2 = item.depth === 2;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block rounded-md px-2.5 py-1.5 leading-snug transition-colors ${
                    isH2
                      ? "text-[13px] font-medium text-stone-700"
                      : "pl-6 text-xs text-stone-500"
                  } ${
                    isActive
                      ? "bg-stone-100 font-semibold text-stone-900"
                      : "hover:bg-stone-50 hover:text-stone-800"
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
