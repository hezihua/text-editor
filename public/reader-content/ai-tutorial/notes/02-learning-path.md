---
title: AI 学习路径：从零到 Agent 工程师
description: 一份从零基础到能独立做出 AI Agent 产品的系统化学习路径，覆盖概念 → Prompt → RAG → Agent → 工程化的完整进阶路线，含时间规划、推荐资源和检查清单。
date: 2026-08-14
tags: [学习路径, AI, Agent, RAG, 工程化, 入门指南]
---

## 引言：为什么需要一条学习路径

> AI 领域知识爆炸，新手最容易陷入"学了又忘、不知道下一步学什么"的循环。本文提供一条经过验证的学习路径，让你用 **3-6 个月** 从零基础走到能独立做出可用的 AI Agent 产品。

核心思路：**概念打底 → 工具熟练 → 项目驱动 → 工程化收尾**。每一阶段都有明确的"出师标准"，不达标不进入下一阶段。

---

## 1. 路径全景图

```
阶段 0：基础准备（1-2 周）
    │  Python / Git / 命令行 / HTTP API
    ▼
阶段 1：AI 概念地图（1 周）
    │  AI / ML / DL / LLM / Agent / RAG 关系
    ▼
阶段 2：Prompt Engineering（1-2 周）
    │  Zero/Few-shot / CoT / 结构化输出
    ▼
阶段 3：API 调用与 SDK（1 周）
    │  OpenAI / Anthropic / 流式响应
    ▼
阶段 4：RAG 实战（2-3 周）
    │  Embedding / 向量库 / 检索 / 评估
    ▼
阶段 5：Tool Calling 与 MCP（1-2 周）
    │  Function Calling / MCP Server
    ▼
阶段 6：Agent 开发（3-4 周）
    │  ReAct / LangGraph / 多 Agent 协作
    ▼
阶段 7：工程化与部署（2-3 周）
    │  评估 / 监控 / 安全 / 上线
    ▼
阶段 8：进阶方向（持续）
    │  Fine-tuning / 多模态 / 推理优化 / 自研模型
```

---

## 2. 阶段 0：基础准备（1-2 周）

**目标**：具备阅读 AI 代码、调用 API 的最低工程能力。

### 必备技能

| 技能 | 掌握程度 | 验证标准 |
|------|---------|---------|
| **Python** | 能写函数、类、异步、读写文件 | 用 Python 调通一个 HTTP 接口 |
| **Git** | clone / commit / push / branch | 在 GitHub 上提交一个仓库 |
| **命令行** | cd / ls / grep / 环境变量 | 能用 terminal 启动一个项目 |
| **HTTP API** | GET/POST/JSON/Headers/Auth | 用 curl 或 Postman 调通任一 API |
| **包管理** | pip / pnpm / npm | 能安装依赖并跑起来一个 demo |

### 学习资源

