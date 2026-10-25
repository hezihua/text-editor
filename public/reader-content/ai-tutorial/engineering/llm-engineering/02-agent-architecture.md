---
title: "Agent 架构设计"
description: "从 ReAct 到多 Agent 系统，梳理 LLM Agent 的核心设计模式。"
date: "2025-07-22"
tags: ["LLM", "Agent", "工具调用"]
course: "LLM 工程化"
lecture: 2
---

> **课程来源**：AI 工程化实战笔记
> **影片链接**：待补充
> **投影片**：待补充

## 一、什么是 Agent

Agent 是具备**感知、推理、行动**能力的智能体。与单次问答的 LLM 不同，Agent 能够自主规划步骤、调用工具、根据反馈调整策略。

## 二、核心设计模式

### 1. ReAct（Reasoning + Acting）

让模型交替进行"思考"与"行动"：

```
Thought: 用户想知道北京今天的天气
Action: get_weather("Beijing")
Observation: 晴，26°C
Thought: 我已经获得天气信息
Final Answer: 北京今天晴，26°C
```

### 2. Plan-and-Execute

先生成完整计划，再逐步执行：

1. Planner 接收任务，拆分为子任务列表
2. Executor 按顺序执行子任务
3. Replanner 根据中间结果调整后续计划

### 3. Reflection

Agent 在完成任务后，对自身输出进行反思和批判，用于提升结果质量。

## 三、工具调用（Tool Use）

### 1. Function Calling

主流 LLM 都支持通过函数签名的方式，将外部工具暴露给模型调用：

```json
{
  "tools": [{
    "type": "function",
    "function": {
      "name": "search_flight",
      "description": "根据出发地、目的地和日期查询航班",
      "parameters": {
        "type": "object",
        "properties": {
          "from": { "type": "string" },
          "to": { "type": "string" },
          "date": { "type": "string" }
        },
        "required": ["from", "to", "date"]
      }
    }
  }]
}
```

### 2. 常用工具类别

- **搜索类**：Web 搜索、知识库检索
- **计算类**：代码执行、数学公式
- **系统类**：文件读写、日历、邮件
- **业务类**：查询订单、创建工单、调用内部 API

## 四、多 Agent 协作

复杂场景可以由多个 Agent 协作完成：

- **协作模式**：Planner / Executor / Critic
- **辩论模式**：多个 Agent 对同一问题给出答案并相互评审
- **层级模式**：主管 Agent 分派任务给专家 Agent

## 五、工程挑战

- **上下文窗口限制**：长链任务需关注历史消息裁剪
- **可靠性**：工具调用失败、幻觉、死循环
- **可观测性**：完整追踪 Agent 的思考链与工具调用

## 六、小结

Agent 让 LLM 从"被动响应"进化为"主动执行"。在工程实践中，稳定可靠的 Agent 往往需要结合**完善的工具定义、健壮的错误处理、详细的日志观测**三方面共同保证。
