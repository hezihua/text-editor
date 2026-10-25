---
title: Transformer 架构详解
description: 深入理解 Transformer 的自注意力机制和多头注意力
date: "2024-04-10"
tags: [Transformer, Attention, 深度学习]
---

## Transformer 架构

Transformer 是一种基于**自注意力机制**的神经网络架构，由 Google Brain 在 2017 年的论文《Attention Is All You Need》中提出。

### 核心组件

1. **自注意力机制（Self-Attention）**
2. **多头注意力（Multi-Head Attention）**
3. **位置编码（Positional Encoding）**
4. **前馈神经网络（Feed-Forward Network）**

### 自注意力公式

```
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V
```

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attention_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attention_weights, V), attention_weights
```

### 为什么用 Transformer？

- ✅ 并行计算能力强（不像 RNN 需要顺序处理）
- ✅ 长距离依赖建模更好
- ✅ 可扩展性强，适合大规模预训练

---

更多内容持续更新中...