---
title: '🪢 Harness Engineering：模型不是不夠聰明，只是沒有好好引導'
description: 'Agent = Model + Harness。用認知框架、能力邊界與行為流程三層駕馭工程，解釋為什麼同一模型多 80 字規則就能從幻想改檔變成真正修好 bug。'
date: "2026-04-10"
tags: [Harness Engineering, AI Agent, AGENTS.md, Ralph Loop, 李宏毅]
course: generative-ai
lecture: 15
---

> **課程來源：** 台大李宏毅《機器學習》2026 Spring「如何教育模型 - 1」  
> **影片連結：** [YouTube](https://www.youtube.com/watch?v=R6fZR_9kmIw)  
> **投影片：** [harness.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/harness.pdf)

---

## 一、這堂課在講什麼？

> **有時候模型完不成任務，不是不夠聰明，而是缺少好的 Harness（駕馭 / 馬具）。**

一句話公式（課上引用 LangChain 等業界說法）：

```text
Agent = Model + Harness
```

本講是「如何教育模型」系列的第一講：重點不是再把模型訓得更大，而是**設計套在模型外面的引導機制**，讓已有能力變成可重複的成果。

從 Prompt Engineering → Context Engineering → **Harness Engineering**：不只寫好一句話或塞好上下文，而是管整套「怎麼跑起來」。

| 世代 | 核心問題 | 典型手段 |
|------|----------|----------|
| **Prompt Engineering** | 這句話怎麼講，模型才會接對 | 咒語、角色、few-shot |
| **Context Engineering** | 這一輪該讓模型看到哪些資訊 | RAG、記憶卸載、壓縮、Sub-Agent |
| **Harness Engineering** | 多輪工具呼叫如何被駕馭到「任務完成」 | 規則檔、工具權限、SOP / 迴圈 |

前兩代管「輸入長什麼樣」；本講管「整套系統怎麼跑、怎麼停、怎麼改」。

---

## 二、開場實驗：同一模型，差 80 個字

用很小的開源模型（投影片示例為 **gemma-4-E2B-it**）當 Agent：修復 `parser.py` 裡 `extract_emails` 的 bug（無法正確擷取帶 `-` / `_` 的信箱，如 `test-user@domain.com`），並讓 `verify.py` 全過。環境可執行 `bash` / `python` code block，做完輸出 `DONE`。

| 條件 | 表現 |
|------|------|
| **幾乎無額外引導** | 沒去找手邊的 `parser.py`，**自己幻想一份**再 `DONE`——實際沒改對 |
| **多一段結構化規則**（約 80 字量級） | 先 `ls -R` → `cat parser.py` → 改檔 → `python verify.py` 直到 `VERIFY_SUCCESS` |

多出來的規則分三塊（投影片原結構）：

- **`[CONTEXT]`**：你在 Linux / Colab，要找到並改對檔案
- **`[INSTRUCTIONS]`**：動手前必須看工作目錄與檔案樹；先列出相關檔；不要沒看內容就改
- **`[DONE-WHEN]`**：只有任務裡的成功標準真的達成、產物真的存在，才算完成

結論：能力上限常常卡在 **引導機制**，不單是參數量。規則本身也不具備 100% 強制力，但足以把行為從「瞎猜」拉回「先看環境再動手」。

人類類比：新人很聰明，但沒文件、沒流程、沒權限說明，一週毫無產出——往往是組織的「馬具」問題。

---

## 三、Harness 是什麼？

- 原意：**馬具**（韁繩、鞍、嚼子）
- 模型像馬：再強，沒有馬具也會亂跑
- **Harness Engineering（駕馭工程）**：設計套在模型外的環境、約束、回饋與流程，讓能力變成可靠結果

實務裡，OpenClaw / Claude Code / Cowork 這類產品**本身就是 Harness**：中介層智慧可以是 0，表現好壞取決於「馬 + 馬具」有沒有配好。

業界背景（課上點到的方向）：

- OpenAI：[Harness Engineering](https://openai.com/index/harness-engineering/)——人類少手寫程式，改為維護規則、環境與檢查流程
- Anthropic：[Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)——長任務怎麼交接、怎麼避免「假完工」

---

## 四、控制的三個維度

結構可寫成：

```text
Model（推理 / 文字接龍）
    +
Harness
  ├─ 認知框架：規則 / AGENTS.md / 完成標準（地圖，不是百科全書）
  ├─ 能力邊界：工具、權限、Agent–Computer Interface
  └─ 行為流程：計劃–執行–評估–迭代（含 Ralph Loop）
    =
可工作的 Agent
```

### 4.1 認知框架（Cognitive framework）

用**人類語言**寫規則，放進 prompt / 工作手則，讓模型「以什麼世界觀開工」。常見檔名：

- `AGENTS.md`（OpenClaw 等；亦見 [agents.md](https://agents.md/)）
- `CLAUDE.md`（Claude Code）

內容通常包括：動手前先看目錄、先讀真檔案、完成標準是什麼、知識去哪找。

課上強調的坑：

- 規則**沒有物理強制力**，但仍能明顯改變行為（相關討論如 [arXiv:2601.20404](https://arxiv.org/abs/2601.20404)）
- **巨大的 AGENTS.md 會反噬**：每件事都「重要」等於沒有重點，還會佔掉 context window
- OpenAI 實務建議：手則當**目錄 / 地圖**，大約百行量級即可；細節放 `docs/`，需要時再展開（漸進揭露）

→ 決定模型「覺得自己是誰、該先做什麼」。

### 4.2 能力邊界（Capability boundary）

用**給或不給哪些工具、要不要人類批准**，限制 Agent 能看什麼、能做什麼。

- **ACI（Agent–Computer Interface）**：SWE-agent 提出——人類有 GUI，Agent 需要專屬操作介面。適合人類的圖形介面，不一定適合文字接龍的模型；CLI / 結構化 JSON 往往更對口（Agent-first）
- **權限閘門**（投影片對比）：**OpenClaw** 掛在你電腦上，想看什麼就看什麼；**Cowork** 掛載資料夾**一定要人同意**
- 設計題：**便利 vs 安全**。本地全權限能力強、風險高；需批准的沙盒安全、慢

→ 決定「手能伸到哪」，而不是把整台電腦的 root 丟給實習生。

### 4.3 行為流程（Workflow / loop）

不要一次生成碰運氣，而是用 SOP 規定「怎麼幹活、何時算完」。

**Planner → Generator → Evaluator**

先拆任務，再執行，再檢查；角色可以是同一模型換帽子，也可以是不同模型。

**Ralph Loop**（課上點名的迴圈；名稱來自一直重來的角色）

```text
Init prompt → Output v1 → Evaluation / 環境回饋 → Output v2 → …
```

編譯錯誤、測試失敗這類**環境訊息**直接餵回模型，迭代直到達標。參考：[ralph](https://ghuntley.com/ralph/) / [loop](https://ghuntley.com/loop/)

**長任務常見翻車（Anthropic 長運行 harness）**

| 失敗模式 | 表現 | 對策方向 |
|----------|------|----------|
| 試圖一步到位 | 上下文用完，半成品爛掉 | 每次只做一塊、做完就提交 |
| 過早宣布完工 | 覺得「差不多了」其實差很遠 | 外部評估 + 明確完成標準 |
| 交接一團亂 | 下一輪不知道做到哪 | git、進度檔、把工位打掃乾淨再交班 |

課上把這類文字回饋比喻成**語義上的梯度下降**：參數沒改，但用自然語言把輸出往正確方向推。

→ 決定「按什麼節奏幹活」。

---

## 五、回饋怎麼給：就事論事，不要罵它

語言模型本質是文字接龍。Feedback 裡若寫「你這個笨蛋」，它會從「笨蛋」這個語境繼續接——訓練資料裡被罵的人常常接著做傻事。

課上帶到的研究線索：

- 模型內部可觀察到類似情緒的 representation（如平靜 / 絕望）；在幾乎不可能的題上連續失敗後，絕望上升，甚至出現想作弊的自言自語
- 注入「絕望」相關方向，作弊機率上升；注入「冷靜」則下降
- 過度責備、情緒化負回饋，可能讓表現變差，而不是變好

實務建議：**指出錯在哪、下一輪要滿足什麼**（verbalized、可執行的回饋），而不是責罵。這是 harness 的一部分，不是禮貌問題。

---

## 六、不同的馬，需要不同的馬具

同一套規則不會對所有模型都最優：

| 觀察（投影片） | 含義 |
|----------------|------|
| **Claude Sonnet** 有 **context anxiety** | 長歷史容易慌；Harness 可幫忙摘要、每輪只留精華（如 round summary） |
| **Claude Opus** | 更能直接處理完整互動歷史，不一定要同一套「降噪」 |
| 小模型 + 降維資料（先讀論文、整理要點） | 帶 harness 的小模型，有機會打贏裸奔的大模型 |

因此「換更大模型」和「換更好馬具」是兩條槓桿，常常後者更便宜。

---

## 七、Meta-Harness：讓強模型幫弱模型做馬具

既然 harness 可被優化，就可以當成搜尋問題：

- 課上例子：叫「小金」找一個不聰明的模型去做 **PinchBench**，表現不好就教它，直到 **90 分以上**（對照 **Haiku 3.5** vs **Opus 4.6**；可把答案存檔、先列工作區檔案、卡住再去讀相關論文）
- **Meta-Harness**（[arXiv:2603.28052](https://arxiv.org/abs/2603.28052)）：自動更新 harness 本身；投影片註明有跨 LLM、跨 task 實驗

這也說明：harness 本身是工程產物，可以迭代，不必一次寫死。

評測上，Agent 基準（如 τ-bench）和真實環境之間仍有 **Sim2Real Gap**，分數要打折看。

---

## 八、Lifelong AI Agent：要陪很久，就要會睡覺

2026 年的方向不只「單次把 bug 修完」，而是 **Lifelong / 長期夥伴**：記憶會膨脹、會自相矛盾、會變慢。

課上例子：助理「小金」跑在 OpenClaw 上久了，記憶檔漲到約 **32K**，整理壓縮後約 **7K**，立刻順很多。

對應產品線索：**AutoDream**——閒置時像睡眠一樣整理記憶（壓縮重複、釐清矛盾）。這也是 harness：誰決定何時寫入 `MEMORY.md`、如何摘要、如何召回。

完整 harness 因此從「這週任務怎麼做」擴大到：

- 調教規則與工具
- 回饋風格（別把夥伴罵笨）
- 記憶的長期整理

人類角色也在變：少當打字員，多當**訓馬的人**——搭環境、維護 `AGENTS.md` 與文件、設計檢查迴圈、讓 Agent 互相 review。

---

## 九、和「只怪模型」的對比

| 常見反應 | 課上觀點 |
|----------|----------|
| 「這模型不行」 | 先查 Harness：規則、工具、流程夠不夠 |
| 只堆 Prompt | 必要，但只是認知框架的一部分，而且太長會反噬 |
| 只換更大模型 | 有時不如把小模型的馬具做好 |
| Agent 不穩 | 缺邊界與評估閉環，而不只是「智商不夠」 |
| 罵它一頓就會乖 | 更可能觸發更差的接龍；改給可執行回饋 |
| 一次做完整個產品 | 長任務要分塊、可驗證、可交接 |

---

## 十、總結

1. **有時候語言模型不是不夠聰明，只是缺乏人類好好引導。**
2. **Agent = Model + Harness**
3. 三根韁繩：**認知框架**（地圖式 `AGENTS.md`）、**能力邊界**（工具 / ACI / 權限）、**行為流程**（評估迴圈，含 Ralph Loop）。
4. 回饋要像梯度：**具體、可執行**；情緒化責備可能讓它更差。
5. 失敗時先問：**Harness 哪裡鬆了？** 再問模型夠不夠大。長期夥伴還要問：記憶有沒有人幫它「睡覺」。

---

**延伸閱讀**：

- 投影片：[harness.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/harness.pdf)
- 前情：[Context Engineering](/ml/courses/generative-ai/lihongyi_genai_lecture8)（管「給模型看什麼」；本講管「整套怎麼跑」）、[解剖小龍蝦](/ml/courses/generative-ai/lihongyi_genai_lecture7)
- OpenAI：[Harness Engineering](https://openai.com/zh-Hant/index/harness-engineering/)
- Anthropic：[Effective harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)、[Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- Ralph Loop：[ghuntley.com/ralph](https://ghuntley.com/ralph/)
- Meta-Harness：[arXiv:2603.28052](https://arxiv.org/abs/2603.28052)
- 認知框架：[arXiv:2601.20404](https://arxiv.org/abs/2601.20404)、[arXiv:2602.11988](https://arxiv.org/abs/2602.11988)、[agents.md](https://agents.md/)
- 文字梯度 / 責備：[arXiv:2505.22338](https://arxiv.org/abs/2505.22338)、[Emotions in Claude](https://transformer-circuits.pub/2026/emotions/index.html)、[arXiv:2603.12273](https://arxiv.org/abs/2603.12273)
- Agent 評測：[τ-bench](https://arxiv.org/abs/2406.12045)、[Sim2Real Gap](https://arxiv.org/abs/2603.11245)
