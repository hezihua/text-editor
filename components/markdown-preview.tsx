"use client";

import { Copy, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownPreviewProps = {
  content: string;
  onClose: () => void;
};

export function MarkdownPreview({ content, onClose }: MarkdownPreviewProps) {
  async function copyRendered() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-3 py-2">
        <span className="text-xs font-medium text-stone-500">Markdown 预览</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copyRendered}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            title="复制 Markdown 源码"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            title="关闭预览"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="markdown-preview min-h-0 flex-1 overflow-y-auto p-4 text-[15px] leading-relaxed text-stone-800">
        {content.trim() ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <p className="text-sm text-stone-400">暂无内容</p>
        )}
      </div>
    </div>
  );
}
