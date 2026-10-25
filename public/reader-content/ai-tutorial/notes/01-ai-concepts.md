---
title: AI 概念全解析
description: 一文理清 AI、ML、DL、LLM、Agent、RAG、Fine-tuning、Embedding、MCP、VLM、MoE 等核心概念的关系、区别与适用场景，建立完整的 AI 知识地图。
date: 2026-08-14
tags: [AI, 概念地图, 入门指南, LLM, Agent, RAG, MCP, VLM, MoE]
---

## 引言：为什么需要一张概念地图

> 面对 AI 领域层出不穷的术语（AI、ML、DL、LLM、Agent、RAG、Fine-tuning、MCP、MoE、VLM……），很多初学者感到无从下手。本文用一张递进式的地图，把这些概念放到它们该在的位置上，形成一张完整的 AI 知识图谱。

---

## 1. 最大的圈：AI（Artificial Intelligence，人工智能）

**AI 是所有智能行为的统称**，目标是让机器具备类似人类的感知、推理、学习、决策能力。

AI 可以分成两大流派：

| 流派 | 代表方法 | 一句话 |
|------|---------|--------|
| **符号主义**（Good Old-Fashioned AI） | 规则引擎、专家系统、知识图谱 | 人把知识编码成规则，机器照做 |
| **连接主义**（统计学习） | 机器学习、深度学习、神经网络 | 机器从数据中自动学习规律 |

2012 年之前主流是符号主义；2012 年之后，深度学习（连接主义）成为绝对主流。

---

## 2. AI 的子集：ML（Machine Learning，机器学习）

**ML = 不用手写规则，让算法从数据中自动学习规律。**

三种基本范式：

- **监督学习（Supervised Learning）** — 有标签数据训练
  例：垃圾邮件分类、房价预测、图像识别
- **无监督学习（Unsupervised Learning）** — 无标签数据找结构
  例：用户分群、降维（PCA、t-SNE）、异常检测
- **强化学习（Reinforcement Learning）** — 通过与环境交互获得奖励来学习
  例：AlphaGo、自动驾驶、机器人控制、RLHF

> 🧠 记住：AI ⊃ ML，深度学习只是 ML 的一种方法。

---

## 3. ML 的子集：DL（Deep Learning，深度学习）

**DL = 用多层神经网络（深度 > 2 层）进行表示学习。**

为什么叫"深度"？因为特征不是人工设计的（如 SIFT 特征），而是网络通过逐层变换自动学到的**表示（representation）**。

里程碑：

| 年份 | 事件 | 意义 |
|------|------|------|
| 2012 | **AlexNet** 赢得 ImageNet | 深度学习正式击败传统方法 |
| 2017 | **Transformer** 论文（Attention Is All You Need） | 奠定了现代 LLM 的架构基础 |
| 2020 | **GPT-3** / 2022 **ChatGPT** | 大语言模型进入大众视野 |

DL 里最核心的模型家族：

| 架构 | 擅长 | 代表模型 |
|------|------|---------|
| **CNN**（卷积神经网络） | 图像/视觉（局部特征提取+参数共享） | ResNet、EfficientNet、Vision Transformer |
| **RNN/LSTM** | 早期序列建模（有长程依赖问题） | Seq2Seq、LSTM、GRU |
| **Transformer** | 序列/文本（自注意力，可并行，全局建模） | BERT、GPT、T5、LLaMA |
| **Diffusion Model** | 生成（图像/视频/音频） | Stable Diffusion、Sora、FLUX |
| **Mamba / SSM** | 长序列（线性复杂度，挑战 Transformer） | Mamba、RWKV |

---

## 4. DL 的子集：LLM（Large Language Model，大语言模型）

**LLM = 参数规模极大（通常 ≥ 1B）、基于 Transformer 解码器结构、在海量文本上做"下一个词预测"（next-token prediction）预训练的语言模型。**

### 4.1 关键性质

