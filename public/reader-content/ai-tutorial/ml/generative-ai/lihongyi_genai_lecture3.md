---
title: '🧠 深入解剖大型语言模型：从输入到输出的完整旅程'
description: '拆解 LLM 从 Prompt 到概率分布的完整链路：Tokenization、Embedding、Transformer、Logit Lens 与 Representation Engineering。'
date: "2025-09-26"
tags: [LLM, Transformer, Representation Engineering, 李宏毅, 深度学习]
course: generative-ai
lecture: 4
---

> **课程来源：** 台大李宏毅《生成式人工智慧与机器学习导论》2025 Fall 第3讲  
> **影片链接：** [YouTube](https://youtu.be/8iFvM7WUUs8)  
> **投影片：** [LLMunderstand.pdf](https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall-course-data/LLMunderstand.pdf)

---

## 一、前言：从解剖学的角度看 LLM

今天我们不聊训练，只谈**解剖**。

假设模型已经训练好了，参数就在那里。给它一个未完成的句子，它是怎么吐出下一个 Token 的概率分布的？中间到底发生了什么？

这篇笔记把整个过程拆开，从高到低一层层看清楚。

---

## 二、整体流程：从 Prompt 到概率分布

语言模型本质上就是一个函数 $F$：

- 输入：未完成的句子 $X$
- 输出：$F(X)$，一个关于下一个 Token 的概率分布

完整链路大致是这样：

1. **Tokenization**：句子切成 Token，每个 Token 对应一个 ID。
2. **Embedding Table**：查表，把每个 ID 变成一个向量（Token Embedding）。
3. **多层 Transformer Layer**：一排向量进，一排同样长度的向量出。每一层都会看上下文，把 Token Embedding 变成 Contextualized Embedding（也叫 Hidden / Latent Representation）。
4. **取最后一层最后一个位置的向量**。
5. **LM Head（Unembedding）**：这个向量乘上一个矩阵，得到 Vocabulary Size 维的向量（Logit）。
6. **Softmax**：把 Logit 变成概率分布。

很多模型（Llama、Gemma）的 LM Head 直接复用 Embedding Table。也就是说，最终输出的向量其实是在跟所有 Token Embedding 算点积（相似度）。哪个 Token 的 Embedding 跟最终 Representation 越接近，分数就越高。

Softmax 本身并不是模型的一部分。Hugging Face 的模型通常只返回 Logit，Softmax 是你自己决定要不要做。常见的 Temperature 也是在 Softmax 前把 Logit 除以一个温度参数：温度越高，分布越平坦（创意模式）；温度越低，分布越尖锐（保守模式）。

---

## 三、Representation 到底在说什么？

### 3.1 Token Embedding 阶段

同样的 Token 一定有一模一样的 Embedding。意思相近的 Token，它们的 Embedding 也会比较接近。

实战里拿 Llama 的 Embedding 测「apple」：

- 最接近的是带空格的 apple、Apple、APPLE
- 也能看到「苹果」、Cupertino、MacBook、iPhone

模型确实把「苹果公司」和「水果」的语义都塞进了同一个 Token 的不同方向。

### 3.2 过了第一层之后

同样是「apple」，上下文不同，Contextualized Embedding 就开始分道扬镳。

实验很直观：

- 「I ate an apple for breakfast」vs「the company that makes iPad is apple」
- 第 0 层（纯 Embedding）相似度 = 1
- 从第 1 层开始相似度持续下降，模型逐渐意识到这两个 apple 根本不是一回事

如果两个 apple 都是水果（或都是公司），即使上下文不同，相似度也会一直维持在较高水平。模型真的能区分「同一个词在不同语境下的意思」。

### 3.3 更高阶的分析手段

- **方向有含义**：某些方向可能对应中英翻译、性别、数量等。经典的 Man − Woman ≈ King − Queen 在现代模型上并不总是成立，不同模型和不同层差异很大。
- **投影到低维**：早期 BERT 的中间层能投出句法树；近期有人把地名 Representation 投到二维平面，居然能大致还原世界地图。
- **Representation / Activation Engineering**：直接改 Representation。收集「会拒绝」和「不会拒绝」的请求，在某一层取平均再相减，就能得到「拒绝向量」。把这个向量加到正常请求上，模型突然开始拒绝；减掉它，本来会拒绝的请求也开始回答了。Anthropic 在 Claude 上甚至找到了「拍马屁向量」。
- **Logit Lens**：把每一层的 Representation 都过一遍 LM Head，看模型在「心里」当前最想输出什么 Token。做翻译时经常能看到中间层先变成英文再变成中文的现象。
- **Patch Scope**：把某个位置的 Representation 直接「贴」到另一个 Prompt（比如「请简单介绍 X」）对应位置，让模型用完整句子描述这个 Representation 的含义。可以一层层观察模型对输入的理解是如何逐步完善的。

---

## 四、一个 Layer 里面到底发生了什么？

以 Transformer 为例，一个 Layer 主要包含：

### 4.1 Self-Attention（核心）

为什么能考虑上下文？全靠它。

基本流程（以某个位置的「果」为例）：

1. 用 $W_Q$ 生成 Query，用 $W_K$ 生成 Key，算点积得到 Attention Weight。
2. Softmax 后，用这些权重对 Value（由 $W_V$ 生成）做加权求和。
3. 加上 Residual Connection（把原始 Embedding 再加回来）。

实际是 **Multi-Head**。不同 Head 关注不同面向：有的找颜色，有的找数量，有的找其他属性。最后用 $W_O$ 把多个 Head 的结果揉合起来。

语言模型通常用 **Causal Attention**（只看左边），方便自回归生成。位置信息靠 Positional Embedding（或更现代的 RoPE）注入。

Attention 的计算量随序列长度平方增长，这是长文本处理的核心瓶颈之一（Mamba 等架构就是为了缓解这个问题）。

### 4.2 Feed-Forward Network

通常两层：升维 → Activation（ReLU / GeLU 等）→ 降维。有论文把它解释成另一组 Key-Value Memory，非常有意思。

### 4.3 神经元在哪里？

其实就是矩阵乘法的一行。

$$y_1 = \text{Activation}(x_1 w_{11} + x_2 w_{12} + x_3 w_{13} + b_1)$$

画成圈圈就叫「神经元」，听起来很潮，本质就是线性变换 + 非线性。

---

## 五、实战解剖：Llama 3B 与 Gemma 4B

用 Hugging Face 把两个模型拆开看参数：

- **Llama 3B**：约 32 亿参数，28 层，Embedding 128256 × 3072，每层 24 个 Attention Head。
- **Gemma 4B**：约 43 亿参数，34 层，Embedding 262144 × 2560，每层 8 个 Attention Head（还有 Vision Tower）。

打印 `named_parameters()` 可以看到完整结构：`embed_tokens`、每层的 `q_proj / k_proj / v_proj / o_proj`、MLP 的 `up_proj / down_proj`、LayerNorm 等。

把 Attention Weight 可视化后，会发现：

- 很多 Head 喜欢盯着句首的特殊 Token（相当于「我没什么好看的」默认选项）。
- 有些 Head 会把「apple」和前面的「green」关联起来。
- 上三角几乎全是 0（Causal 的必然结果）。

Logit Lens 跑「天气」：

- 前几层反复输出「气」
- 中间突然变成 weather → forecast
- 最后再转回中文「预」

模型内心深处其实更爱用英文思考。

---

## 六、写在最后

今天讲的只是沧海一粟。Representation Engineering、Logit Lens、Patch Scope、Attention 的各种变体……每一个方向都可以挖很深。

如果你对「AI 的脑科学」更感兴趣，可以再去看李宏毅老师上学期机器学习课程的相关讲次。

模型再黑盒，拆开看总是有收获的。下次再面对「为什么它突然拒绝我」或「它到底在想什么」时，至少多了一点可解释的抓手。

---
