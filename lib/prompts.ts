import {
  getCheckDirection,
  type CheckDirectionId,
} from "./check-directions";

const WRITING_CONTEXT = `
内容类型：中文写作文案（体裁不限：文章、邮件、报告、方案、笔记、演讲稿、社媒帖、产品文案等）。
请根据正文实际体裁与语气调整建议，不要默认按某一单一场景处理。
`;

export function buildCheckPrompt(text: string, directionId: CheckDirectionId) {
  const direction = getCheckDirection(directionId);

  return `${WRITING_CONTEXT}

当前检查方向：「${direction.label}」
方向说明：${direction.description}

请在该方向下审查正文，重点：
${direction.promptFocus}

通用要求：
- 仍须标注真正的语法、标点错误（若存在）
- 每条 issue 必须有简短 title
- quote 必须从正文原样复制（含标点、引号「」""、emoji，一字不差）；suggestion 用于替换 quote 的完整片段
- 优先 high / medium，low 不超过 3 条
- 全部使用简体中文

正文：
"""
${text}
"""
`;
}
