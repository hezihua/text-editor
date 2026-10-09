import {
  getCheckDirection,
  type CheckDirectionId,
} from "./check-directions";

const WRITING_CONTEXT = `
内容类型：中文写作文案（体裁不限：文章、邮件、报告、方案、笔记、演讲稿、社媒帖、产品文案等）。
请根据正文实际体裁与语气调整建议，不要默认按某一单一场景处理。
`;

function rewriteDirectionExtra(directionId: CheckDirectionId): string {
  if (directionId === "basic") {
    return `
基础纠错改写：只改明确语法、拼写、标点；无错误则 text 与输入逐字相同。
禁止润色、改风格、改合规、改表达习惯。`;
  }
  if (
    directionId === "game-compliance" ||
    directionId === "copyright-compliance" ||
    directionId === "ad-compliance" ||
    directionId === "regulated-claims"
  ) {
    return `
合规改写：仅调整违规或高风险表述；保留可发内容结构与事实；替换须符合该平台/行业合规要求。`;
  }
  return "";
}

export function buildRewritePrompt(
  text: string,
  directionId: CheckDirectionId,
  strict = false,
  chunkIndex?: number,
  totalChunks?: number,
) {
  const direction = getCheckDirection(directionId);
  const isChunk =
    totalChunks != null && totalChunks > 1 && chunkIndex != null;

  const chunkNote = isChunk
    ? `
注意：这是全文的第 ${chunkIndex + 1}/${totalChunks} 段，下面「原文」只是其中一段。
- text 必须只包含本段的改写结果，不要写其它段，不要加段首段尾说明
- 本段内的换行、段落结构与输入一致`
    : "";

  return `${WRITING_CONTEXT}

当前任务：在「${direction.label}」方向下，对下面${isChunk ? "片段" : "全文"}做改写。
方向说明：${direction.description}
重点：${direction.promptFocus}
${rewriteDirectionExtra(directionId)}

输出 JSON（仅两个字段）：
- summary：一句话说明本${isChunk ? "段" : "文"}做了哪些调整（中文，500 字内）
- text：改写后的${isChunk ? "本段" : "完整"}正文（不得删事实、日期、延期、计划、感谢等；只按方向调整表达）

硬性要求：
- 保持 Markdown/换行/段落结构与输入一致（段落数相同，标题行保留）
- 不改变事实与数字；不要重复同一原因；计划句与原因句分工清晰，全文读下来通顺
- 不要输出 issues、quote、start/end；只输出 text
${chunkNote}
${strict ? "\n上次输出无效：务必返回完整 text 字段，且与原文信息量等价。\n" : ""}

原文：
"""
${text}
"""
`;
}
