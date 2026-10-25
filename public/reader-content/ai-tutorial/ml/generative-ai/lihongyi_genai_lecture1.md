---
title: '🔥 一堂课搞懂生成式AI原理：从"文字接龙"到亲手跑通 Llama 3.2'
description: '从文字接龙原理到 Colab 跑通 Llama 3.2，一堂课搞懂生成式 AI 底层逻辑。'
date: "2025-09-12"
tags: [生成式AI, 大模型, LLM, 李宏毅, 机器学习]
course: generative-ai
lecture: 2
---

> **课程来源：** 台大李宏毅《生成式人工智慧与机器学习导论》2025 Fall 第1讲  
> **影片链接：** [YouTube](https://youtu.be/TigfpYPJk1s)  
> **投影片：** [LLM.pdf](https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall-course-data/LLM.pdf)

---

## 一、前言

如果你用过 ChatGPT、Gemini 或 Claude，你是否好奇过：**这些 AI 到底是怎么"想"的？**

很多人误以为大模型背后有一个巨大的数据库，你问问题，它去查资料再回答你。但如果你真正理解它的运作原理，你会发现——

> **大模型根本没有数据库。它这辈子唯一会做的事，就是"文字接龙"。**

今天这篇文章，基于李宏毅老师 2025 秋季《生成式人工智慧与机器学习导论》第1讲的完整内容，带你从原理到代码，彻底搞懂生成式 AI 的底层逻辑。上半部分讲原理，下半部分带你用 **Colab + Hugging Face** 亲手跑通 **Llama 3.2 3B** 开源模型。

---

## 二、语言模型的本质：不是数据库，是"文字接龙"

### 2.1 一言以蔽之：Language Model = 文字接龙

ChatGPT、Gemini、Claude 这些平台，最基本的功能就是：**输入一段文字，输出一段文字**。

但语言模型真正会做的事情只有一件——**文字接龙（Autoregressive Generation）**。

你给它一个未完成的句子，它去猜后面可以接哪个字：

- 你输入："人工智" → 它接："慧"
- 你输入："大型语言模" → 它接："型"
- 你输入："欢迎今天来上" → 它接："课"

> 💡 **Prompt** = 你输入的未完成句子  
> 💡 **Token** = 模型用来做接龙的基本单位（不只是"字"，后面会讲）

### 2.2 模型怎么回答你的问题？

当你问："台湾最高的山是哪座？"

模型实际在做的是：

1. 把问题当作**未完成的句子**
2. 预测下一个 Token 的概率分布
3. 根据概率"掷骰子"选出一个 Token（比如"玉"）
4. 把"玉"拼回句子，继续预测下一个（比如"山"）
5. 直到掷出"结束符号"，接龙停止

所以最终答案 "玉山"，其实是**两个字分别接龙接出来的**。

### 2.3 为什么每次答案都不一样？

因为模型在生成每个 Token 时，真正的输出是一个**概率分布**，然后根据这个分布**掷骰子**决定接哪个字。

```
Prompt: "人工"
模型输出概率分布：
- "智" → 50%
- "呼" → 20%  
- "how" → 0.01%
- "鼠" → 0.0001%

然后掷骰子，"智"的概率最高，但"呼"也有机会被选中。
```

> 🎲 **这就是随机性的来源。** 你问同一个问题，每次答案略有不同，正是因为每次掷骰子的结果不同。

但你也别担心它会接出荒谬答案。比如"台湾最高的山是哪座？"后面接"冰"的概率极低，几乎不可能掷到。所以模型最可能回答"玉山"，而不是"冰淇淋"。

---

## 三、核心概念拆解

### 3.1 Token & Vocabulary

**Vocabulary（词表）** = 模型所有可以用来接龙的 Token 的集合。

一个正常的语言模型，Vocabulary 大小往往在**数十万个 Token**。里面包罗万象：
- 英文字母、中文汉字
- 韩文、日文、阿拉伯文
- 各种符号（`@`、`#`、`❤️`）
- 甚至**128个空格连在一起**也算一个 Token！

> 李老师现场展示了 Llama 3.2 的 Vocabulary：128,000 个 Token。里面什么怪东西都有——两个斜线加一堆直线是一个 Token，一个爱心是一个 Token，"互联网"三个字也是一个 Token。

**同一个英文单词，前面有没有空格，可能是不同的 Token。**

```python
# "GOOD" 在句首 → Token ID: 19045
# " GOOD" 前面有空格 → Token ID: 1695
# 对模型来说，这是两个完全不同的 Token！
```

### 3.2 概率分布与"掷骰子"

模型本质上是一个**函数** `f(x)`：
- 输入 `x` = Prompt（未完成的句子）
- 输出 `f(x)` = 下一个 Token 的概率分布

这个函数内部有**数十亿甚至上百亿个参数**（Parameters）。今天的模型，十亿参数只能算"小型"，百亿参数"遍地走"。

这些参数不是人工设定的，而是**通过海量数据自动学习**得到的。

### 3.3 文字接龙需要两种知识

要正确做文字接龙，模型必须掌握：

1. **语言知识**：知道什么词后面可以接什么词。比如"黄色的"后面接名词概率高，接动词概率低。
2. **世界知识**：知道真实世界的常识。比如"水的沸点是摄氏"后面应该接"100"。

> 语言知识相对容易学，收集上百万篇文章就能学会。但**世界知识几乎无穷无尽**——你知道水的沸点是100度，但如果在0.5大气压下呢？模型必须知道气压变低沸点也会变低，才能正确接龙。

---

## 四、从接龙到对话：Chat Template 的秘密

### 4.1 为什么模型会"回答问题"？

如果你只是单纯做接龙，"台湾最高的山是哪座？"后面完全可以接：
- "谁来告诉我呀"（延续问题）
- "A. 雪山 B. 阿里山 C. 玉山"（出考题）

**凭什么它一定会接出答案？**

秘密在于：**平台偷偷帮你加了料。**

你以为你输入的是：
```
台湾最高的山是哪座？
```

实际上模型看到的是：
```
用户问：台湾最高的山是哪座？
AI回答：
```

因为最后定格在"AI回答："，模型只能继续接出答案。

这种为了引导模型回答而额外添加的格式，叫做 **Chat Template**。

### 4.2 多轮对话是怎么实现的？

模型没有"记忆"。你按了"新聊天"，它就忘了之前的一切。

多轮对话的秘密是——**把历史记录全部拼在一起**：

```
用户问：台湾最高的山是哪座？
AI答：玉山
用户问：第二高的呢？
AI答：
```

模型看到完整的上下文，就知道"第二高的"指的是"第二高的山"，于是接出"雪山"。

> 💡 **Context Engineering** = 确保输入给模型的信息足够完整，让它有机会接出正确答案。这是使用 AI 时人类最重要的责任。

### 4.3 System Prompt：开发者偷偷塞给你的设定

除了 Chat Template，平台通常还会在前面加上 **System Prompt**（系统提示）。

比如 Llama 3.2 的官方 System Prompt 里默认写了：
```
我的知识截止到2023年12月。今天是2025年9月12日。
```

这就是为什么模型能回答"今天几号"——不是因为它看了日历，而是**每次对话前，开发者已经偷偷把日期塞进去了**。

System Prompt 还可以给模型"立人设"：
```
你的名字是Llama。请用中文回答，开头都要说"哈哈哈"。
```

然后你问它"你是谁"，它就会说："哈哈哈，我是Llama..."

---

## 五、AI 幻觉（Hallucination）：一切答案都在"幻觉"中产生

当你让 ChatGPT 介绍一个组织并提供官网时，它可能给你一个看起来像模像样的网址：`AI-college.org`，但点进去根本不存在。

这种现象叫 **AI 幻觉（Hallucination）**。

**为什么会这样？**

因为模型**没有数据库，没有搜索引擎**，它唯一会做的就是文字接龙。每一个字都是它"猜"出来的。

> 🧠 **李老师金句：** "如果你知道语言模型就是在做文字接龙，你一点都不会意外为什么 AI 会幻觉。因为其实一切的答案都是在幻觉中产生的。你该意外的是，它的梦境、它的幻觉中，居然有一些跟现实是相符的。"

模型就像一个**关在暗无天日的小房间里的人**，从来没看过外面的世界。你给它一个 Prompt，它就开始猜后面接什么字才"合情合理"。

**减少幻觉的方法？**

第二讲会讲 **RAG（检索增强生成）**——把搜索引擎搭配 AI 一起使用。这也是本课程 HW2 的主题。

---

## 六、生成式AI的广义定义：万事万物皆Token

### 6.1 什么是生成式AI？

> **生成式AI = 让机器学会产生复杂而有结构的物件。**

"有结构"的意思是：这些物件由**有限种类的基本单位（Token）**构成，但组合起来有无穷可能。

| 物件 | Token | 例子 |
|:---|:---|:---|
| 文字 | 字/词 | 中文常用字约4000个，可组成无数文章 |
| 图片 | 像素（或压缩后的图像Token） | 16×16的图像块代表"草地"、"眼睛" |
| 声音 | 取样点（或声音Token） | 每个Token代表0.02秒的声音 |
| 蛋白质 | 氨基酸 | 20种氨基酸组合成各种蛋白质药物 |

### 6.2 图片和声音也是接龙

**图片**：可以用"像素接龙"的方式生成。2016年李老师就示范过用像素接龙生成宝可梦图片。但1024×1024的图片有100万个像素，接龙100万次比写一部《红楼梦》还困难。

**声音**：Google DeepMind 的 WaveNet（近10年前）就是用"取样点接龙"生成声音，效果极其真实，据说有研究员听到后落泪。

**解决方案**：先把图片/声音**压缩**成更少的 Token，再做接龙。

> 🎯 **黄仁勋在2024年COMPUTEX演讲中说："万事万物都是Token。"** 不是指"代币"，而是指：把任何东西表示成Token，做Token的接龙，就能生成万事万物。

---

## 七、动手实验：Colab + Hugging Face 跑通 Llama 3.2

> 以下代码均可在 [Google Colab](https://colab.research.google.com) 免费运行。建议使用 GPU（T4 即可，A100 更快）。

### 7.1 环境准备

```python
# 安装 Hugging Face Transformers 套件
!pip install transformers

# 导入必要库
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# 连接 Hugging Face（需要申请 Token）
from huggingface_hub import login
login(token="your_hf_token_here")

# 下载模型和 Tokenizer
model_id = "meta-llama/Llama-3.2-3B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto"
)
```

> 💡 **Llama-3.2-3B-Instruct** 中：
> - `3.2` = 版本号
> - `3B` = 30亿参数（非常小，适合教学）
> - `Instruct` = 经过指令微调，能理解和执行指令

### 7.2 探索 Tokenizer 的奥秘

```python
# Vocabulary 大小：128,000 个 Token
print(tokenizer.vocab_size)  # 输出: 128000

# 把编号转成文字（Decode）
print(tokenizer.decode(0))      # "!"
print(tokenizer.decode(1))      # '"'
print(tokenizer.decode(10000))  # ".grid"

# 把文字转成编号（Encode）
print(tokenizer.encode("大家好"))  # [128000, 109429, 53901]
# 注意：128000 是 "句子开头" 的特殊符号

# 去掉特殊符号
print(tokenizer.encode("大家好", add_special_tokens=False))  # [109429, 53901]
```

**有趣的发现：**
- 同一个英文单词，大小写不同 = 不同 Token
- 前面有没有空格 = 不同 Token
- Vocabulary 里什么怪东西都有：128个空格、爱心符号、各种语言的字符

### 7.3 观察模型的"内心"：概率分布

```python
prompt = "1+1="
inputs = tokenizer.encode(prompt, return_tensors="pt").to(model.device)

# 模型输出
with torch.no_grad():
    outputs = model(inputs)
    logits = outputs.logits[0, -1, :]  # 取最后一个位置的输出
    probs = torch.softmax(logits, dim=-1)

# 打印概率最高的前10个 Token
top_k = torch.topk(probs, k=10)
for i, (prob, idx) in enumerate(zip(top_k.values, top_k.indices)):
    token = tokenizer.decode([idx])
    print(f"Top {i+1}: '{token}' -> {prob.item()*100:.2f}%")
```

**输出结果：**
```
Top 1: '2' -> 65.70%
Top 2: '3' -> 12.00%
Top 3: '1' -> 5.30%
...
```

**换 Prompt 测试：**
```python
prompt = "在二进位中1+1="
# 输出：'10' -> 70.12%，'2' -> 0.13%
```

模型真的知道二进位规则！它会根据输入产生不同的概率分布。

### 7.4 手动实现文字接龙

```python
prompt = "台湾大学李宏毅"
input_ids = tokenizer.encode(prompt, return_tensors="pt").to(model.device)

# 连续生成 16 个 Token
for _ in range(16):
    with torch.no_grad():
        outputs = model(input_ids)
        logits = outputs.logits[0, -1, :]
        probs = torch.softmax(logits, dim=-1)

        # 选概率最高的 Token（Greedy）
        next_token_id = torch.argmax(probs).unsqueeze(0)
        next_token = tokenizer.decode(next_token_id)

        print(next_token, end="")

        # 拼回输入，继续接龙
        input_ids = torch.cat([input_ids, next_token_id.unsqueeze(0)], dim=-1)
```

**输出：**
```
教授，台湾大学李宏毅的研究领域主要在人工智能、自然语言处理...
```

模型真的知道李老师是谁！

### 7.5 Top-K 采样：让模型说人话

如果完全按概率掷骰子，很容易掷到怪异的 Token，然后整句话开始乱飘：

```
你是誰 → 你是誰...（日文）...XD...Funk...（乱码）
```

**解决方案：Top-K 采样**

只让概率最高的前 K 个 Token 参与掷骰子，其他的直接淘汰：

```python
# 设置 Top-K=3，只有前3名可以参与掷骰子
top_k_probs, top_k_indices = torch.topk(probs, k=3)
top_k_probs = top_k_probs / top_k_probs.sum()  # 重新归一化

# 从 Top-K 中按概率采样
next_token_idx = torch.multinomial(top_k_probs, num_samples=1)
next_token_id = top_k_indices[next_token_idx]
```

> 💡 **K 值的选择：**
> - K=1：每次都选概率最高的，回答固定但缺乏多样性
> - K 很大：接近完全随机，容易出怪话
> - K=3~10：平衡多样性和合理性

### 7.6 官方 Chat Template 的力量

自己随便加"用户说：... AI回答："效果不够好。每个模型都有**官方 Chat Template**。

```python
messages = [
    {"role": "system", "content": "你的名字是Llama。请用中文回答。"},
    {"role": "user", "content": "你是谁？"}
]

# 自动应用官方 Chat Template + Encode
input_ids = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    return_tensors="pt",
    add_generation_prompt=True
).to(model.device)

# 生成
output_ids = model.generate(
    input_ids,
    max_new_tokens=50,
    do_sample=True,
    top_k=3,
    temperature=0.7
)

# 解码（注意：输出包含输入，需要截取）
response = tokenizer.decode(output_ids[0][input_ids.shape[-1]:], skip_special_tokens=True)
print(response)
```

**输出：**
```
我是Llama，一个开放式大脑，能够处理和生成人类语言...
```

> 如果不加 System Prompt 说"你的名字是Llama"，模型可能会说"我是GPT-3.5"——因为它在网上读到过太多"你是誰→我是GPT"的文本，根本不知道自己的名字！

### 7.7 多轮对话实现

```python
# 维护对话历史
messages = [
    {"role": "system", "content": "你的名字是Llama。请用中文回答。"},
    {"role": "user", "content": "你是谁？"},
    {"role": "assistant", "content": "我是Llama，一个AI助手。"},
    {"role": "user", "content": "那我刚才问你什么？"}
]

input_ids = tokenizer.apply_chat_template(messages, ...)
output_ids = model.generate(input_ids, ...)
# 模型会回答："你刚才问我是谁。"
```

**关键：每一轮都要把完整历史记录传给模型。** 模型本身没有记忆，记忆是你在外部维护的。

### 7.8 Pipeline：一行代码搞定

如果你觉得上面的步骤太繁琐，Hugging Face 提供了 **Pipeline** 一键封装：

```python
from transformers import pipeline

pipe = pipeline(
    "text-generation",
    model="meta-llama/Llama-3.2-3B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto"
)

messages = [
    {"role": "user", "content": "你是谁？"}
]
response = pipe(messages, max_new_tokens=50, do_sample=True, top_k=3)
print(response[0]["generated_text"][-1]["content"])
```

Pipeline 自动帮你处理：Encode → Generate → Decode → 截取输出。一行代码，聊天机器人搞定。

**换模型也只需改一行：**
```python
# 从 Llama 换成 Google Gemma
pipe = pipeline("text-generation", model="google/gemma-3-4b-it", ...)
```

> 作业 HW1 就是要求大家用 Gemma 模型完成类似的实验。

---

## 八、总结与课后思考

### 8.1 核心知识点回顾

| 概念 | 一句话解释 |
|:---|:---|
| **Token** | 模型做接龙的基本单位，可能是字、词、符号或图像块 |
| **Vocabulary** | 模型能选择的所有 Token 的集合（通常10万+） |
| **Prompt** | 输入给模型的未完成句子 |
| **概率分布** | 模型对每个 Token 的"打分"，决定接哪个字 |
| **Chat Template** | 引导模型从"接龙"变成"回答问题"的格式模板 |
| **System Prompt** | 开发者预设的隐藏指令，给模型设定身份和规则 |
| **AI 幻觉** | 模型没有数据库，所有答案都是接龙"猜"出来的，可能编造 |
| **Context Engineering** | 人类确保输入信息足够完整，让模型有机会接对 |

### 8.2 三个值得深思的问题

1. **如果模型只是在"掷骰子"，它的"智能"到底来自参数、数据，还是概率的魔法？**

2. **System Prompt 可以强制模型"说出"它本不想说的话。这带来了什么安全风险？**

3. **当图片、声音、甚至蛋白质都被 Token 化后，"生成式AI"的边界在哪里？**

### 8.3 给初学者的建议

- **不要只调包，要理解原理。** 知道 Tokenizer 的 encode/decode，你就比 80% 的调用者更懂模型。
- **动手跑一遍代码。** 亲眼看到概率分布、看到 Top-K 采样的效果，比看十篇文章都管用。
- **警惕幻觉。** 永远记住：模型没有数据库，它只是在玩一场极其复杂的文字接龙游戏。

---

## 九、参考资料

| 资源 | 链接 |
|:---|:---|
| **课程主页** | [https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall.php](https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall.php) |
| **YouTube 播放列表** | [PLJV_el3uVTsMMGi5kbnKP5DrDHZpTX0jT](https://www.youtube.com/playlist?list=PLJV_el3uVTsMMGi5kbnKP5DrDHZpTX0jT) |
| **Hugging Face Transformers 文档** | [https://huggingface.co/docs/transformers](https://huggingface.co/docs/transformers) |
| **Llama 3.2 模型页** | [https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct) |
| **Datawhale 教程整理** | [https://github.com/datawhalechina/leegenai-tutorial](https://github.com/datawhalechina/leegenai-tutorial) |

---

> **"这门课不是教你用 ChatGPT，而是教你造自己的 ChatGPT。"** —— 李宏毅

---
*本文基于李宏毅老师 2025 Fall《生成式人工智慧与机器学习导论》第1讲逐字稿整理，仅供学习交流。*