1. **涌现能力（Emergence）** — 在小模型上不存在、大到一定程度突然具备的能力（推理、指令跟随、少样本学习）
2. **Scaling Law** — 模型效果随参数量、训练数据量、计算量的增大可预测地提升
3. **预训练-微调范式** — 基座模型（Base Model）+ 对齐（Alignment）→ 可用的对话模型（Chat Model）

### 4.2 Tokenization（分词）

LLM 不认识"词"，只认识 **Token**。Tokenization 就是把文本切成 token 的过程：

- **BPE（Byte-Pair Encoding）** — GPT 系列使用，从字符级逐步合并
- **SentencePiece** — LLaMA / Gemini 使用，基于子词
- 分词直接影响：上下文窗口利用率、多语言支持、代码处理

> 一个汉字 ≈ 1-2 个 token，一个英文单词 ≈ 1-1.5 个 token。Token 是计费单位。

### 4.3 Context Window（上下文窗口）

模型单次能处理的最大 token 数，决定了"记忆"容量和单次任务复杂度：

| 窗口大小 | 代表模型 | 典型场景 |
|---------|---------|---------|
| 8K-32K | GPT-3.5, Claude 3 Sonnet | 日常对话、文档问答 |
| 128K-200K | GPT-4o, Claude 3.5 Sonnet | 长文档分析、代码库理解 |
| 1M+ | Gemini 1.5 Pro, Qwen 长上下文 | 整本书籍、大型代码库 |

> ⚠️ 窗口不是越大越好：窗口越长，注意力计算越慢，成本越高。长上下文不等于强推理。

### 4.4 MoE（Mixture of Experts，专家混合）

**MoE = 模型内有多个"专家"子网络，每个 token 只激活其中少数几个**（稀疏激活）。

- 优势：参数量极大（可达万亿级），但计算量和普通模型相当
- 代表：GPT-4o（传闻）、Mixtral 8x7B、Qwen-MoE
- 代价：推理复杂、负载均衡难、训练不稳定

### 4.5 基座模型 vs 对话模型

- **基座模型（Base / Pre-trained）** — 只学会了"续写"，给一段文本自动补下一个 token，不能直接用于对话
- **对话模型（Chat / Instruction-tuned）** — 在基座模型上经过 **SFT + RLHF/DPO** 等对齐后得到，能遵循指令、聊天气、拒绝有害请求

### 4.6 对齐的三步曲

```
基座模型 ──► SFT（有监督微调）
              │
              ├──► 训练奖励模型（RM）
              │
              └──► RLHF / DPO（人类偏好对齐）
                        │
                        ▼
                  对话 / 指令模型
```

对齐进阶：

| 方法 | 说明 |
|------|------|
| **RLHF** | 基于奖励模型的强化学习，经典但复杂 |
| **DPO** | 直接偏好优化，无需奖励模型，当前主流 |
| **ORPO / KTO** | DPO 的简化/改进版 |
| **Constitutional AI** | 用"原则"替代人工标注，让模型自己对齐 |
| **Safety Guardrails** | 输出后加安全过滤层，拦截有害内容 |

### 4.7 多模态 LLM（VLM / MLLM）

**VLM = 能同时处理文本+图像/音频/视频的大模型。**

| 类型 | 代表模型 | 能力 |
|------|---------|------|
| 视觉语言（VLM） | GPT-4o、Claude Vision、Gemini Pro | 看图问答、OCR、图表分析 |
| 音频语言 | Gemini Audio、ChatGPT 的语音模式 | 语音对话、音频理解 |
| 视频语言 | Sora、Runway、Kling | 视频生成、视频理解 |
| 全模态 | Gemini Ultra | 文本+图像+音频+视频+代码 |

> 📌 多模态的"多"是指输入/输出模态的多样性，不是指多个模型。

---

## 5. LLM 之上：怎么让它"更懂"？

直接用 ChatGPT / Claude 回答有两个问题：**知识过时**、**不懂我的私有数据**。业界有三个常用的增强手段：

