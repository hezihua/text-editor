---
title: "LangChain 上下文管理实战"
description: "从 Memory 模块到 LangGraph 状态管理，用代码拆解 Agent 时代 Context Engineering 的落地实现。"
date: "2025-08-14"
tags: ["LangChain", "Context Engineering", "RAG", "Agent", "Python"]
course: "LLM 工程化"
lecture: 3
---

> **课程来源**：AI 工程化实战笔记
> **影片链接**：待补充
> **投影片**：待补充

---

## 一、为什么需要上下文管理

模型 API 是**无状态**的——每次调用都要把完整 Context 重新发送。随着对话轮次增加，Context 快速膨胀，面临三个问题：

1. **Token 上限**：超过模型的 Context Window 就报错
2. **Lost in the Middle**：中间内容被模型"遗忘"，回答质量下降
3. **成本爆炸**：Token 数量 = 费用，全量发送 = 烧钱

LangChain 提供了从 Memory 模块到 LangGraph 状态管理的完整工具链来解决这个问题。

---

## 二、LangChain Memory 模块

### 2.1 全量保留：ConversationBufferMemory

最简单的策略，把所有对话历史原样保留。

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
memory.chat_memory.add_user_message("我叫小明")
memory.chat_memory.add_ai_message("你好，小明！")

# 每次调用时，框架自动把历史拼进 prompt
print(memory.buffer)  # Human: 我叫小明\nAI: 你好，小明！
```

**适用场景**：短对话（少于 10 轮），不会触及 Token 上限。

**问题**：对话一长就爆。

### 2.2 滑动窗口：ConversationBufferWindowMemory

只保留最近 N 轮对话。

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=5)  # 只留最近 5 轮

for i in range(10):
    memory.chat_memory.add_user_message(f"第 {i} 轮问题")
    memory.chat_memory.add_ai_message(f"第 {i} 轮回答")

# 只有第 5~9 轮的内容在 memory 里
```

**适用场景**：客服对话、实时问答。

**问题**：早期对话信息直接丢失，无法回溯。

### 2.3 自动摘要：ConversationSummaryMemory

当历史过长时，调用模型做摘要压缩。

```python
from langchain.memory import ConversationSummaryMemory
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
memory = ConversationSummaryMemory(llm=llm)

# 每次添加消息时，框架会自动维护一个摘要
memory.chat_memory.add_user_message("我叫小明，住在台北")
memory.chat_memory.add_ai_message("好的，记住了！")

print(memory.buffer)
# "The human introduces themselves as 小明, living in 台北."
```

**适用场景**：长对话、需要保留全局信息。

**问题**：每次摘要都要调一次模型，增加延迟和成本；反复摘要会导致细节丢失（Context Collapse）。

### 2.4 混合策略：ConversationSummaryBufferMemory

摘要 + 滑动窗口的组合：最近几轮保留原文，更早的压缩成摘要。

```python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,  # 超过 2000 token 就触发压缩
)
```

**适用场景**：大多数生产环境的最佳选择。

### 2.5 向量检索：VectorStoreRetrieverMemory

把所有对话存入向量数据库，每次只检索与当前问题相关的历史。

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma(embedding_function=OpenAIEmbeddings())

memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),  # 检索 top-3
)

memory.save_context(
    {"input": "我喜欢吃火锅"},
    {"output": "好的，记住了！"},
)

# 之后任何时刻问到食物偏好，都能检索到
memory.load_memory_variables({"prompt": "我喜欢吃什么？"})
# {"history": "Human: 我喜欢吃火锅\nAI: 好的，记住了！"}
```

**适用场景**：长期记忆、跨会话记忆、海量历史。

**问题**：依赖向量数据库，检索质量受 Embedding 模型影响。

---

## 三、策略对比

| 策略 | Token 消耗 | 信息保留 | 延迟 | 适用场景 |
|---|---|---|---|---|
| BufferMemory | 高 | 全量 | 低 | 短对话（少于 10 轮） |
| WindowMemory | 低 | 只留最近 | 低 | 实时问答 |
| SummaryMemory | 中 | 压缩后 | 高（额外调用） | 长对话 |
| SummaryBuffer | 中 | 混合 | 中 | 生产推荐 |
| VectorStore | 低 | 按需检索 | 中 | 长期记忆 |

---

## 四、在 Chain 中使用 Memory

```python
from langchain.chains import ConversationChain