- Python：[Python 官方教程](https://docs.python.org/zh-cn/3/tutorial/)
- Git：[Pro Git 中文版](https://git-scm.com/book/zh/v2)
- HTTP：MDN Web Docs

> 💡 不用追求完美，能跟着教程跑起来即可。后续会边学边补。

---

## 3. 阶段 1：AI 概念地图（1 周）

**目标**：理解 AI 领域的核心概念关系，看到术语不懵。

### 必学内容

- AI / ML / DL / LLM 的包含关系
- 基座模型 vs 对话模型（SFT + RLHF/DPO）
- Tokenization、Context Window、MoE、VLM
- Prompt / RAG / Fine-tuning 的适用场景
- Agent / Tool Calling / MCP 是什么

### 推荐路径

1. **精读**：portal 的《AI 概念全解析》笔记
2. **拓展**：3Blue1Brown 的 LLM 可视化视频系列
3. **动手**：注册 OpenAI / Anthropic API Key，在网页端调通一次对话

### 出师标准

- 能用一段话向非技术朋友解释"什么是 LLM、什么是 Agent"
- 能在概念地图上找到任何新术语的位置

---

## 4. 阶段 2：Prompt Engineering（1-2 周）

**目标**：能用 Prompt 让 LLM 稳定输出你想要的内容。

### 必学内容

| 技术 | 说明 | 实战任务 |
|------|------|---------|
| **Zero-shot** | 不给示例直接问 | 让模型总结一段新闻 |
| **Few-shot** | 给 2-5 个示例引导格式 | 让模型按指定 JSON schema 输出 |
| **Chain-of-Thought** | "一步步思考" | 解一道数学应用题 |
| **Role Prompting** | 给模型设定角色 | 让模型扮演产品经理写需求文档 |
| **Structured Output** | 强制 JSON 输出 | 让模型输出 `{summary, keywords, sentiment}` |
| **避免幻觉** | 引用上下文、不确定就说"不知道" | 让模型基于给定文档回答，超纲就拒绝 |

### 实战项目

- **任务**：写一个 Prompt，让 LLM 把任意文章转成结构化摘要（标题、关键词、3 句话总结、推荐标签）
- **进阶**：用同一 Prompt 跑 10 篇文章，人工评估稳定性

### 推荐资源

- OpenAI 官方 Prompt Engineering Guide
- Anthropic 的 Prompt Engineering 文档
- Learn Prompting（开源教程）

### 出师标准

- 能写出一个稳定输出 JSON 的 Prompt
- 能用 CoT 让模型做对小学数学题
- 知道什么时候该用 Few-shot，什么时候该换 Fine-tuning

---

## 5. 阶段 3：API 调用与 SDK（1 周）

**目标**：用代码调用 LLM，把 Prompt 工程的产品化。

### 必学内容

- OpenAI / Anthropic / 国内模型 SDK 基本用法
- 同步 / 异步 / 流式响应
- Token 计数与成本估算
- 错误处理与重试
- Function Calling（工具调用的基础）

### 实战项目

- **任务 1**：写一个 CLI 工具，输入一段文本输出摘要
- **任务 2**：写一个流式聊天机器人（终端版）
- **任务 3**：实现 Tool Calling — 让 LLM 调用你写的 `get_weather()` 函数

### 代码骨架

```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "用一句话解释什么是 RAG"}],
)
print(response.content[0].text)
```

### 出师标准

- 能用代码稳定调用 LLM API
- 能实现流式输出
- 能用 Tool Calling 让 LLM 调一个真实函数

---

## 6. 阶段 4：RAG 实战（2-3 周）

**目标**：做出一个能基于私有文档回答问题的问答系统。

### 必学内容

1. **Embedding** — 选模型、调 API、理解语义相似度
2. **向量数据库** — 选型（Chroma / Qdrant / pgvector）、CRUD、检索
3. **Chunking** — 分块策略对召回质量的影响
4. **检索 + 生成** — 把检索结果拼进 Prompt
5. **RAG 评估** — Recall / Faithfulness / Answer Relevancy
6. **RAG 进阶** — Hybrid Search、Reranker、Query Rewriting、HyDE

### 实战项目（递进式）

| 阶段 | 项目 | 关键技术 |
|------|------|---------|
| v1 | 把 1 篇 markdown 切块 → 检索 → 回答 | 基础 RAG |
| v2 | 接入 100+ 篇文档，加 Reranker | 提精度 |
| v3 | 加 Hybrid Search（向量+BM25） | 关键词召回 |
| v4 | 用 RAGAS 自动评估 | 量化效果 |
| v5 | 加 Query Rewriting 支持多轮对话 | 用户体验 |

### 推荐技术栈

- Embedding：`bge-large-zh-v1.5`（中文）或 `text-embedding-3-small`（OpenAI）
- 向量库：Chroma（原型）→ Qdrant / pgvector（生产）
- 框架：LlamaIndex（RAG 专精）或 LangChain（通用）
- 评估：RAGAS

### 出师标准

- 能搭出一个文档问答系统，准确率 > 80%
- 能解释清楚每个环节为什么这么选
- 知道 RAG 失败时怎么排查（召回差？生成跑偏？上下文太长？）

---

## 7. 阶段 5：Tool Calling 与 MCP（1-2 周）

**目标**：让 LLM 能调用外部工具，从"会说"变"会做"。

### 必学内容

- Tool Calling / Function Calling 的完整流程
- 工具描述（JSON Schema）怎么写
- 多工具选择与并行调用
- **MCP（Model Context Protocol）** — 标准化工具协议
  - MCP Server 端开发
  - MCP Client 端集成
  - 与现有 Tool Calling 的关系

### 实战项目

- **任务 1**：给 LLM 加 3 个工具 — `search_web`、`get_weather`、`run_python`
- **任务 2**：写一个 MCP Server，暴露文件系统读写能力
- **任务 3**：用 Claude Desktop 接你自己的 MCP Server

### MCP 代码骨架

```typescript
// 一个最小的 MCP Server
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new Server({ name: "my-tools", version: "0.1.0" });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_time",
    description: "获取当前时间",
    inputSchema: { type: "object", properties: {} },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === "get_time") {
    return { content: [{ type: "text", text: new Date().toISOString() }] };
  }
});

await server.connect(new StdioServerTransport());
```

### 出师标准

- 能让 LLM 自主选择并调用多个工具
- 能写一个 MCP Server 并被 Claude / Cursor 等客户端使用
- 知道工具描述怎么写能让模型选得更准

---

## 8. 阶段 6：Agent 开发（3-4 周）

**目标**：做出能自主完成多步任务的 AI Agent。

### 必学内容

1. **Agent 核心循环** — ReAct（Reasoning + Acting）
2. **Agent 四要素** — Planner / Tools / Memory / Reflection
3. **Agent 模式** — ReAct / Plan-and-Solve / Reflexion / ToT
4. **多 Agent 协作** — 角色分工、消息传递、冲突处理
5. **长记忆** — 用向量库持久化 Agent 经验
6. **Agent 框架对比** — LangGraph / AutoGen / CrewAI / MetaGPT

### 实战项目（递进式）

| 阶段 | 项目 | 关键能力 |
|------|------|---------|
| v1 | 单 Agent：自动查资料 + 总结 + 输出报告 | 基础 ReAct |
| v2 | 加反思机制：生成后自评并改进 | Reflexion |
| v3 | 多 Agent：研究员 + 写手 + 审稿员协作 | 多 Agent |
| v4 | 加长记忆：记住用户偏好跨会话使用 | Memory |
| v5 | Coding Agent：能读写代码、跑测试、修 Bug | 工具集成 |

### 推荐框架

- **入门**：LangGraph（状态图式，可控性强）
- **多 Agent**：AutoGen（对话式协作）
- **流程化**：CrewAI（角色驱动）
- **复杂工程**：MetaGPT（软件公司式）

### 出师标准

- 能搭出一个能完成 5+ 步任务的 Agent
- 能解释 ReAct 循环的每一步在做什么
- 知道 Agent 卡死 / 死循环 / 工具失败时怎么处理
- 能用 LangGraph 画出一个状态机式 Agent

---

## 9. 阶段 7：工程化与部署（2-3 周）

**目标**：把 demo 变成可上线、可维护的产品。

### 必学内容

| 维度 | 内容 |
|------|------|
| **评估** | 离线评估（MMLU/RAGAS）+ 在线评估（用户反馈/A-B 测试） |
| **监控** | 调用量 / 延迟 / Token 成本 / 错误率 / 幻觉率 |
| **安全** | Prompt Injection 防护、输出过滤、PII 脱敏 |
| **成本** | Token 优化、缓存、模型分级（贵模型管难任务，便宜模型管简单任务） |
| **部署** | Serverless / 自托管 / 混合部署选型 |
| **可观测性** | LangSmith / Langfuse / 自建日志 |

### 实战任务

- 把前面做的 RAG / Agent 项目套上完整的工程化外壳：
  - 加日志（每次调用记录 input/output/cost）
  - 加监控（Grafana 看板）
  - 加评估（每次发版跑回归测试集）
  - 加护栏（输入/输出安全过滤）
  - 上线（Vercel / Render / 自托管）

### 出师标准

- 项目能在生产环境稳定运行 1 周+ 不出大问题
- 能从日志中定位一次"模型回答异常"的根因
- 知道每月成本大概多少、怎么优化

---

## 10. 阶段 8：进阶方向（持续学习）

到达这一步你已经能独立做出 AI 应用了，下面是可选的进阶方向：

| 方向 | 适合谁 | 入门资源 |
|------|--------|---------|
| **Fine-tuning** | 想让模型学特定风格 / 领域 | LoRA / QLoRA 实战 |
| **多模态** | 想处理图像/音频/视频 | VLM API + 跨模态 RAG |
| **推理优化** | 想自托管大模型降本 | vLLM / SGLang / 量化 |
| **模型训练** | 想从 0 训练或继续预训练 | LLaMA factory + H100 |
| **AI Safety** | 关心对齐、安全、可控 | Constitutional AI、RLHF 论文 |
| **AI Infra** | 想做平台/中台 | 向量库、调度、Multi-tenant |
| **Coding Agent** | 想做 Cursor / Devin 类产品 | SWE-Agent、Code Interpreter |

---

## 11. 时间规划参考

按每周投入 **10-15 小时**估算：

| 阶段 | 周数 | 累计 | 阶段产出 |
|------|------|------|---------|
| 0 基础准备 | 1-2 | 2 | 能跑 demo |
| 1 概念地图 | 1 | 3 | 看懂术语 |
| 2 Prompt | 1-2 | 5 | 稳定 JSON 输出 |
| 3 API/SDK | 1 | 6 | CLI 工具 |
| 4 RAG | 2-3 | 9 | 文档问答系统 |
| 5 Tool/MCP | 1-2 | 11 | 工具型 Agent |
| 6 Agent | 3-4 | 15 | 多步任务 Agent |
| 7 工程化 | 2-3 | 18 | 上线产品 |
| 8 进阶 | 持续 | — | 专项能力 |

> 💡 **加速建议**：阶段 4-6 是核心，投入 60% 的时间；阶段 0-3 可以快进，边做项目边补。

---

## 12. 学习方法

### 三条铁律

1. **项目驱动** — 每个阶段必须有可运行的产出，不要只看不动手
2. **教学相长** — 学完一个主题就写一篇笔记 / 录一个视频讲清楚
3. **复现优先** — 看到任何论文/demo，先尝试自己复现一遍再看答案

### 推荐节奏

- **工作日**：每天 1-2 小时（看资料 + 写代码）
- **周末**：半天 4-5 小时（做项目）
- **每周**：写一篇周报，总结学到了什么、卡在哪里

### 避免的陷阱

- ❌ **囤教程不行动** — 看了 100 篇文章不如动手写 1 个 demo
- ❌ **追新论文** — 入门阶段别追 SOTA，先把基础打牢
- ❌ **只学框架不学原理** — LangChain 会过时，原理不会
- ❌ **跳过 RAG 直接做 Agent** — Agent 的本质是"带工具的 RAG"
- ❌ **闭门造车** — 加社区、问问题、看别人怎么做的

---

## 13. 推荐资源地图

### 系统课程

| 平台 | 资源 | 适合阶段 |
|------|------|---------|
| **claude.haylee.site** | Claude Code Tutorial（20 章交互式课程） | 阶段 2-6 |
| **ML 课程笔记** | 李宏毅老师 ML/DL/RL/生成式 AI | 阶段 1、8 |
| **AI 工程化** | RAG / MLOps / 基础设施实战 | 阶段 4、7 |

### 实战社区

- **Anthropic Discord** — Claude 用户社区
- **OpenAI Developer Forum** — 官方开发者论坛
- **Hugging Face** — 模型 / 数据集 / Spaces
- **Papers with Code** — 论文 + 代码

### 必读论文（按顺序）

1. **Attention Is All You Need**（2017）— Transformer 起点
2. **GPT-3: Language Models are Few-Shot Learners**（2020）— 大模型时代
3. **Training language models to follow instructions with RLHF**（InstructGPT, 2022）— 对齐范式
4. **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**（RAG 原始论文, 2020）
5. **ReAct: Synergizing Reasoning and Acting in Language Models**（2022）— Agent 基础
6. **Constitutional AI: Harmlessness from AI Feedback**（2022）— 安全对齐

### 必关注的博客 / Twitter

- Anthropic Blog（Claude 背后的团队）
- OpenAI Blog
- Lilian Weng's Blog（前 OpenAI 研究员，深度长文）
- Andrej Karpathy（教学视频 + Twitter）

---

## 14. 阶段检查清单

### 阶段 0-3 检查清单

- [ ] 能用 Python 调通 LLM API
- [ ] 能写出稳定输出 JSON 的 Prompt
- [ ] 能用 CoT 让模型做对数学题
- [ ] 能用 Tool Calling 让模型调函数
- [ ] 看到任何 AI 术语都能在概念地图上定位

### 阶段 4-6 检查清单

- [ ] 做过一个能跑的 RAG 系统
- [ ] 用 RAGAS 评估过 RAG 效果
- [ ] 写过一个 MCP Server
- [ ] 做过一个能完成 5+ 步任务的 Agent
- [ ] 用 LangGraph 画过状态机
- [ ] 做过多 Agent 协作的 demo

### 阶段 7-8 检查清单

- [ ] 项目上线过（哪怕是免费托管）
- [ ] 加过日志、监控、评估
- [ ] 算过每月成本并优化过
- [ ] 能给非技术人讲清楚你的项目做了什么
- [ ] 选了一个进阶方向持续深耕

---

## 结语

**学习路径不是直线，是螺旋**。每过一阶段回头看前面的内容，会有新的理解。不要怕回炉重造，这是正常的学习节奏。

**最重要的三件事**：

1. **动手** — 看完这篇笔记立刻去开一个项目
2. **坚持** — 哪怕每天只写 30 分钟代码
3. **分享** — 把学到的写下来、讲出去，教是最好的学

**现在该做什么？**

- 完全新手 → 从阶段 0 开始，先注册一个 GitHub 账号
- 有点基础 → 跳到阶段 4 做 RAG 项目
- 已经在做 Agent → 直接看阶段 7 工程化
- 想找完整课程 → [claude.haylee.site](https://claude.haylee.site/) 的 20 章 Agent 课程
