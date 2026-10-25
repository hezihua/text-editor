---
title: '🚀 别再只盯着 Prompt 了！2025 年 AI 开发的核心是「上下文工程」'
description: '从 Prompt Engineering 到 Context Engineering，李宏毅教授解读 2025 年 AI Agent 开发的核心方法论：选择、压缩、多智能体与 Agentic Context Engineering。'
date: "2025-09-19"
tags: [上下文工程, AI Agent, RAG, Tool Use, 李宏毅]
course: generative-ai
lecture: 3
---

> **课程来源：** 台大李宏毅《生成式人工智慧与机器学习导论》2025 Fall 第2讲  
> **影片链接：** [YouTube](https://youtu.be/lVdajtNpaGI)  
> **投影片：** [Agent.pdf](https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall-course-data/Agent.pdf)

---

## 一、前言：Prompt Engineering 过时了吗？

课程核心立场非常明确：
**这堂课不训练任何模型，只训练人类。**
在模型参数不动的前提下，通过精心设计、筛选、压缩、组织送入模型的信息，就能大幅提升表现。

在 2023 年，我们还在疯狂寻找那些能让 GPT-3 听话的"神奇咒语"（Magic Spells）。比如为了让模型输出更长，我们加一堆空行；为了让它逻辑更好，我们加一句"Let's think step by step"。

但在 2025 年的今天，随着模型能力的指数级提升，这些"咒语"逐渐失效了。模型本该尽力做到最好，而不是靠你给小费（"答对给你小费"）才肯好好干活。

李宏毅教授在最新的课程中指出，我们正从 **Prompt Engineering（提示词工程）** 迈向 **Context Engineering（上下文工程）**。

> **核心观点：** 如果你把大模型看作一个函数 $f(x)$，在无法改变模型参数 $f$（Training）的情况下，我们不仅要设计输入 $x$（Prompt），更要**动态地、自动化地管理整个上下文环境**。

---

## 二、什么是上下文工程 (Context Engineering)？

简单来说，Prompt Engineering 关注的是"怎么问"，而 Context Engineering 关注的是**"给模型看什么"**。

- **Prompt Engineering** 更关注「输入格式」和「神奇咒语」。但随着模型进步，这些技巧的效果正在快速衰减。
- **Context Engineering** 是更广义、更系统的概念。它关注的是：**整个送入语言模型的信息集合**，如何在有限的 Context Window 里放入最合适、最高信噪比的内容。

一个完整的 Context 不仅仅是一句指令，它包含了以下组成部分：

### 2.1 User Prompt（用户提示）

- 任务说明（例如「写一封信跟老师说 meeting 要請假」）
- 详细指引（开头先道歉、说明理由、最后说之后再找时间更新进度）
- 额外条件（100字以内）、输出风格（非常严肃）
- **范例（Examples）**：In-context Learning 的核心。模型参数没有改变，只是通过例子就学会了任务。Gemini 1.5 的实验甚至显示，给平行范例比给语法解释更有效。

### 2.2 System Prompt（系统提示）

- 定义身份、产品信息、使用说明与限制、互动态度、安全与禁止事项、回应风格与格式、知识截止时间、自我定位与哲学原则、错误处理方式等。
- 以 Claude 官方公布的 System Prompt 为例，长达 2516 个词，内容非常详尽。

### 2.3 Dialogue History（对话历史 / 短期记忆）

- 之前的对话内容。注意：这些历史并没有真正训练模型，只是临时放在 Context 里。

### 2.4 Long-term Memory（长期记忆）

- 可以持久存储在硬盘或其他地方的信息，需要时再读入 Context。

### 2.5 External Knowledge / RAG（外部知识）

- 搜索网络、数据库等。ChatGPT 搭配搜索引擎就是典型例子。RAG 的核心是「检索增强生成」。

### 2.6 Tool Use（工具使用）

- 模型通过特殊格式输出工具调用指令（例如 `<tool>Temperature('高雄', '2025.03.10 14:00')</tool>`），系统执行后把结果放回 Context（`<output>摄氏32度</output>`），模型再继续生成最终回答。
- 更进阶的是 **Computer Use**：让模型直接用滑鼠、键盘操控电脑，能做人类能用电脑做的事。

### 2.7 Reasoning（模型自己产生的思考过程）

- 规划、尝试、验证的「脑内小剧场」（ChatGPT o系列、DeepSeek R1、Gemini Deep Think 等都有）。这部分可以选择不呈现给用户，甚至完全隐藏。

**Context Engineering 的核心目标只有一句话：避免塞爆 Context，只把最需要的信息放进去。**

---

## 三、为什么 Context Engineering 至关重要？

李老师把使用方式分成三个层次：

- 一般使用：一问一答
- Agentic Workflow：按照固定 SOP 执行
- **真正的 AI Agent**：自己决定解决步骤、灵活调整计划

AI Agent 的运作逻辑是：**Goal → Action → Observation** 的循环，几乎有无限可能。

从语言模型的角度看，Agent 只是在不断「接龙」。但随着步骤增加，system prompt + 历史 action + observation 会快速累积，Context 很快爆炸。因此，AI Agent 必须扮演「语言模型的守门人」角色，负责筛选、压缩合适长度的输入。

### 3.1 上下文窗口不是"全知全能"

虽然 Gemini 1.5 宣称支持 200 万 Token，Llama 4 支持 1000 万 Token，但这不代表模型能"读懂"这么长的内容。

- **Lost in the Middle:** 研究表明，模型对上下文的**开头和结尾**记忆最深，中间的内容容易被遗忘。
- **Context Rot (上下文腐烂):** 随着输入变长，模型甚至会连"复制这段文字"这种简单任务都做不好。

### 3.2 垃圾进，垃圾出

如果你把搜到的 20 篇文章全塞给模型，它可能会因为信息过载而"发疯"。实验证明，给模型太多无关信息，效果甚至不如不给。

---

## 四、上下文工程的核心策略

如何管理好这个庞大的 Context？李宏毅教授总结了以下几个核心策略：

### 4.1 选择 (Selection) —— 别什么都给模型看

这是 RAG（检索增强生成）的核心逻辑。不要把所有数据都塞进去，要**挑选**。

- **关键词优化：** 用一个小模型把用户的自然语言转化为搜索关键词。
- **Rerank (重排序)：** 搜索到的文章，先让一个小模型（如 `<300M` 参数）读一遍，判断相关性，只把最相关的句子或段落放进 Context。
- **工具选择：** 如果有 1000 个 API 工具，不要全写进 System Prompt。根据用户意图，只加载相关的工具说明（Tool-use RAG）。
- **记忆筛选：** 就像斯坦福小镇（Stanford Town）的实验，Agent 的记忆库里有无数琐事。当需要回答问题时，根据**最近度 (Recency)**、**重要度 (Importance)** 和 **相关度 (Relevance)** 打分，只把高分记忆加载进 Context。

> 💡 **避坑指南：** 论文发现，给模型看它**过去答错的记忆**，往往会起到反效果（就像叫人"别想白熊"，它偏想）。尽量只给它看成功的经验。

### 4.2 压缩 (Compression) —— 让记忆随风而逝

当对话历史太长，超过了 Context Window 怎么办？直接截断会丢失信息，更好的做法是**摘要**。

- **递归压缩：** 每互动 100 轮，就调用一次模型对历史记录进行摘要。
- **细节剥离：** 比如 Agent 在操作电脑订票，它不需要记住"鼠标移动到了坐标 (100, 200)，弹出了一个广告，我点了关闭"。这些琐碎信息可以压缩成一句话："**成功预订了 9 月 19 日的餐厅**"。
- **简单粗暴法：** 实验证明，把工具输出直接替换成「这里曾经有个工具的输出」，有时效果意外地好。
- **硬盘外挂：** 被压缩掉的详细信息存入硬盘，如果后续真的需要，再通过 RAG 读取。

> ⚠️ **Context Collapse：** 反复摘要会导致重要细节逐渐丢失，需要权衡压缩力度与信息保留。

### 4.3 记忆管理 —— 按需加载

- 区分「会真正丢进语言模型的 Context」和「存在硬盘的信息」
- 类似 Rick and Morty 式的记忆管理：需要时才加载
- **Skill 的概念：** 把大量程序、知识、工具说明放在 Context 外，任务匹配时再读入

### 4.4 多智能体 (Multi-Agent) —— 分而治之

这是管理 Context 的架构级解法。

想象一个软件公司：CEO 负责统筹，程序员负责写代码，测试员负责找 Bug。

- **Single-Agent 的困境：** 如果让一个 Agent 既写代码又订餐厅又写报告，它的 Context 会迅速被各种琐碎信息塞满，导致"发疯"。
- **Multi-Agent 的优势：**
  - **隔离 Context：** 订餐厅的 Agent 只需要知道餐厅的信息，不需要知道订旅馆的细节。
  - **并行处理：** 写综述论文时，可以让 Agent A 读论文 1-10，Agent B 读论文 11-20，最后汇总摘要。这比把 100 篇论文塞给一个 Agent 效率高得多。
- **Sub-Agent（子代理）：** 让子 Agent 负责自主压缩或过滤信息，从源头减少进入主 Context 的长度。

### 4.5 进阶方向：Agentic Context Engineering

把 Context Engineering 本身也交给语言模型，让 AI 自主决定如何管理、筛选、压缩上下文。

---

## 五、总结

从 Prompt Engineering 到 Context Engineering，本质上是 AI 应用从**"单次问答"**向**"复杂任务自动化 (Agentic Workflow)"**的进化。

作为开发者，我们不再是简单的"咒语念诵者"，而是**信息的架构师**。我们需要设计系统，让模型在正确的时间，看到正确的信息，忘掉无关的噪音。

> 语言模型就像一种新的操作系统，Context Window 就是它的 RAM。Prompt Engineering 是写好那张便利贴，Context Engineering 则是决定桌上该放哪些资料夹、开着哪些系统、保留哪些历史。

**2025 年的 AI 竞争力，不在于你会写多复杂的 Prompt，而在于你如何优雅地管理 Context。**

课程还提供了 Colab 工具使用范例（时间戳约 39:20），并推荐延伸观看：
- 《一堂课搞懂 AI Agent 的原理》
- 《大型语言模型是如何进行「深度思考」（Reasoning）的？》
