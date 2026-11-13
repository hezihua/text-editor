"use client";

import { ChevronDown, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  groupReaderArticles,
  shouldUseGroupedSidebar,
  stripTitleNumberPrefix,
} from "@/lib/reader-article-groups";
import type { ReaderArticle } from "@/lib/reader-library";

const collapsedStorageKey = (containerId: string) =>
  `text-editor-reader-group-collapsed:${containerId}`;

type ReaderArticleListProps = {
  containerId: string;
  articles: ReaderArticle[];
  selectedArticleId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function loadCollapsed(containerId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(collapsedStorageKey(containerId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, boolean>)
      : {};
  } catch {
    return {};
  }
}

function saveCollapsed(
  containerId: string,
  value: Record<string, boolean>,
): void {
  localStorage.setItem(
    collapsedStorageKey(containerId),
    JSON.stringify(value),
  );
}

export function ReaderArticleList({
  containerId,
  articles,
  selectedArticleId,
  onSelect,
  onDelete,
}: ReaderArticleListProps) {
  const groups = useMemo(() => groupReaderArticles(articles), [articles]);
  const useGroups = shouldUseGroupedSidebar(groups);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsed(loadCollapsed(containerId));
  }, [containerId]);

  const persistCollapsed = useCallback(
    (next: Record<string, boolean>) => {
      setCollapsed(next);
      saveCollapsed(containerId, next);
    },
    [containerId],
  );

  const toggleGroup = (key: string) => {
    persistCollapsed({ ...collapsed, [key]: !collapsed[key] });
  };

  useEffect(() => {
    if (!selectedArticleId || !useGroups) return;
    const group = groups.find((g) =>
      g.articles.some((a) => a.id === selectedArticleId),
    );
    if (!group) return;
    setCollapsed((prev) => {
      if (!prev[group.group.key]) return prev;
      const next = { ...prev, [group.group.key]: false };
      saveCollapsed(containerId, next);
      return next;
    });
  }, [selectedArticleId, useGroups, groups, containerId]);

  function renderArticleRow(a: ReaderArticle) {
    const selected = selectedArticleId === a.id;
    const line = stripTitleNumberPrefix(a.title);
    return (
      <li key={a.id} className="group/row flex items-start gap-1">
        <button
          type="button"
          onClick={() => onSelect(a.id)}
          title={a.title}
          className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-[13px] leading-snug ${
            selected
              ? "font-medium text-stone-900"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <span className="line-clamp-2">{line}</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(a.id)}
          className="mt-1 shrink-0 rounded p-1 text-stone-300 opacity-0 hover:text-red-600 group-hover/row:opacity-100 focus:opacity-100"
          title="删除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </li>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-stone-400">
        此文集暂无文章。
      </p>
    );
  }

  if (!useGroups) {
    return (
      <ul className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto">
        {articles.map((a) => renderArticleRow(a))}
      </ul>
    );
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-2 overflow-y-auto">
      {groups.map(({ group, articles: groupArticles }) => {
        const isCollapsed = collapsed[group.key] === true;
        return (
          <section key={group.key} className="pt-3">
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="flex w-full items-center gap-1.5 px-2 py-1 text-left"
              aria-expanded={!isCollapsed}
            >
              <ChevronDown
                className={`h-3 w-3 shrink-0 text-stone-400 transition-transform ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium tracking-wide text-stone-400">
                {group.label}
              </span>
            </button>
            {!isCollapsed && (
              <ul className="mt-0.5">
                {groupArticles.map((a) => renderArticleRow(a))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
