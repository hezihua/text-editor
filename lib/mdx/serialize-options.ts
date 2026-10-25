/**
 * 仅服务端使用（API route、RSC）。勿被 Client Component 引用。
 * 与 awesome-fde 讲义页同一套 remark/rehype 插件。
 */
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { rehypeSlugify } from "@/lib/mdx/rehype-slugify";

export function getMdxSerializeOptions() {
  return {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeSlugify, rehypeHighlight, rehypeKatex],
  };
}

export const mdxSerializeDefaults = {
  parseFrontmatter: true,
  blockJS: true,
  blockDangerousJS: true,
};
