import { serialize } from "next-mdx-remote/serialize";

import {
  getMdxSerializeOptions,
  mdxSerializeDefaults,
} from "@/lib/mdx/serialize-options";

const MAX_SOURCE_BYTES = 512_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "无效 JSON" }, { status: 400 });
  }

  const source =
    body && typeof body === "object" && "source" in body
      ? (body as { source: unknown }).source
      : undefined;

  if (typeof source !== "string" || !source.trim()) {
    return Response.json({ error: "缺少 markdown 正文" }, { status: 400 });
  }

  if (source.length > MAX_SOURCE_BYTES) {
    return Response.json({ error: "正文过长" }, { status: 413 });
  }

  try {
    const compiled = await serialize(source, {
      ...mdxSerializeDefaults,
      mdxOptions: getMdxSerializeOptions(),
    });
    return Response.json(compiled);
  } catch (err) {
    const message = err instanceof Error ? err.message : "MDX 编译失败";
    return Response.json({ error: message }, { status: 422 });
  }
}
