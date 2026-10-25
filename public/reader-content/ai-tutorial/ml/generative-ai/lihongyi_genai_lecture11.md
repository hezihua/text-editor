---
title: '⚡ 加快語言模型生成速度（1/2）：Flash Attention'
description: '為什麼 Attention 慢在「搬運」不在「計算」：HBM vs SRAM、分塊 Tiling、Online Softmax，以及不寫出完整 Attention 矩陣的精確加速術。'
date: "2026-03-20"
tags: [Flash Attention, Inference, Transformer, GPU, 李宏毅]
course: generative-ai
lecture: 13
---

> **課程來源：** 台大李宏毅《機器學習》2026 Spring  
> **主題：** 加快語言模型生成速度（1/2）：Flash Attention（約 50 分鐘）  
> **投影片：** [inference.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/inference.pdf)  
> **先備：** [語言模型內部運作原理](https://youtu.be/8iFvM7WUUs8)｜**論文：** [FlashAttention](https://arxiv.org/abs/2205.14135)

---

## 一、這堂課在講什麼？

加快語言模型**生成（Inference）**速度，經典方法有三類：

1. **Flash Attention**（本講）
2. **KV Cache**（下一講）
3. **Speculative Decoding**（過去已講，見 [2024 生成式 AI 第 16 講](https://youtu.be/MAbGgsWKrg8)）

> 今天你用語言模型時，多半已經在用 Flash Attention，只是不一定知道它怎麼算。

Flash Attention 的特點：

- **不改變** attention 的計算結果（不是近似）
- **隨插即用**：可套到任何使用 self-attention 的 Transformer
- 代價小、效果大（長序列上可約 **8×～9×** 加速）

來源是 2022 年論文，已是「上古神技」，至今仍是標配。

---

## 二、為什麼 Attention 慢？瓶頸在「搬運」

GPU 記憶體分層（倉庫 / 工作台）：

| 層級 | 比喻 | 特點 |
|------|------|------|
| **HBM** | 大倉庫 | 容量大、讀寫慢 |
| **SRAM** | 工作台 | 極快、但空間很小 |

標準 Self-Attention：

$$
\text{Attention}(Q,K,V) = \mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right) V
$$

樸素實作會：

1. 在 HBM 上存完整的 $QK^\top$（序列長 $N$ 時是 $O(N^2)$）
2. 再讀回來做 softmax
3. 再與 $V$ 相乘

→ **大量時間花在 HBM ↔ SRAM 的來回搬運**，而不是矩陣乘法本身。  
這是典型的 **memory-bound（I/O bound）**，不是 compute-bound。

---

## 三、改進思路：分塊（Tiling）

把 $Q$、$K$、$V$ 切成小塊：

- 每次只把能放進 SRAM 的塊搬上「工作台」
- 在 SRAM 裡做完，再寫回必要結果

可把「讀好幾次」降到大約 **兩次量級** 的有效讀寫策略；但仍可能要把中間 attention 相關量寫回 HBM——還不夠。

---

## 四、靈魂拷問：一定要算出完整 Attention Weight 嗎？

標準流程心理上是：

1. 算出完整 attention matrix $A = \mathrm{softmax}(QK^\top / \sqrt{d})$
2. 再 $O = AV$

Flash Attention 的關鍵洞察：

> **不需要把完整的 attention weight 矩陣真正存出來。**  
> 在 SRAM 裡做完 $QK$ 後，直接與 $V$ 做加權累積，得到輸出 $O$。

全程：

- 巨大的 $N \times N$ attention 矩陣**從不完整寫回 HBM**
- 只維護輸出 $O$，以及做 softmax 所需的少量統計量

副作用：幾乎「讀不出」完整 attention map（做 interpretability 時不方便）——這正是加速的代價與收益。

---

## 五、Online Softmax：分塊也能算對

問題：softmax 需要**整行**的最大值和加總，分塊時看不到整行怎麼辦？

**Online Softmax** 用數學修正：

- 維護目前為止的 **running max** 與 **running sum**
- 當新塊出現更大的 max 時，用新舊 max 的差去**修正**之前的累積結果
- 最終數值與「一次看完全行再 softmax」等價（在浮點誤差範圍內）

因此可以一塊一塊處理，不必為了 softmax 把整行中間結果反覆寫回 HBM。  
這是 Flash Attention 能 **exact（精確）** 又快的關鍵數學工具。

---

## 六、效果與實務

- 長序列（如 4096 tokens）上，相對樸素實作可約 **8×～9×** 加速（視硬體與實作而定）
- 數值結果與原生 attention **幾乎相同**（浮點累積順序不同可能有極小差異）
- 現代框架常預設啟用類似優化，例如指定 `attn_implementation` 為 `sdpa`

是否真的走到 Flash Attention，取決於 PyTorch 版本、GPU 型號等環境。

投影片後半會銜接到 **KV Cache**（decode 階段必須存 K/V，否則每步重算）。

---

## 七、概念直覺對照

| 概念 | 直覺 |
|------|------|
| 標準 Attention | 先造整張大表 $A$，再乘 $V$ → 表太大，搬運貴 |
| Tiling | 桌子一次只放得下一塊，分塊搬、分塊算 |
| Online Softmax | 邊算邊記「目前最大」和「目前總和」，新塊來了再修正 |
| Flash Attention | 工作臺上算完就累加進 $O$，大表從不進倉庫 |

數學上仍是：

$$
O_i = \sum_j \mathrm{softmax}_j\left(\frac{q_i^\top k_j}{\sqrt{d}}\right) v_j
$$

只是實作順序與存取模式完全不同。

---

## 八、總結

> **Flash Attention 透過「分塊 + Online Softmax」，在不改變 attention 數學結果的前提下，避免把 $O(N^2)$ 的 attention 矩陣寫入 HBM，大幅減少 GPU 記憶體讀寫，顯著加快（尤其是長序列的）Transformer 運算。**

| 集 | 主題 |
|----|------|
| 本講 (1/2) | Flash Attention（算 attention 本身更快、更省顯存） |
| 下一講 (2/2) | [KV Cache](https://www.youtube.com/watch?v=fDQaadKysSA)（生成時避免重複算歷史 K/V） |
| 延伸 | Speculative Decoding（小模型猜、大模型驗證） |

---

**延伸閱讀**：
- 投影片：[inference.pdf](https://speech.ee.ntu.edu.tw/~hylee/ml/ml2026-course-data/inference.pdf)
- 論文：[FlashAttention (arXiv:2205.14135)](https://arxiv.org/abs/2205.14135)
- Speculative Decoding：[YouTube](https://youtu.be/MAbGgsWKrg8)