llm = ChatOpenAI(model="gpt-4o-mini")
memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,
    return_messages=True,
)

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True,  # 打印实际发送给模型的完整 prompt
)

conversation.predict(input="我叫小明，住在台北，在做 AI 开发")
conversation.predict(input="推荐一个适合我学的框架")
# 模型能从摘要中知道你的背景，给出个性化推荐
```

---

## 五、RAG：外部知识管理

Memory 管理的是对话历史，RAG 管理的是外部知识。两者互补：

```python
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.memory import ConversationSummaryBufferMemory

# 1. 文档存入向量库
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(),
)

# 2. 对话历史用摘要管理
memory = ConversationSummaryBufferMemory(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    max_token_limit=2000,
    memory_key="chat_history",
    return_messages=True,
)

# 3. 组合成带记忆的 RAG 链
qa = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-4o", temperature=0),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    memory=memory,
)

qa.invoke({"question": "什么是 Context Engineering？"})
qa.invoke({"question": "它和 Prompt Engineering 有什么区别？"})
# 第二个问题能理解"它"指代 Context Engineering，因为 memory 保留了上下文
```

---

## 六、LangGraph：Agent 状态管理

对于真正的 AI Agent，LangChain 的 Memory 模块不够用——Agent 需要更复杂的状态管理：工具调用记录、中间结果、任务规划等。

LangGraph 提供了**有状态的图结构**：

```python
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """搜索网络"""
    return f"搜索结果: {query}"

@tool
def write_file(filename: str, content: str) -> str:
    """写入文件"""
    return f"已写入 {filename}"

tools = [search_web, write_file]
llm = ChatOpenAI(model="gpt-4o").bind_tools(tools)

def call_model(state: MessagesState):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# 构建 Agent 工作流
graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", tool_node)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")

# 编译时传入 checkpointer，自动持久化状态
app = graph.compile(checkpointer=MemorySaver())

# 每次调用只需传 thread_id，框架自动加载历史状态
config = {"configurable": {"thread_id": "session-001"}}

# 第一轮
app.invoke(
    {"messages": [{"role": "user", "content": "帮我搜索 Context Engineering"}]},
    config=config,
)

# 第二轮（框架自动带上之前的对话和工具调用记录）
app.invoke(
    {"messages": [{"role": "user", "content": "把结果写入 notes.md"}]},
    config=config,
)
```

### LangGraph vs Memory 模块

| 对比项 | Memory 模块 | LangGraph |
|---|---|---|
| 状态类型 | 仅对话历史 | 对话 + 工具调用 + 任务状态 + 自定义字段 |
| 持久化 | 手动配置 | 内置 checkpointer，自动保存/恢复 |
| 多 Agent | 不支持 | 原生支持多节点协作 |
| 状态可观测 | 不支持 | LangSmith 可视化追踪 |
| 复杂度 | 低 | 中高 |

---

## 七、自定义 Context Manager

当框架内置方案不够用时，可以自己实现：

```python
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma

class ContextManager:
    """三层 Context 管理：短期 → 摘要 → 长期向量库"""

    def __init__(self, llm, vectorstore, max_short_term=5, max_tokens=4000):
        self.llm = llm
        self.vectorstore = vectorstore
        self.short_term = []          # 最近 N 轮原文
        self.summary = ""             # 历史摘要
        self.max_short_term = max_short_term
        self.max_tokens = max_tokens

    def add_message(self, human_msg: str, ai_msg: str):
        """添加一轮对话"""
        self.short_term.append({"human": human_msg, "ai": ai_msg})

        # 存入向量库（长期记忆）
        self.vectorstore.add_texts([
            f"Human: {human_msg}\nAI: {ai_msg}"
        ])

        # 超过限制时触发压缩
        if len(self.short_term) > self.max_short_term:
            self._compress()

    def _compress(self):
        """把短期记忆压缩成摘要"""
        old_messages = self.short_term[:-self.max_short_term]
        self.short_term = self.short_term[-self.max_short_term:]

        text = "\n".join(
            f"Human: {m['human']}\nAI: {m['ai']}" for m in old_messages
        )

        prompt = f"请将以下对话摘要成简洁的要点：\n\n{text}"
        new_summary = self.llm.invoke(prompt).content

        self.summary = f"{self.summary}\n{new_summary}" if self.summary else new_summary

    def get_context(self, query: str) -> str:
        """组装最终发送给模型的 Context"""
        # 1. 检索相关长期记忆
        relevant = self.vectorstore.similarity_search(query, k=3)
        relevant_text = "\n".join([doc.page_content for doc in relevant])

        # 2. 拼接：摘要 + 相关记忆 + 最近对话
        parts = []
        if self.summary:
            parts.append(f"## 历史摘要\n{self.summary}")
        if relevant_text:
            parts.append(f"## 相关记忆\n{relevant_text}")

        recent = "\n".join(
            f"Human: {m['human']}\nAI: {m['ai']}" for m in self.short_term
        )
        if recent:
            parts.append(f"## 最近对话\n{recent}")

        return "\n\n".join(parts)


# 使用
llm = ChatOpenAI(model="gpt-4o-mini")
vectorstore = Chroma(embedding_function=OpenAIEmbeddings())
ctx = ContextManager(llm, vectorstore, max_short_term=5)

ctx.add_message("我叫小明", "你好小明！")
ctx.add_message("我在学 LangChain", "很好的选择！")

context = ctx.get_context("我叫什么名字？")
# 组装好的 Context 直接作为 system prompt 发给模型
response = llm.invoke(f"{context}\n\n用户问题：我叫什么名字？")
```

---

## 八、生产环境建议

### 8.1 存储选型

| 存储类型 | 工具 | 适用场景 |
|---|---|---|
| 内存 | Python dict | 开发测试 |
| Redis | `langchain_redis` | 多实例部署、低延迟 |
| PostgreSQL | `langchain_pg` | 需要事务一致性 |
| 向量数据库 | Chroma / Pinecone / Weaviate | RAG、长期记忆 |
| SQLite | `langchain_sqlite` | 单机轻量部署 |

### 8.2 实践要点

1. **监控 Token 消耗**：每次调用前打印 `len(memory.buffer)`，设置告警阈值
2. **异步压缩**：不要在用户请求链路里做摘要，用后台任务异步执行
3. **会话隔离**：每个用户/会话用独立的 `session_id`，避免串话
4. **降级策略**：向量库挂了就降级到滑动窗口，不要让整个系统不可用
5. **缓存 Embedding**：重复的文本不要重复计算向量

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))

# 在调用前检查
context = ctx.get_context(query)
token_count = count_tokens(context)

if token_count > 8000:
    # 降级：减少检索结果数量或更激进地压缩
    context = ctx.get_context(query, reduce=True)
```

---

## 九、总结

Context Engineering 的落地路径：

```
简单对话 → BufferMemory
长对话   → SummaryBufferMemory
跨会话   → VectorStoreRetrieverMemory
RAG 应用 → ConversationalRetrievalChain + Memory
AI Agent → LangGraph + Checkpointer
定制需求 → 自定义 ContextManager
```

核心原则：**模型 API 是无状态的，Context 管理永远是框架（或你的代码）的责任。** 框架提供工具，策略需要你来定。
