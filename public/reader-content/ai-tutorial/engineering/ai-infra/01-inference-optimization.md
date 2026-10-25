---
title: "大模型推理优化"
description: "从量化、KV Cache、TensorRT 到 vLLM，介绍 LLM 推理加速的核心技术。"
date: "2025-07-29"
tags: ["AI Infra", "推理", "性能优化"]
course: "AI 基础设施"
lecture: 1
---

> **课程来源**：AI 工程化实战笔记
> **影片链接**：待补充
> **投影片**：待补充

## 一、推理优化的目标

大模型推理面临三大挑战：

1. **延迟高**：单 token 生成耗时长，影响交互体验
2. **吞吐低**：单卡同时服务用户数有限
3. **成本高**：GPU 资源昂贵，规模化部署代价大

## 二、核心优化技术

### 1. 量化（Quantization）

将模型权重从 FP16/FP32 压缩到更低精度：

| 方法 | 精度 | 特点 |
| --- | --- | --- |
| FP8 | 8 位 | 硬件原生支持，训练/推理一致 |
| INT8 | 8 位 | 动态/静态量化，精度损失小 |
| INT4 | 4 位 | 低比特量化，需谨慎校准 |
| AWQ/GPTQ | 4 位 | 针对 LLM 的专用量化算法 |

### 2. KV Cache 优化

Transformer 在生成阶段会缓存历史 token 的 Key/Value 矩阵，避免重复计算：

- **PagedAttention**：将 KV Cache 分页管理，减少显存碎片
- **Prefix Caching**：多个请求共享相同前缀时复用 KV
- **KV 压缩**：对历史 KV 进行稀疏化或低秩近似

### 3. 算子融合

将多个小算子合并为一个大算子，减少 GPU Kernel 启动开销：

- FlashAttention
- Fused MLP
- FlashInfer

### 4. 批处理策略

- **静态批处理**：固定 batch 大小
- **动态批处理**：按到达时间窗口聚合请求
- **连续批处理**（Continuous Batching）：迭代级别动态拼接

## 三、主流推理框架

### 1. vLLM

基于 PagedAttention 的高性能推理引擎，特点：

- 高吞吐、低显存
- 支持多种模型（LLaMA、Qwen、Mistral 等）
- 提供 OpenAI 兼容的 API 接口

```bash
vllm serve meta-llama/Meta-Llama-3-8B \
  --tensor-parallel-size 2 \
  --max-model-len 8192
```

### 2. TensorRT-LLM

NVIDIA 官方推理优化器，极致性能，适合部署在生产 GPU 集群。

### 3. SGLang / LMDeploy

国产高性能推理框架，在动态批处理与多模态场景下表现突出。

## 四、实践建议

- 首先开启**量化**（INT8/INT4），直接将显存占用降低 50%~75%
- 启用 **PagedAttention**，显著提升吞吐
- 根据业务 QPS 选择合适的**并行策略**：TP（张量并行）、PP（流水线并行）、EP（专家并行）
- 压测对比不同框架的**延迟-吞吐-成本**曲线

## 五、小结

推理优化是 AI Infra 工程师的核心能力。一个"同等模型、10 倍吞吐"的优化方案，往往能带来显著的成本下降与用户体验提升。