| 方法 | 解决的问题 | 什么时候用 |
|------|-----------|-----------|
| **RAG**（检索增强生成） | 注入外部知识，减少幻觉 | 文档问答、知识库、FAQ，"想让模型看某份文件" |
| **Fine-tuning**（微调） | 学习新的说话风格 / 格式 / 特定任务 | 希望模型持续输出特定风格，RAG 达不到的结构化输出 |
| **Prompt Engineering** | 引导模型的行为、减少错误 | 通用场景，成本最低、迭代最快 |

> 💡 黄金法则：**先 Prompt，再 RAG，最后才 Fine-tuning**。越后面越重、越贵。

---

## 6. Prompt Engineering（提示工程）

**Prompt = 你给 LLM 的指令和上下文。Prompt Engineering = 设计更好的指令，让模型输出更准。**

进阶技巧：

| 技术 | 说明 | 效果 |
|------|------|------|
| **Zero-shot** | 不给示例直接问 | 最简单，适合常识性问题 |
| **Few-shot** | 给 2-5 个示例 | 快速引导格式和风格 |
| **Chain-of-Thought (CoT)** | 让模型"一步步想" | 提升推理准确率，数学/逻辑题必备 |
| **Tree-of-Thoughts (ToT)** | 让模型探索多条推理路径 | 复杂规划/决策问题 |
| **Self-Consistency** | 多次采样取多数 | 提升确定性，适合答案唯一的问题 |
| **ReAct** | Reasoning + Acting 交替 | Agent 的核心推理模式 |
| **Structured Output** | 强制 JSON / Schema 输出 | 保证格式稳定，便于程序消费 |

---

## 7. RAG（Retrieval-Augmented Generation，检索增强生成）

**一句话：先去知识库查文档，把查出来的片段连同用户问题一起丢给 LLM，让它基于上下文生成答案。**

### 7.1 标准 RAG 流水线

```
用户提问 ──► 向量化（Embedding）
              │
              ▼
           向量数据库  ──►  相似度检索 Top-K 片段
              │
              ▼
  把片段 + 原始提问组装成 System Prompt
              │
              ▼
         LLM 生成回答（有据可依，减少幻觉）
```

关键组件：

- **Embedding（文本向量化）** — 把一段文本变成高维向量（如 1536 维），语义越接近的文本，向量距离越近
- **向量数据库** — 存向量并做近似最近邻检索（Pinecone、Weaviate、Qdrant、pgvector、Chroma、Milvus）
- **Chunking（分块策略）** — 文档按合理大小切块，直接影响召回质量
- **Reranker** — 二次精排 Top-K，提升精准度

### 7.2 RAG 进阶变种

| 变种 | 核心思路 | 适用场景 |
|------|---------|---------|
| **Graph RAG** | 用知识图谱替代纯向量检索 | 实体关系复杂的领域（医疗、法律） |
| **Self-RAG** | 让模型自己决定是否需要检索、检索什么 | 动态知识库问答 |
| **Agentic RAG** | Agent 自主迭代检索-生成循环 | 复杂多跳问题 |
| **Hybrid Search** | 向量（语义）+ BM25（关键词）混合检索 | 需要精确匹配关键词的场景 |
| **HyDE** | 先生成"假设答案"再用它做向量检索 | 原始查询太短/太模糊时 |
| **Query Rewriting** | 把用户问题改写成更适合检索的形式 | 口语化查询、多轮对话 |
| **Sub-question Decomposition** | 把复杂问题拆成多个子问题分别检索 | 多跳推理问题 |

### 7.3 RAG 评估

| 指标 | 说明 |
|------|------|
| **召回率（Recall）** | 正确文档被检索到的比例 |
| **精确率（Precision）** | 检索到的文档中正确的比例 |
| **Faithfulness** | 回答是否完全基于检索到的上下文（反幻觉） |
| **Answer Relevancy** | 回答是否切中问题要害 |
| **Context Recall** | 生成答案所需的信息是否都在上下文中 |

工具：**RAGAS** 是当前主流的 RAG 评估框架。

---

## 8. Embedding（向量嵌入）

