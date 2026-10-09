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
- 禁止从词语中间截断 quote（例：不得只圈「同事好，写这」而把「封信」留给后文；应圈「各位同事好，写这封信」或至少到自然衔接处）
- 写完后自检： mentally 用 suggestion 替换 quote，与前后各 10 字连读，若出现重复字、残片开头（如「封信」「是要」）则改写 quote/suggestion 或丢弃该条
`;

const GENERAL_RULES = `
通用要求：
- 每条 issue 必须有简短 title
- quote 必须从正文原样复制（含标点、引号「」""、emoji，一字不差）；不得自行加 Markdown 列表符或省略号；suggestion 用于替换 quote 的完整片段
- 每条 issue 必须提供 start、end：0-based 字符下标，左闭右开，且 text.slice(start,end) 必须与 quote 完全一致
- id 可省略（服务端会生成）；若填写请用简短数字字符串
- 全部使用简体中文
`;

const FORMAL_STYLE_RULES = `
正式写作专用：
- 口语改书面语时仍须保持句子完整；问候可改为「各位同事：」等，但 quote 须含完整开场至「写这封信/如下/现将」等衔接，suggestion 替换后不得留下「封信」「是要」等残片
- 优先整句或分句改写，避免只改 2–4 个字导致前后拼接不通
`;

export function buildCheckPrompt(text: string, directionId: CheckDirectionId) {
  const direction = getCheckDirection(directionId);
  const isBasic = directionId === "basic";
  const formalExtra = directionId === "formal" ? FORMAL_STYLE_RULES : "";

  return `${isBasic ? "" : WRITING_CONTEXT}

当前检查方向：「${direction.label}」
方向说明：${direction.description}

请在该方向下审查正文，重点：
${direction.promptFocus}
${isBasic ? BASIC_RULES : ""}
${formalExtra}
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
- summary 1–500 字（总评全文，勿把某一条 issue 的说明写进 summary 却不在 issues 里给出对应 quote）
- 每条 issue 的 message 只描述该条 quote，勿写「拆分上文长句」而 quote 却是另一行的短句
- issues 每项含 category、severity、title、quote、message、suggestion、start、end
- start/end 为**上方正文片段内**的 0-based 下标（左闭右开），必须与 quote 对齐；quote 与正文必须逐字一致（含标点、空格）
- 不要输出正文以外的片段`;
}
