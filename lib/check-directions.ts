import { z } from "zod";

export const checkDirectionIdSchema = z.enum([
  "basic",
  "de-ai",
  "formal",
  "readability",
  "consistency",
  "authentic",
  "academic",
  "slang",
  "game-compliance",
  "copyright-compliance",
  "ad-compliance",
  "regulated-claims",
]);

export type CheckDirectionId = z.infer<typeof checkDirectionIdSchema>;

export type CheckDirection = {
  id: CheckDirectionId;
  label: string;
  description: string;
  promptFocus: string;
};

export const CHECK_DIRECTIONS: CheckDirection[] = [
  {
    id: "basic",
    label: "基础纠错",
    description: "语法、拼写、标点等基础错误，并给出智能修改建议",
    promptFocus:
      "聚焦语法、错别字、标点、语病与明显不通顺之处；兼顾绝对化用语、虚假承诺等常见表达风险。",
  },
  {
    id: "de-ai",
    label: "去 AI 味儿",
    description: "让 AI 文本更人性化，去除机器痕迹，使内容更自然",
    promptFocus:
      "识别套话、空泛排比、过度总结、机械连接词、千篇一律的「首先其次最后」等 AI 腔；建议改为更口语、具体、有人味的表达，但勿改变核心事实。",
  },
  {
    id: "formal",
    label: "正式写作",
    description: "将随意写作转换为专业、正式的语言风格",
    promptFocus:
      "将口语、网络梗、过度情绪化表述改为正式、得体、适合对外发布的书面语；保持原意。",
  },
  {
    id: "readability",
    label: "可读性优化",
    description: "简化表达、消除冗余、优化结构，提升阅读流畅度",
    promptFocus:
      "找出冗长句、重复信息、弱逻辑衔接与信息密度失衡；建议拆分长句、调整段落与层次。",
  },
  {
    id: "consistency",
    label: "一致性检查",
    description: "确保全文术语、格式、风格保持一致",
    promptFocus:
      "检查同一概念多种叫法、数字/单位/英文大小写混用、人称与时态跳跃、标点风格不统一等问题。",
  },
  {
    id: "authentic",
    label: "地道表达",
    description: "优化翻译腔与生硬表达，使文本更地道自然",
    promptFocus:
      "识别欧化长句、直译词、搭配不当；改为中文母语者更自然的说法。",
  },
  {
    id: "academic",
    label: "学术写作",
    description: "确保学术写作的专业性、客观性与规范性",
    promptFocus:
      "检查主观夸张、缺少限定、引用口吻不当、口语化；建议更客观、审慎的学术表述（若原文非学术体，仅标注文体不匹配处）。",
  },
  {
    id: "slang",
    label: "添加俚语和流行语",
    description: "适当加入俚语、流行语、网络用语，让内容更生动",
    promptFocus:
      "在不过度油腻的前提下，指出可插入流行语、梗、社群用语的位置；避免与品牌/正式场景冲突的表述。",
  },
  {
    id: "game-compliance",
    label: "游戏文案合规",
    description: "面向游戏描述、商店页、UI 文案的合规（分级、概率等）",
    promptFocus:
      "检查未标注概率、夸大收益、未成年人不当引导、缺少必要免责声明等游戏行业常见合规风险。",
  },
  {
    id: "copyright-compliance",
    label: "版权与商标合规",
    description: "识别未授权品牌、角色名或版权文本，并给出替换建议",
    promptFocus:
      "标注可能涉及商标、影视/游戏/IP、名人姓名的用法，建议中性化或通用化替代表述。",
  },
  {
    id: "ad-compliance",
    label: "广告投放合规",
    description: "面向主流广告平台的合规，聚焦违禁题材与误导承诺",
    promptFocus:
      "检查「根治」「100%」「立马见效」等广告违禁表述、医疗/金融暗示、缺少资质背书的承诺。",
  },
  {
    id: "regulated-claims",
    label: "受监管主张合规",
    description: "医疗/法律/金融等受监管主张的安全改写，避免绝对化承诺",
    promptFocus:
      "对涉及健康、投资、法律结论的表述做合规审查，要求加限定语、避免替用户做专业判断。",
  },
];

export const DEFAULT_CHECK_DIRECTION: CheckDirectionId = "basic";

export function getCheckDirection(id: CheckDirectionId): CheckDirection {
  const found = CHECK_DIRECTIONS.find((d) => d.id === id);
  return found ?? CHECK_DIRECTIONS[0]!;
}