**Embedding = 把非结构化数据（文本/图像/音频）映射到一个高维向量空间，让"语义相近 ↔ 向量距离近"。**

例子：
- `cat` 和 `kitten` → 向量距离近
- `cat` 和 `rocket` → 向量距离远
- 一段"如何买火车票"的查询 → 最接近购票教程文档的向量

Embedding 不只是 RAG 用：分类、聚类、推荐、语义搜索、异常检测都靠它。

主流 Embedding 模型：

| 模型 | 维度 | 特点 |
|------|------|------|
| text-embedding-3-small | 1536 | OpenAI，性价比高 |
| text-embedding-3-large | 3072 | OpenAI，效果更好 |
| bge-large-zh-v1.5 | 1024 | 中文场景首选 |
| e5-large-v2 | 1024 | 开源通用 |
| jina-embeddings-v2 | 768/1024 | 多语言长上下文 |

---

## 9. Fine-tuning（微调）

**微调 = 拿预训练好的模型，用一个较小的专属数据集继续训练若干步，让模型适配特定任务。**

### 9.1 三种基础方案

| 方案 | 改哪些参数 | 成本 | 效果 |
|------|-----------|------|------|
| **Full Fine-tuning** | 全量参数 | 最高 | 最好 |
| **LoRA / QLoRA** | 只加低秩适配器，原模型冻住 | 低 | 接近全量，业界主流 |
| **Prompt Tuning** | 只学前缀 prompt 向量 | 最低 | 适合数据充足的简单任务 |

### 9.2 微调进阶

| 技术 | 说明 |
|------|------|
| **QLoRA** | 量化 + LoRA，单张消费级显卡可微调 70B 模型 |
| **DoRA** | Weight-decomposed Low-Rank Adaptation，效果优于 LoRA |
| **LongLoRA** | 扩展上下文窗口的微调方法 |
| **LoHA / LoKr** | LoRA 的变体，不同的低秩分解方式 |

微调主要解决的问题：
- **风格迁移**：让模型始终用某品牌的口吻输出
- **格式对齐**：稳定输出特定 JSON 结构
- **垂直领域指令遵循**：医疗、法律、代码等领域的"黑话"

> ❗ 不要用微调来"灌知识" — 模型会把知识揉进参数里，更新代价高，且容易忘。用 RAG 存知识，微调管风格。

---

## 10. 最高级：AI Agent（智能体）

**Agent = LLM + 记忆 + 工具 + 规划/反思的闭环。**

### 10.1 核心循环（ReAct / Plan-Act-Observe）

```
      ┌─────────────────────────────┐
      │                             ▼
   思考/规划  ───►  选工具 & 构造参数
      │                    │
      │                    ▼
      │               调用工具执行
      │                    │
      │                    ▼
      ◄────  观察结果（工具返回）
                 │
                 ▼
           判断是否达成目标？
                 │ 是
                 ▼
              输出答案
```

### 10.2 Agent 四要素

1. **Planner（规划器）** — 把复杂任务拆成步骤（Chain-of-Thought、Tree-of-Thoughts）
2. **Tool Use（工具使用）** — 搜索引擎、代码执行、数据库、文件系统、日历、API…… LLM 充当"大脑"，工具是"手脚"
3. **Memory（记忆）** — 短期（会话上下文）+ 长期（向量库、知识库）+ 语义记忆
4. **Reflection（反思）** — 做完回头看，判断结果是否合理、要不要重来

### 10.3 Tool Calling / Function Calling

**Tool Calling = LLM 在对话中主动"请求"调用某个外部工具，由程序执行后把结果回传给 LLM。**

```
用户: "北京今天天气怎么样？"
  │
  ▼
LLM 输出: { "tool_call": { "name": "get_weather", "args": { "city": "北京" } } }
  │
  ▼
程序执行 get_weather("北京") → 返回 { "temp": 23, "condition": "晴" }
  │
  ▼
LLM 接收结果，生成自然语言回答: "北京今天晴，23°C"
```

> 🔑 Tool Calling 是 Agent 的基石，也是 LLM 与外部世界交互的唯一方式。

