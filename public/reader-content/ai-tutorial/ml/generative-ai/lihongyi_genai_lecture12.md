---
title: '🗄️ 加快語言模型生成速度（2/2）：KV Cache'
description: 'Prefill / Decode、為何只存 K/V、顯存如何被撐爆，以及 MQA / GQA / MLA 如何把 Cache 壓小。'
date: "2026-03-20"
tags: [KV Cache, Inference, GQA, MLA, 李宏毅]
course: generative-ai
lecture: 14
---

> **課程來源：** 台大李宏毅《機器學習》2026 Spring  
> **影片連結：** [YouTube](https://www.youtube.com/watch?v=fDQaadKysSA)（約 39 分鐘）  
> **投影片：** [inference.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/inference.pdf)（與 Flash Attention 同一份）  
> **先備：** [語言模型內部運作](https://youtu.be/8iFvM7WUUs8)｜上一講：[Flash Attention](/ml/courses/generative-ai/lihongyi_genai_lecture11)

---

## 一、這堂課在講什麼？

生成過程分兩段：

| 階段 | 名稱 | 行為 |
|------|------|------|
| 前半 | **Prefill** | 一次吃進整段 prompt（如「李宏毅幾班」） |
| 後半 | **Decode** | 一個一個產出 token（大 → 金 → `[END]`） |

> **KV Cache = 把已算過的 Key / Value 存起來，生成新 token 時只算當前 QKV，並複用歷史 K/V。**

概念極簡單，但會直接決定 decode 速度與顯存上限。

---

## 二、為什麼要存 K 和 V？

以 prompt 有 3 個 token 為例：

- 算出 \(Q_1,Q_2,Q_3\) 與 \(K_1..K_3,\ V_1..V_3\)
- \(O_1,O_2,O_3\) 可**並行**計算
- **丟掉 Q**，但把 **K、V 存下來** → 這就是 **KV Cache**

生成第 4 個 token 時：

- 只需算新的 \(Q_4, K_4, V_4\)
- \(Q_4\) 與**已快取的** \(K_1..K_4\) 做 attention，再對 \(V_1..V_4\) 加權求和
- **不必**把前面 1～3 的 K/V 全部重算

每多生成一個 token，都只新增自己的 K/V，歷史部分直接複用。

> 為什麼存 K、V 不存 Q？  
> 新 token 只需要自己的 Q 去跟**所有歷史 K** 比；舊 Q 不會再參與。

---

## 三、為什麼會「撐爆倉庫」？

Flash Attention 擔心的是 **SRAM（工作台）** 太小；  
KV Cache 擔心的是 **HBM（大倉庫）** 也會被塞滿。

原因：

1. **每個 token、每一層、每個 head 都要存 K 和 V**
2. 序列越長、層數越多、並發用戶越多，cache 線性膨脹
3. 多用戶服務時，每人一份 KV Cache，顯存很快見底

粗算示例（Gemma 2 量級）：

```text
每個 token 約：
46 layers × 32 heads × 128 dim × 2 (FP16) × 2 (K 與 V)
≈ 753,664 bytes ≈ 0.72 MB / token

A100 80GB 粗估大約能撐 ~114k tokens（理想情況、未計模型權重等）
```

實際部署還要扣掉模型權重、激活、碎片等，可用 context 更緊。

---

## 四、省顯存的架構方向

### 4.1 Multi-Query Attention (MQA)

- 多個 query head **共用同一組 K/V**
- KV Cache 體積大幅下降

### 4.2 Grouped-Query Attention (GQA)

- 折中：若干 query head 共用一組 K/V（如 Llama、Gemma 等）
- 質量接近 Multi-Head，顯存遠小於完整 MHA

| 方案 | K/V 組數 | 顯存 | 質量傾向 |
|------|----------|------|----------|
| Multi-Head | = head 數 | 最大 | 基準 |
| Grouped-Query | 幾組 | 中等 | 接近 MHA |
| Multi-Query | 1 組 | 最小 | 略有取捨 |

### 4.3 Multi-head Latent Attention (MLA)

- DeepSeek 等採用：[arXiv:2405.04434](https://arxiv.org/abs/2405.04434)
- 用低秩 / latent 表示壓縮要快取的內容
- 進一步壓 KV Cache，同時儘量保住表達能力

（實作上，MLA 與 RoPE 的結合細節很關鍵。）

---

## 五、和其他加速手段的關係

| 技術 | 主要解決什麼 |
|------|----------------|
| **Flash Attention** | 單次 attention 算得快、少寫中間大矩陣（I/O） |
| **KV Cache** | Decode 時不重算歷史 K/V（算力 + 延遲） |
| **MQA / GQA / MLA** | 讓 KV Cache 本身更小（顯存） |
| **Speculative Decoding** | 用小模型「猜」多步，大模型一次驗證（吞吐） |

Prefill 仍可能很重（整段 prompt 的 attention）；Decode 則高度依賴 KV Cache 是否放得下、是否命中。

---

## 六、概念速覽

| 問題 | 答案 |
|------|------|
| 為什麼能加速？ | 避免每步對整段歷史重新投影出 K/V |
| 為什麼仍可能 OOM？ | Cache 隨「層數 × head × 長度 × 並發」線性漲 |
| 怎麼繼續省？ | MQA / GQA / MLA、量化 cache、驅逐不重要 token 等 |

---

## 七、總結

> **KV Cache = 把已算過的 Key/Value 存起來，生成新 token 時只算當前 QKV 並複用歷史 K/V；極大加速 decode，但會線性吃顯存，因此需要 MQA / GQA / MLA 等壓縮手段。**

| 集 | 主題 | 一句話 |
|----|------|--------|
| (1/2) | [Flash Attention](/ml/courses/generative-ai/lihongyi_genai_lecture11) | 分塊 + Online Softmax，不寫完整 attention 矩陣，加速且 exact |
| (2/2) | KV Cache（本講） | 快取歷史 K/V，decode 不重算；再用 GQA / MLA 壓顯存 |

下一主題通常是：**如何讓 Transformer 知道輸入 Token 的順序？**（Absolute / Relative / RoPE）→ [YouTube](https://www.youtube.com/watch?v=Ll-wk8x3G_g)

---

**延伸閱讀**：
- 投影片：[inference.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/inference.pdf)
- Speculative Decoding：[YouTube](https://youtu.be/MAbGgsWKrg8)
- MLA：[arXiv:2405.04434](https://arxiv.org/abs/2405.04434)
