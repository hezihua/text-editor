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

/** 所有检查方向（含基础纠错、合规、去 AI 味等）必须遵守 */
const UNIVERSAL_ALIGNMENT_RULES = `
语义与定位（所有检查方向必须遵守）：
- issue 的 title、message 必须准确描述 quote 所在片段；不得张冠李戴（例如：说改「问候语」却引用标题行「关于…说明」）
- 不要修改独立标题/主题行（如「关于…的情况说明」「XX 通知」），除非仅修正该标题内的明确错别字且 suggestion 仍是标题
- 若要改称呼/问候，quote 必须来自正文中真实的问候句（含「各位、您好、你好、大家好、同事」等），不得从标题截取
- suggestion 与 quote 必须同一语义角色：标题仍像标题、问候仍像问候、正文句仍正文；禁止把主题句改成问候、把事实句改成无关套话
- title、message 必须使用简体中文（禁止纯英文 title）
- 不改变事实：日期、数字、延期结论、项目名、专有名词除非 direction 明确要求替换合规用语
- quote 只圈最小连续片段（优先半句或单句）；禁止一条 issue 的 quote 跨多个句号（。！？）
- suggestion 会整段替换 quote：替换后必须保留 quote 内未被点名的信息与结论（例：quote 含「推迟一到两周、迭代安排」，suggestion 不得删掉这些只留原因句）
- 处理重复/冗余时只删或改重复词组，不得借机删掉同段的计划、时间、承诺、感谢等句
- 写 suggestion 前阅读 quote 在正文中位置及前后各一句：替换后与前后连读须通顺，不得与上文已写原因/背景重复
- 不得用「原因/背景/技术细节」句替换「接下来/后续/安排/计划」类句子；口语化也应保留计划信息或整句改写为通顺的一句
- suggestion 必须是应用后可独立读通的片段（注意 quote 若在段中，勿在 suggestion 末尾硬加句号导致与后文断裂）
- 不确定 quote 是否对应你的说明时，不要输出该 issue（宁缺毋滥）
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
${isBasic ? BASIC_RULES : ""}
${UNIVERSAL_ALIGNMENT_RULES}
${!isBasic ? `
- 仍须标注真正的语法、标点错误（若存在）
- 优先 high / medium，low 不超过 3 条
` : ""}
${GENERAL_RULES}

正文：
"""
${text}
"""
`;
}

/** 校验失败后的重试 prompt，强调 JSON 字段与偏移 */
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
    totalChunks != null &&
    totalChunks > 1 &&
    chunkIndex != null;

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
- 再次确认：title/message 与 quote 语义一致，禁止标题/问候错位
- summary 1–500 字
- issues 每项含 category、severity、title、quote、message、suggestion、start、end
- start/end 必须精确对应 quote 在上方正文中的位置（JavaScript 字符串下标）
- 不要输出正文以外的片段`;
}