### 10.4 MCP（Model Context Protocol）

**MCP = 连接 LLM 与外部工具/数据源的开放协议，定义了"LLM 怎么找到工具、怎么传参数、怎么接结果"。**

类比：如果 Tool Calling 是"函数调用"，MCP 就是"USB 接口" — 统一标准，任何工具都能插上就用。

```
┌──────────────┐     MCP      ┌──────────────┐
│  LLM (客户端) │ ◄──────────► │  MCP Server  │
│              │   协议通信    │  (工具提供者)  │
└──────────────┘              └──────────────┘
                                    │
                              ┌─────┴─────┐
                              ▼           ▼
                           数据库      文件系统
                              │           │
                              ▼           ▼
                           API 服务    本地文件
```

MCP 的价值：
- **标准化** — 不用为每个工具写一套 Prompt + 解析逻辑
- **动态发现** — LLM 启动时能看到所有可用工具列表
- **安全隔离** — 工具运行在独立进程/沙箱中

### 10.5 Agent 进阶

| 维度 | 说明 |
|------|------|
| **多 Agent 协作** | 多个 Agent 分工合作（如研究员 + 分析师 + 写手） |
| **Agent 模式** | ReAct / Plan-and-Solve / Reflexion / ToT / Self-Consistency |
| **Long-term Memory** | 用向量库持久化 Agent 的经验和知识 |
| **Agentic Workflow** | 固定工作流（DAG），比纯 Agent 更可控 |
| **Coding Agent** | 专门写代码的 Agent（Code Interpreter、SWE-Agent） |
| **Research Agent** | 自主检索+阅读+总结+交叉验证 |

### 10.6 Agent 框架全景

| 框架 | 特点 | 适用场景 |
|------|------|---------|
| **LangChain / LangGraph** | 生态最成熟，状态图式编排 | 通用 Agent 开发 |
| **AutoGen** | 多 Agent 对话协作 | 多 Agent 团队 |
| **CrewAI** | 角色驱动的多 Agent | 流程化任务 |
| **MetaGPT** | 软件公司式多 Agent | 复杂软件工程 |
| **Dify** | 低代码 Agent 平台 | 快速搭建 |
| **LoopX** | 端到端 Agent 开发 | 生产级 Agent |

---

## 11. 模型家族

### 11.1 闭源 API 模型

| 厂商 | 系列 | 特点 |
|------|------|------|
| **OpenAI** | GPT-4o / GPT-4.1 / GPT-3.5 | 综合能力最强，工具生态完善 |
| **Anthropic** | Claude 3.5 Sonnet / Claude 3 Opus | 长上下文、安全对齐好、性价比高 |
| **Google** | Gemini 1.5 Pro / Gemini Ultra | 多模态、长上下文 |
| **Mistral** | Mistral Large / Codestral | 代码能力强、欧洲合规 |

### 11.2 开源模型

| 模型 | 特点 |
|------|------|
| **LLaMA 3 / 3.1** | Meta 出品，开源标杆 |
| **Qwen 2** | 阿里出品，中文友好 |
| **Mistral 7B / Mixtral** | 欧洲团队，效率高 |
| **Gemma** | Google 开源，轻量级 |
| **DeepSeek-V2** | 国产开源，长上下文 |
| **Phi-3** | Microsoft 出品，小模型高性能 |

### 11.3 本地运行生态

| 工具 | 说明 |
|------|------|
| **llama.cpp** | C++ 实现，跨平台，社区驱动 |
| **Ollama** | 用户友好的本地 LLM 运行器 |
| **LM Studio** | GUI 界面，支持多模型 |
| **vLLM** | 高性能推理引擎（服务端） |
| **SGLang** | 清华出品，快速推理框架 |
| **TensorRT-LLM** | NVIDIA 出品，GPU 优化推理 |

---

## 12. 推理与部署

### 12.1 推理加速

