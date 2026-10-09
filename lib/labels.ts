import type { CheckResult } from "./schemas";

export const CATEGORY_LABEL: Record<
  CheckResult["issues"][number]["category"],
  string
> = {
  grammar: "语法",
  punctuation: "标点",
  clarity: "清晰度",
  style: "文风",
  platform: "表达规范",
  compliance: "合规",
};

export const SEVERITY_LABEL: Record<
  CheckResult["issues"][number]["severity"],
  string
> = {
  high: "严重",
  medium: "中等",
  low: "轻微",
};

export const SAMPLE_DRAFT = `关于项目延期的情况说明

各位同事好，写这封信是想同步一下「客户门户改版」项目的最新进展。

目前前端页面已基本完成，但接口联调比预期多花了时间，主要是第三方登录文档不完整，我们排查占用了不少工时。按照现在的节奏，整体上线可能要推迟一到两周。

接下来我们会优先保证核心流程可用，非核心模块放到下一迭代。也请大家如有资源可以支援联调，在群里直接 @ 我即可。

谢谢理解，我会每周五在站会上更新进度。`;
