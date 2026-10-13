"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownArticleViewProps = {
  content: string;
  className?: string;
};

export function MarkdownArticleView({
  content,
  className = "",
}: MarkdownArticleViewProps) {
  return (
    <article
      className={`markdown-preview text-[15px] leading-relaxed text-stone-800 ${className}`}
    >
      {content.trim() ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      ) : (
        <p className="text-sm text-stone-400">暂无内容</p>
      )}
    </article>
  );
}