| 技术 | 说明 |
|------|------|
| **KV Cache** | 缓存已计算的 K/V，避免重复计算 |
| **PagedAttention** | 分页式注意力，GPU 显存利用率翻倍 |
| **Speculative Decoding** | 小模型先猜，大模型验证，加速生成 |
| **Quantization** | INT8/INT4 量化，减小显存占用 |
| **Flash Attention** | IO-aware 注意力实现 |

### 12.2 部署方案

| 方案 | 适用场景 |
|------|---------|
| **Serverless API** | 零运维，按量付费（OpenAI/Anthropic/Google） |
| **自托管 GPU** | 数据敏感、高并发、成本可控 |
| **边缘部署** | 手机/嵌入式设备（CoreML、ONNX、TensorRT） |
| **混合部署** | 敏感数据本地处理，通用查询走云端 |

---

## 13. 向量数据库全景

| 数据库 | 类型 | 特点 |
|--------|------|------|
| **Pinecone** | 全托管云服务 | 零运维，开箱即用 |
| **Weaviate** | 开源 + 云服务 | 混合搜索，GraphQL 支持 |
| **Qdrant** | 开源 Rust 实现 | 高性能，Docker 友好 |
| **Chroma** | 轻量嵌入式 | 原型开发首选 |
| **Milvus** | 开源分布式 | 大规模生产环境 |
| **pgvector** | PostgreSQL 扩展 | 与现有 DB 集成最简单 |
| **FAISS** | Meta 开源库 | 底层向量检索库，自研场景 |

---

## 14. 评估体系

### 14.1 通用能力基准

| 基准 | 测试内容 |
|------|---------|
| **MMLU** | 57 学科知识问答 |
| **HumanEval** | Python 代码生成 |
| **GSM8K** | 小学数学应用题 |
| **MATH** | 高中数学 |
| **GPQA** | 研究生级科学推理 |
| **MMMU** | 多模态理解 |

### 14.2 应用层评估

| 方法 | 说明 |
|------|------|
| **LLM-as-Judge** | 用 LLM 评估 LLM，灵活但有偏差 |
| **RAGAS** | RAG 专用评估框架 |
| **真实用户反馈** | 最可靠但最贵 |

---

## 15. 安全与护栏

| 维度 | 说明 |
|------|------|
| **输入安全** | 检测 Prompt Injection、越狱攻击 |
| **输出安全** | 检测有害内容、幻觉、数据泄露 |
| **数据安全** | 训练数据隐私、模型窃取攻击 |
| **对齐安全** | Constitutional AI、RLHF 安全版 |
| **产品护栏** | 速率限制、日志审计、人工审核 |

---

## 16. 数据工程

| 环节 | 说明 |
|------|------|
| **数据清洗** | 去重、去噪、格式化 |
| **合成数据** | 用强模型生成训练数据，解决数据饥渴 |
| **数据飞轮** | 模型能力提升 → 生成更好数据 → 模型更强 |
| **偏好数据** | 人类对比数据（RLHF/DPO 的核心） |
| **领域数据** | 垂直行业的高质量数据 |

---

## 17. 一张总览图

把上面所有概念放到一个包含关系里：

```
AI（人工智能）
 └── ML（机器学习） ──► 监督 / 无监督 / 强化
      └── DL（深度学习）──► CNN / RNN / Transformer / Diffusion / Mamba
           └── LLM（大语言模型）
                ├── Tokenization（BPE / SentencePiece）
                ├── Context Window（8K → 1M+）
                ├── MoE（专家混合）
                ├── VLM（多模态 LLM）
                ├── 基座模型  ─►  SFT ─► RLHF/DPO/Constitutional AI ─► 对话模型
                ├── Prompt Engineering  ─► CoT / ToT / Self-Consistency / Structured Output
                ├── RAG  ──► Embedding + 向量库 + 检索 + 生成
                │   └── 进阶：Graph RAG / Self-RAG / Agentic RAG / Hybrid Search / HyDE
                ├── Fine-tuning  ──► Full / LoRA / QLoRA / DoRA / LongLoRA
                ├── Tool Calling / Function Calling
                ├── MCP（Model Context Protocol）
                └── Agent  ──► Planner + Tools + Memory + Reflection
                    ├── 进阶：多 Agent / 长记忆 / 工作流
                    └── 框架：LangChain / LangGraph / AutoGen / CrewAI / MetaGPT

  支撑层：
  ├── 模型家族（闭源 API + 开源 + 本地）
  ├── 推理加速（KV Cache / PagedAttention / 量化 / Flash Attention）
  ├── 向量数据库（Pinecone / Weaviate / Qdrant / Chroma / pgvector / Milvus）
  ├── 评估体系（MMLU / HumanEval / RAGAS / LLM-as-Judge）
  ├── 安全护栏（输入/输出/数据/对齐）
  └── 数据工程（清洗 / 合成 / 飞轮 / 偏好数据）
```

