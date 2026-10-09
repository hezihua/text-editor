import {
  getCheckDirection,
  type CheckDirectionId,
} from "./check-directions";

const WRITING_CONTEXT = `
内容类型：中文写作文案（体裁不限：文章、邮件、报告、方案、笔记、演讲稿、社媒帖、产品文案等）。
请根据正文实际体裁与语气调整建议，不要默认按某一单一场景处理。
`;

const BASIC_RULES = `
基础纠错专用（必须遵守）：
- 只输出 grammar / punctuation 两类；不要输出 clarity、style、platform、compliance
- 无明确错误时 issues 必须为 []，summary 简要说明「未发现明确语法、拼写或标点错误」即可
- 不确定是否为错误时不要输出该条（宁缺毋滥）
- suggestion 只修正错误字词或标点，不改变原意、不扩写、不替换同义「更好」说法
- 不要改：称谓格式、项目命名、口语/正式程度、段落结构、emoji、Markdown
`;

const GENERAL_RULES = `
通用要求：
- 每条 issue 必须有简短 title
- quote 必须从正文原样复制（含标点、引号「」""、emoji，一字不差）；suggestion 用于替换 quote 的完整片段
- 每条 issue 必须提供 start、end：0-based 字符下标，左闭右开，且 text.slice(start,end) 必须与 quote 完全一致
- id 可省略（服务端会生成）；若填写请用简短数字字符串
- 全部使用简体中文
`;

export function buildCheckPrompt(text: string, directionId: CheckDirectionId) {
  const direction = getCheckDirection(directionId);
  const isBasic = directionId === "basic";

  return `${isBasic ? "" : WRITING_CONTEXT}

当前检查方向：「${direction.label}」
方向说明：${direction.description}

请在该方向下审查正文，重点：
${direction.promptFocus}
${isBasic ? BASIC_RULES : `
- 仍须标注真正的语法、标点错误（若存在）
- 优先 high / medium，low 不超过 3 条
`}
${GENERAL_RULES}

正文：
"""
${text}
"""
`;
}

/** 校验失败后的重试 prompt，强调 JSON 字段与偏移 */
export function buildCheckPromptStrict(
  text: string,
  directionId: CheckDirectionId,
) {
  const basicExtra =
    directionId === "basic"
      ? "\n- 基础纠错：category 仅 grammar 或 punctuation；勿输出 style/clarity 等\n"
      : "";

  return `${buildCheckPrompt(text, directionId)}

重要：上次输出未通过校验。请严格输出 JSON：
${basicExtra}
- summary 1–500 字
- issues 每项含 category、severity、title、quote、message、suggestion、start、end
- start/end 必须精确对应 quote 在上方正文中的位置（JavaScript 字符串下标）
- 不要输出正文以外的片段`;
}
