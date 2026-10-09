export const UPLOAD_ACCEPT =
  ".md,.markdown,.txt,text/plain,text/markdown,application/octet-stream";

export const MAX_UPLOAD_BYTES = 512 * 1024;

export function resolveExportFilename(name: string): string {
  const trimmed = name.trim() || "文稿";
  const withoutExt = trimmed.replace(/\.(md|markdown|txt)$/i, "");
  return `${withoutExt || "文稿"}.md`;
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = resolveExportFilename(filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function readTextFile(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("文件过大，请上传 512KB 以内的文本文件");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExt = ["md", "markdown", "txt", ""];
  const allowedType =
    file.type.startsWith("text/") ||
    file.type === "application/octet-stream" ||
    file.type === "";

  if (!allowedExt.includes(ext) && !allowedType) {
    throw new Error("仅支持 .md、.markdown、.txt 文本文件");
  }

  const text = await file.text();
  if (!text.trim()) {
    throw new Error("文件内容为空");
  }
  return text.replace(/\r\n/g, "\n");
}