---

## 18. 选型速查：我该用哪条路？

| 场景 | 建议方案 |
|------|---------|
| 想让模型"看一下"PDF 再回答 | RAG |
| 想让模型输出固定 JSON，且格式很脆 | Prompt → Few-shot → 不行再 LoRA 微调 |
| 想让模型像某品牌的"代言人"说话风格 | SFT / LoRA 微调 |
| 想让模型自动联网查资料、调 API、跑代码 | Agent + Tool Calling + MCP |
| 想让模型持续多步执行复杂目标 | Agent 框架（LangGraph、LoopX 等） |
| 只是想让回答更好、更稳定 | Prompt Engineering + Structured Output |
| 想让多个 AI 协作完成复杂任务 | 多 Agent 框架（AutoGen、CrewAI、MetaGPT） |
| 想在本地跑模型 | Ollama / LM Studio / llama.cpp |
| 想高性能部署开源模型 | vLLM / SGLang / TensorRT-LLM |
| 想快速搭建 AI 应用 | Dify / 低代码平台 |
| 想让模型看图片 | VLM（GPT-4o、Claude Vision、Gemini） |
| 想做混合检索（关键词+语义） | Hybrid Search（RAG 进阶） |

---

## 19. 常见误区速览

- ❌ **"微调能解决一切"** — 微调管风格，知识靠 RAG。别把 RAG 的活让微调干。
- ❌ **"Embedding 就是向量化，随便一个模型都行"** — 文本检索、跨语种、长上下文等场景对 Embedding 模型选型很敏感。
- ❌ **"Agent 比单纯 RAG 好"** — 简单问答用纯 RAG 更快更稳。Agent 有循环开销，容易"绕"。
- ❌ **"Scaling Law 还能一直涨"** — 纯靠堆参数/算力的收益边际递减，现在更多转向数据质量、工具集成、Agent 协同。
- ❌ **"上下文窗口越大越好"** — 长窗口成本高、速度慢，关键信息不一定能被模型"注意到"。
- ❌ **"MCP = 新框架"** — MCP 是协议不是框架，它定义了 LLM 与工具通信的标准，类似 HTTP。
- ❌ **"MoE 模型更大更强"** — MoE 稀疏激活，实际计算量不比稠密模型大，训练和推理更复杂。
- ❌ **"VLM 就是 LLM + 图片输入"** — 多模态需要跨模态对齐训练，不是简单拼接。

---

## 结语

**AI → ML → DL → LLM → Prompt/RAG/Fine-tuning → Agent → MCP** 是理解这个领域的"主干道"。掌握这条主干，再看任何新术语（MoE、VLM、Graph RAG、Agentic Workflow……）都能快速把它放到合适的位置。

**下一步去哪里？**

- 想深入 **LLM 内部**：看博客"生成式 AI"系列的 Transformer 章节
- 想动手做 **RAG**：看 AI 工程化专栏的 RAG 入门
- 想做 **Agent**：claude.haylee.site 的 20 章 Agent 课程，从最简单的 loop 到团队协作
- 想了解 **MCP**：Model Context Protocol 官方文档和实战案例
- 想部署 **开源模型**：vLLM 官方文档和 Ollama 入门
