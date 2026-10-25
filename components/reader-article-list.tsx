"use client";

import { ChevronDown, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  groupReaderArticles,
  shouldUseGroupedSidebar,
  titleInGroupIndex,
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

  function renderArticleRow(a: ReaderArticle, displayTitle?: string) {
    const selected = selectedArticleId === a.id;
    const line = displayTitle ?? a.title;
    return (
      <li key={a.id} className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => onSelect(a.id)}
          title={a.title}
          className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-left ${
            selected
              ? "bg-stone-900 text-white shadow-sm"
              : "hover:bg-stone-200/50"
          }`}
        >
          <div className="truncate text-sm font-medium">{line}</div>
          <div
            className={`text-[10px] ${
              selected ? "text-stone-300" : "text-stone-400"
            }`}
          >
            {new Date(a.updatedAt).toLocaleString("zh-CN")}
          </div>
        </button>
        <button
          type="button"
          onClick={() => onDelete(a.id)}
          className="shrink-0 rounded p-1 text-stone-400 hover:text-red-600"
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
        此文集暂无文章。在编辑器中改好后点「保存到阅读器」。
      </p>
    );
  }

  if (!useGroups) {
    return (
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {articles.map((a) => renderArticleRow(a))}
      </ul>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
      {groups.map(({ group, articles: groupArticles }) => {
        const isCollapsed = collapsed[group.key] === true;
        return (
          <section key={group.key} className="rounded-lg border border-stone-200/80 bg-white/60">
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left hover:bg-stone-100/80"
              aria-expanded={!isCollapsed}
            >
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-stone-500 transition-transform ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-stone-700">
                {group.label}
              </span>
              <span className="shrink-0 text-[10px] tabular-nums text-stone-400">
                {groupArticles.length}
              </span>
            </button>
            {!isCollapsed && (
              <ul className="space-y-1 px-1 pb-2 pt-0.5">
                {groupArticles.map((a, index) =>
                  renderArticleRow(a, titleInGroupIndex(a.title, index)),
                )}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
