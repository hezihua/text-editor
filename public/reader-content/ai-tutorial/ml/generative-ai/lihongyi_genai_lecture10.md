---
title: '💼 AI Agent（3/3）：對工作帶來的衝擊——以學術研究為例'
description: '從工具到代理：100 倍研究助理、AI 寫論文與審論文、想法新穎性 vs 可執行性，以及「想做」比「會做」更重要。'
date: "2026-03-20"
tags: [AI Agent, 學術研究, AI審稿, 工作衝擊, 李宏毅]
course: generative-ai
lecture: 12
---

> **課程來源：** 台大李宏毅《機器學習》2026 Spring  
> **影片連結：** [YouTube](https://www.youtube.com/watch?v=VqB8zMujdjM)（約 24 分鐘）  
> **投影片：** [agent_era.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/agent_era.pdf)

> ⚠️ 本講「論文」指**國際會議 / 期刊論文**（向社群溝通新貢獻），**不是學位論文**；兩者適合 AI 參與的程度應分開討論。

---

## 一、這堂課在講什麼？

AI Agent 三部曲的最後一集，用**學術研究**當例子，談對未來工作的衝擊。

| 階段 | 角色 | 說明 |
|------|------|------|
| 早期 | **工具** | 一個口令、一個動作 |
| 中期 | **協作** | 與人類一起完成任務 |
| 現在 | **代理** | 更強自主性，有機會**自己獨立完成任務** |

核心問題因此變成：

> **AI 能不能自己寫一篇（國際會議 / 期刊）論文？**

系列回顧：

1. [Context Engineering](/ml/courses/generative-ai/lihongyi_genai_lecture8)
2. [Agent 之間的互動](/ml/courses/generative-ai/lihongyi_genai_lecture9)
3. **對工作的衝擊**（本講）

---

## 二、案例：Andrew Hall 與「100 倍研究助理」

Stanford 政治經濟學教授 **Andrew Hall** 在 X 上分享：用 **Claude Code**（概念類似 OpenClaw）花約 **1 小時** prompt，讓 AI **獨自寫出一篇文章**。他形容 AI Agent 對自己領域像「迎面而來的貨車」。

| 執行者 | 時間 | 成本（約） | 結果 |
|--------|------|------------|------|
| Claude Code | ~1 小時 | ~$10 | 幾乎完成；有一筆資料貼錯 |
| 博士生 | 16 小時（約兩工作日） | 按美國行情至少 ~$1000 | 略好一點 |

Hall 的結論大致是：

- 人類仍**稍微好一點**，但差距很小
- Claude 即使再 prompt 5 次，也只要約 $50 → 仍比人類便宜約 **20 倍**
- 他寫了文章討論 **「100x Research Institution / 100 倍的 research assistant」**

相關連結：

- [Andrew Hall 的 X 討論](https://x.com/ahall_research/status/2007603340939800664)
- [The 100x Research Institution](https://freesystems.substack.com/p/the-100x-research-institution)
- Claude Code prompt 示例：[GitHub instructions](https://github.com/andybhall/vbm-replication-extension/blob/main/INSTRUCTIONS.md)

> 研究的真正意義是**解決問題**，而不是「發論文」本身。若 AI 能低成本完成大量可重複分析，研究生態會改變。

---

## 三、AI 在研究流程中的多重角色

AI Agent 已能參與：

1. **文獻蒐集與整理**
2. **撰寫文章**
3. **自主訓練模型**（作業二可體驗：Agent 當 AI Engineer，自己改 training script、迭代模型）
4. **實驗與分析**

代表方向：Karpathy 的 [autoresearch](https://github.com/karpathy/autoresearch)。老師也提到用 Claude Code 完成「如何用 AI Agent 做學術研究」類文章的台灣實踐。

---

## 四、產生研究想法：新穎性 ≠ 可執行性

兩篇重要對照：

1. **Can LLMs Generate Novel Research Ideas?**  
   [arXiv:2409.04109](https://arxiv.org/abs/2409.04109)  
   - 大規模人類研究（100+ NLP 研究者）  
   - AI 在**新穎性**上可表現突出

2. **The Ideation-Execution Gap**  
   [arXiv:2506.20803](https://arxiv.org/abs/2506.20803)  
   - 把 LLM / 人類想法真的做成短論文再審  
   - 實作後，AI 點子的新穎感往往掉下來——表面堆砌新詞，落地做不起來

另一觀察（[arXiv:2511.15534](https://arxiv.org/abs/2511.15534)）：不少作者反映 AI「缺乏創造力」，難產生超出既有模板的複雜實驗想法。

> **傾向**：AI 擅長在既有範式內加速執行、迭代；**真正開創性方向**仍常需要人類在早期引導。  
> 也別忘記：這是 2025 年的結論；模型只會更強。

---

## 五、AI 審論文：已進入正式流程

**AAAI 2026**：

- AI **正式進入審查流程**
- 每篇除人類 reviewer 外，還有 **AI reviewer**
- AI **只給意見、不打分數**
- 也有人類 + AI 的 Meta Reviewer 設定

老師提醒：

- 不知道有多少「人類」背後其實是 AI Agent
- 要重新思考 **Review 真正的意義**

**AI 寫論文 + AI 審論文的閉環**

- 例如 Stanford 的 [Agents4Science](https://agents4science.stanford.edu/)
- 接受率仍可低於 20%
- 「AI 產出 → AI 評審」已可能發生，但品質與意義仍有爭議

老師也提到用實驗室 Agent **小金**協助審查論文的經驗。

---

## 六、人類還剩什麼？

> 在 AI Agent 萌芽的時代，  
> **「想做」什麼比「會做」什麼更重要。**

- 今天很多環節仍需要人來決定**方向與價值判斷**
- 學位論文 vs 會議 / 期刊論文：適合 AI 參與的程度不同
- 競賽：[Teaching Monster 教學怪獸挑戰](https://teaching.monster/)（台大 AI 卓越研究中心主辦）

下次課程將深入模型內部（inference）；可先複習：[深入解剖大型語言模型](https://youtu.be/8iFvM7WUUs8)

---

## 七、三集系列總覽

| 集數 | 主題 | 核心內容 |
|------|------|----------|
| **(1/3)** | Context Engineering | 壓縮、記憶、Sub-Agent、按需載入、Agentic CE |
| **(2/3)** | Agent 之間的互動 | 協作拓撲（Mesh > Chain）、狼人殺、Moltbook |
| **(3/3)** | 對工作的衝擊 | 100x 研究助理、AI 寫/審論文、人類價值判斷 |

---

## 八、總結

> AI Agent 已能以遠低於人類的成本完成大量研究執行工作（文獻、寫作、實驗、甚至部分審查）；  
> 人類更關鍵的優勢，逐漸轉向**選題、價值判斷，以及在 AI 閉環中仍堅持「真正的研究意義」**。

---

**延伸閱讀**：
- 投影片：[agent_era.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/agent_era.pdf)
- [The 100x Research Institution](https://freesystems.substack.com/p/the-100x-research-institution)
- Ideation-Execution Gap：[arXiv:2506.20803](https://arxiv.org/abs/2506.20803)
- [Agents4Science](https://agents4science.stanford.edu/)
