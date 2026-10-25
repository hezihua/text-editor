---
title: '🧠 AI Agent（1/3）：Context Engineering 基本概念'
description: '系统讲解 AI Agent 背后的 Context Engineering：压缩、记忆卸载、Context Collapse、Sub-Agent、按需加载，以及把管理交给模型自己的 Agentic CE。'
date: "2026-03-13"
tags: [AI Agent, Context Engineering, Sub-Agent, Agentic CE, 李宏毅]
course: generative-ai
lecture: 10
---

> **課程來源：** 台大李宏毅《機器學習》2026 Spring 第2講  
> **影片連結：** [YouTube](https://www.youtube.com/watch?v=urwDLyNa9FU)（約 53 分鐘）  
> **投影片：** [agent_era.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/agent_era.pdf)

---

## 一、這堂課在講什麼？

今天繼續講 AI Agent，偏科普、偏系統。整季 AI Agent 分成三段：

1. **Context Engineering**（本講）—— Agent 背後的核心技術
2. AI Agent 之間的互動
3. AI Agent 對未來工作的衝擊

背景可先看：語言模型基本原理、[解剖小龍蝦（OpenClaw）](/ml/courses/generative-ai/lihongyi_genai_lecture7)。

> **一句話**：Context Engineering = 幫語言模型產生「長度剛好」的輸入——不能太長，也不能太短。

---

## 二、為什麼需要 Context Engineering？

核心限制：語言模型的**輸入長度有限**（Context Window）。

典型 Agent 流程會不斷累積：

```
人類指令 → 工具1 → 工具1輸出 → 工具2 → 工具2輸出 → …
```

- 全部歷史都塞進模型 → 很快爆窗
- 砍太短 → 模型「不知道剛才發生什麼」，接龍失敗

因此 AI Agent 像語言模型與環境之間的**守門人 / 經紀人**：負責篩選、壓縮、管理要給模型看的內容。

---

## 三、形式化：Context Engineering 就是設計 \( F \)

![Context Engineering 公式](/generative-ai/context-engineering-formula.png)

每一輪不是把輸入+輸出直接拼接，而是經過更新函數 \( F \)：

\[
C_{t+1} = F(C_t,\ \text{output}_t)
\]

更完整地看，Context 可拆成 \( C = \{P, M\} \)：

| 符號 | 意義 |
|------|------|
| \( P \) | **會丟進 LLM** 的部分（真正佔用 context window） |
| \( M \) | **外部儲存**（硬碟、資料庫、檔案），需要時再讀回 |

**Context Engineering 的核心，就是設計這個 \( F \)。**

---

## 四、最核心的功能：壓縮（Compression）

兩種常見做法：

1. **用語言模型做摘要（LLM summary）**
2. **硬清（Hard Clear）**：把工具輸出直接替換成「這裡曾經有個 Tool output」

實驗證據（SWE-bench 相關論文）：適當壓縮後，軌跡可以更長、表現更好。

---

## 五、記憶管理：卸載與重拾

類比《Rick and Morty》的 *Morty’s Mind Blowers*：

- 把不需要馬上用的資訊**卸載到硬碟 / 檔案系統**
- 需要時再 **Read** 回來

關鍵問題只有兩個：

- when / how to **save**
- when / how to **load**

相關系統：A-MEM、Mem0、Memory OS 等。

---

## 六、摘要的陷阱：Context Collapse

簡單做 summary 容易發生 **Context Collapse**：

- credential、token 狀態、認證要求、guardrail 等細節被摘要掉
- 後續任務因此失敗

改進方向：

- **ACON**（Agent Context Optimization）
- **SUPO**（Summarization-augmented Policy Optimization）
- 用 feedback 訓練更好的摘要策略

另外：語言模型本身**並不喜歡主動壓縮**，往往需要額外訓練 / 微調，才會在合適時機呼叫壓縮工具。

---

## 七、Sub-Agent：一種自動壓縮

Sub-Agent 可以看成**自主壓縮機制**：

1. 主 Agent 把子任務 **spawn** 給 Sub-Agent
2. Sub-Agent 內部可用工具、產生很長軌跡
3. 最後只把 **Return: …** 摘要結果回傳
4. 主 context 裡冗長過程被「自動刪掉」，只留短結果

好處：

- 主 context 不膨脹
- 可並行
- 可用 RL 訓練模型學會「何時該 spawn、不要越界」

---

## 八、過濾與按需載入

從源頭減少 context 長度：

1. **內容過濾**  
   例如 `Read(log, "bug fixing")` → 只取與 bug 相關的部分，而不是整份 log。

2. **工具按需載入（MCP-Zero 等）**  
   不要一開始就把所有工具定義塞進 system prompt（有些工具描述就超過 4600 tokens）。  
   讓模型先說「我需要什麼工具」，再動態載入。

3. **OpenClaw 的 SKILL / Memory**  
   - Skill：需要某個 skill 時才讀對應的 `SKILL.md`  
   - Memory：用 `memory_search` + `memory_get`，而不是整份 `MEMORY.md` 塞進 context

---

## 九、Agentic Context Engineering：把管理交給模型自己

最新方向：**讓模型自己管理自己的 context**。

代表工作：

- **Agentic Context Engineering**（ACE）
- **Dynamic Cheatsheet**
- **Recursive Language Models**

核心精神：

- 把「未來可能用得上的東西」存下來（有效策略、可重用 code、關鍵發現）
- 用 Generator → Reflector → Curator 循環更新一份 **Playbook**
- 大部分 context 其實在「硬碟」；模型只看 metadata，需要時再寫程式去檢索

最終願景：Context Engineering 本身也交給 LLM 來做。

---

## 十、概念對照表

| 概念 | 一句話說明 |
|------|------------|
| Context Engineering | 動態管理、篩選、壓縮要給 LLM 看的內容，使長度合適 |
| Prompt Engineering | 更偏向「怎麼寫一句話」；CE 是「管理整個輸入作業系統」 |
| 壓縮 | 摘要 / Hard Clear / 卸載到外部儲存 |
| Context Collapse | 摘要把關鍵細節弄丟 |
| Sub-Agent | 子任務外包，只拿回短結果 → 自動壓縮 |
| 按需載入 | 工具 / Skill / Memory 需要時才讀進 context |
| Agentic CE | 讓模型自己維護與優化自己的 context / playbook |

---

## 十一、總結

1. Agent 的核心工作之一，是當好 context 的守門人。
2. 壓縮很重要，但亂摘要會 Context Collapse。
3. 卸載記憶、Sub-Agent、過濾、按需載入，都是在控制「模型此刻該看什麼」。
4. 下一步是 Agentic CE：連 \( F \) 本身也逐漸交給模型設計。

本講是系列 **1/3**。後續將講 Agent 之間的互動，以及對工作的衝擊。

---

**延伸閱讀**：
- 課程投影片：[agent_era.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/agent_era.pdf)
- 前情提要：解剖小龍蝦（OpenClaw）
- 相關：ACON、ACE、MCP-Zero、Dynamic Cheatsheet
