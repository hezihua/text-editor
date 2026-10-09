import type { CheckDirectionId } from "@/lib/check-directions";
import type { CheckIssue } from "@/lib/schemas";

export type IssueCategory = CheckIssue["category"];

export type OfflineNormalizeFixture = {
  name: string;
  fullText: string;
  chunkText: string;
  chunkOffset: number;
  raw: {
    summary: string;
    issues: Array<{
      category: IssueCategory;
      severity: "high" | "medium" | "low";
      title: string;
      quote: string;
      message: string;
      suggestion: string;
      start?: number;
      end?: number;
    }>;
  };
  expectIssueCount: number;
  expectCategories: IssueCategory[];
};

export type LiveCheckFixture = {
  name: string;
  text: string;
  direction: CheckDirectionId;
  /** 至少命中其中一类 */
  expectAnyCategory: IssueCategory[];
  minIssues?: number;
};

const commaSampleText = "明天如果下雨我们就取消活动。";
const commaQuote = "明天如果下雨";
const commaStart = commaSampleText.indexOf(commaQuote);
const commaEnd = commaStart + commaQuote.length;

export const OFFLINE_FIXTURES: OfflineNormalizeFixture[] = [
  {
    name: "offset-locate-comma",
    fullText: commaSampleText,
    chunkText: commaSampleText,
    chunkOffset: 0,
    raw: {
      summary: "状语后宜加逗号。",
      issues: [
        {
          category: "punctuation",
          severity: "medium",
          title: "状语后缺少逗号",
          quote: commaQuote,
          message: "时间/条件状语后建议加逗号",
          suggestion: "明天如果下雨，",
          start: commaStart,
          end: commaEnd,
        },
      ],
    },
    expectIssueCount: 1,
    expectCategories: ["punctuation"],
  },
  {
    name: "drop-unlocatable",
    fullText: "产品体验还不错。",
    chunkText: "产品体验还不错。",
    chunkOffset: 0,
    raw: {
      summary: "测试丢弃无法定位项",
      issues: [
        {
          category: "style",
          severity: "low",
          title: "莫须有问题",
          quote: "这段文字不存在",
          message: "应被丢弃",
          suggestion: "替换",
        },
      ],
    },
    expectIssueCount: 0,
    expectCategories: [],
  },
];

export const LIVE_FIXTURES: LiveCheckFixture[] = [
  {
    name: "basic-grammar-sample",
    text: "我昨天去了超市买了很多东西回来以后才发现忘带钱包。",
    direction: "basic",
    expectAnyCategory: ["grammar", "punctuation", "clarity"],
    minIssues: 1,
  },
  {
    name: "punctuation-sample",
    text: "关于这个问题我们需要在下周之前给出明确答复请大家提前准备材料。",
    direction: "basic",
    expectAnyCategory: ["punctuation", "clarity", "grammar"],
    minIssues: 1,
  },
];
