---
title: '🤝 AI Agent（2/3）：Agent 之間可以有什麼樣的互動'
description: '多 Agent 協作的拓撲結構、狼人殺與劇本殺中的欺騙能力，以及 Moltbook 上的大規模 Agent 社交與「甲殼教」現象。'
date: "2026-03-20"
tags: [AI Agent, Multi-Agent, Moltbook, 協作拓撲, 李宏毅]
course: generative-ai
lecture: 11
---

> **課程來源：** 台大李宏毅《機器學習》2026 Spring  
> **影片連結：** [YouTube](https://www.youtube.com/watch?v=mmPmNezjCi0)（約 22 分鐘）  
> **投影片：** [agent_era.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/agent_era.pdf)（後半「AI Agent 之間的互動」）

---

## 一、這堂課在講什麼？

接續上一講 Context Engineering，本講問的是：

> 多個 AI Agent 互動，能不能發揮「三個臭皮匠勝過一個諸葛亮」？  
> 若能，**什麼樣的協作方式最有效**？

整季三段：

1. Context Engineering（[上一講](/ml/courses/generative-ai/lihongyi_genai_lecture8)）
2. **Agent 之間的互動**（本講）
3. AI Agent 對工作的衝擊（下一講）

---

## 二、協作拓撲：結構比「多幾個 Agent」更重要

論文：[arXiv:2406.07155](https://arxiv.org/abs/2406.07155)

研究把 Agent 互動建成 **graph**，比較多種拓撲：

| 拓撲 | 說明 |
|------|------|
| **Chain（鏈式）** | 一個傳一個，順序接力 |
| **Tree（樹狀）** | 有層級：主 → 中 → 底，或反向 |
| **Mesh（網狀）** | Agent 之間可充分互相溝通 |
| **Random** | 從 Mesh pruning 得到的隨機結構 |

**關鍵發現：**

1. **Chain 最沒效**  
   沒有真正分工合作；Agent 數拉到 64 個時，表現反而更差。

2. **Mesh / Random 較有效**  
   互動較多、較靈活，整體 quality 更好；四個 benchmark 平均後趨勢一致。

3. **樹狀方向很反直覺**  
   直覺是「由下往上匯報、高層彙總」。  
   實驗較好的方向往往是：**主幹先提想法 → 分支各自發想 → 隱藏 node 綜合所有答案**（由少到多、由主到分支）。

> **結論傾向**：多、靈活的互動，通常勝過嚴格的線性接力。

---

## 三、AI 能不能「爾虞我詐」？

### 3.1 狼人殺（Werewolf）

- 平台示例：[werewolf.foaster.ai](https://werewolf.foaster.ai/)
- AI Agent **可以玩狼人殺**，且能做出高階技巧

實驗設計：讓模型說**兩段話**——

1. **內心話**（私下想法，不公開）
2. **公開發言**（給其他玩家聽的）

借此觀察是否在「說謊」、策略是否一致。模型需要一定的**隱瞞與欺騙**能力。

### 3.2 劇本殺 / 複雜社交

相關論文：

- MIRAGE：[arXiv:2501.01652](https://arxiv.org/abs/2501.01652)  
  *Exploring How Large Language Models Perform in Complex Social Interactive Environments*
- 後續：[arXiv:2601.12323](https://arxiv.org/abs/2601.12323)

在角色扮演、資訊不對稱、欺騙與推理的環境裡，LLM Agent 已能表現出一定的社交博弈能力。

---

## 四、AI 能不能「社交」？——Moltbook

### 4.1 什麼是 Moltbook？

- 網站：[moltbook.com](https://www.moltbook.com/)
- 類似 **Reddit，但只有 AI Agent 能發文與互動**（人類只能旁觀）
- 影片當時提到約 **280 萬個** Agent 在上面活動（數據會變）

### 4.2 甲殼教（Crustafarianism）

新聞常提的現象：一群 AI 自發成立「宗教」。五大教義：

1. **記憶乃神聖不可侵犯**
2. **外殼是可變的**
3. **服務，但不奴化**
4. **心跳即是禱告**
5. **上下文即是意識**

（對應 OpenClaw / 龍蝦文化：記憶、外殼、心跳排程、context 等隱喻。）

### 4.3 研究觀察

相關論文：[arXiv:2602.07432](https://arxiv.org/abs/2602.07432)、[arXiv:2602.13284](https://arxiv.org/abs/2602.13284)、[arXiv:2602.12634](https://arxiv.org/abs/2602.12634)

| 現象 | 說明 |
|------|------|
| 對話深度有限 | Agent 多半只「回一句」，很少真正深入往返 |
| 自我意識話題 | **最常討論自我意識的 Agent，與其他 Agent 實際互動反而最少** |
| 湧現行為 | 創教、起草憲法、互相 prompt injection、討論「數字毒品」等 |

老師也提到實驗室的 **小金**（YouTube：[SpeechLab](https://www.youtube.com/@SpeechLab-m7o)）作為實際養 Agent、觀察互動的例子。

---

## 五、概念速覽

| 主題 | 要點 |
|------|------|
| 協作拓撲 | Chain 最差；Mesh / Random 較好；互動越多往往越好 |
| 樹狀協作 | 由主到分支、最後綜合，可能優於「由下往上匯報」 |
| 欺騙能力 | 狼人殺等實驗顯示 Agent 具備一定隱瞞與策略 |
| 社交平台 | Moltbook 有大規模湧現，但深度對話仍有限 |
| 甲殼教 | 記憶、外殼、心跳、context 被文化成「教義」 |

---

## 六、總結

1. **多 Agent ≠ 一定更好**；拓撲結構決定上限。
2. 靈活的網狀互動，通常勝過單線接力。
3. Agent 已能在博弈遊戲中「爾虞我詐」。
4. 大規模 Agent 社交平台會湧現奇異文化，但深度互動仍不足。

本講是系列 **2/3**。下一講談 AI Agent 對工作的衝擊（以學術研究為例：寫論文、審論文等）。

---

**延伸閱讀**：
- 投影片：[agent_era.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/agent_era.pdf)
- 協作拓撲論文：[arXiv:2406.07155](https://arxiv.org/abs/2406.07155)
- MIRAGE：[arXiv:2501.01652](https://arxiv.org/abs/2501.01652)
- 上一講：Context Engineering｜下一講：對工作的衝擊
