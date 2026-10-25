import { MDXRemote } from "next-mdx-remote/rsc";

import { mdxContentComponents } from "@/components/mdx-content-components";
import { parseReaderMarkdown } from "@/lib/mdx/parse-document";
import {
  getMdxSerializeOptions,
  mdxSerializeDefaults,
} from "@/lib/mdx/serialize-options";

type MdxDocumentServerProps = {
  /** 来自数据库或文件系统的 Markdown（可含 frontmatter） */
  source: string;
};

/**
 * 服务端 MDX 渲染（与 awesome-fde 相同管道）。
 * 接入 DB 后：`const doc = await repo.getDocument(id)` → `<MdxDocumentServer source={doc.markdown} />`
 * 外层用 {@link MdxReaderLayout} 包裹以显示目录。
 */
export async function MdxDocumentServer({ source }: MdxDocumentServerProps) {
  const { body, frontmatter } = parseReaderMarkdown(source);
  const title =
    typeof frontmatter.title === "string" ? frontmatter.title : undefined;
  const description =
    typeof frontmatter.description === "string"
      ? frontmatter.description
      : undefined;
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.filter((t): t is string => typeof t === "string")
    : [];

  return (
    <article className="mdx-document prose prose-stone max-w-none text-[15px] leading-relaxed">
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
      <MDXRemote
        source={body}
        options={{
          ...mdxSerializeDefaults,
          mdxOptions: getMdxSerializeOptions(),
        }}
        components={mdxContentComponents}
      />
    </article>
  );
}
