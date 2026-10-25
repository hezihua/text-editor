function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function extractText(node: HastNode): string {
  if (node.type === "text") return node.value || "";
  if (!node.children) return "";
  return node.children.map(extractText).join("");
}

function walkTree(node: HastNode, callback: (n: HastNode) => void) {
  callback(node);
  if (node.children) {
    for (const child of node.children) {
      walkTree(child, callback);
    }
  }
}

/** 与 awesome-fde / lib/markdown-toc 一致的 h2、h3 锚点 */
export function rehypeSlugify() {
  return (tree: HastNode) => {
    const slugCounts = new Map<string, number>();

    walkTree(tree, (node) => {
      if (node.type !== "element") return;
      if (!["h2", "h3"].includes(node.tagName!)) return;

      const rawText = extractText(node);
      const cleanText = rawText.replace(/^(\d+\.)\s+/, "").trim();
      let id = slugify(cleanText || rawText);
      if (!id) return;

      const count = slugCounts.get(id) ?? 0;
      slugCounts.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;

      if (!node.properties) node.properties = {};
      node.properties.id = id;
    });
  };
}
