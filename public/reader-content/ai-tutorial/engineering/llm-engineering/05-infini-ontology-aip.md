---
title: "Infini Ontology：AIP 闭环要点总结"
description: "用 Ontology / Action 把 Agent 读写收束到受控网关：与传统 API、审批流的差异，以及本地跑通方式。"
date: "2026-08-21"
tags: ["AIP", "Ontology", "Agent", "HITL", "Action"]
course: "LLM 工程化"
lecture: 5
---

> **课程来源**：AI 工程化实战笔记
> **作者**：jimmy
> **投影片**：待补充

---

本文整理自项目讨论，说明开源版 AIP（Artificial Intelligence Platform）闭环在做什么、和传统系统差在哪、以及当前实现如何把 Agent 的读写面收束到 Ontology / Action。

---

## 一、核心闭环

```text
Raw Data → Ontology（业务对象）→ Agent（编排）→ Action（受控写回）
```

目标不是复刻绚丽界面，而是让「死表」变成「活的业务对象」：大模型能读、能写，但必须走平台规则与安全边界。

当前仓库大致对应：

| 层 | 作用 | 状态 |
|----|------|------|
| Ontology | ObjectType / LinkType / ActionType 注册与校验 | ✅ |
| Data | 对象实例与 Action 记录存储 | ✅（轻量） |
| Agent | LangGraph / heuristic，只调 Ontology 工具 | ✅ |
| Action + HITL | pending → 人工批准 → 写回 | ✅ |
| Casbin | 对象读过滤、Action submit/approve | ✅ |
| 前端 | Next.js 控制台（`frontend/`，端口 3010） | ✅ |
| MCP | 给外部客户端插线 | ❌ 已跳过（自研 Agent） |

---

## 二、和「传统写回按钮」的差别

### 传统

```text
用户改表单 → 点保存 → API 直接 UPDATE → 完成
```

写操作绑在 UI 上，一次请求里改库。

### Infini / AIP

```text
Agent 理解意图
  → 生成 Action（pending，尚未改业务对象）
  → Casbin：谁能提、谁能批
  → Human-in-the-loop（如 carol 批准）
  → 真正写回 Object
```

| | 传统写回按钮 | Action + HITL |
|--|--|--|
| 改库时机 | 点击即写 | 批准后才写 |
| AI 角色 | 容易变成「代你点保存」 | 只能提交受控 Action |
| 审计 | 多为日志 | 有独立 Action 记录 |

---

## 三、「传统也能审批」——那 AIP 还多什么？

传统审批流里同样可以：alice 提交 → admin/carol 批准 → 再写库。  
**有没有 HITL，不是 AIP 的独家发明。**

真正多出来的是约束面，尤其是对 AI：

| | 传统审批 | AIP / Infini |
|--|--|--|
| 提交物 | 表单 / 流程实例 | 本体上声明的 **ActionType**（强类型参数） |
| 写库 | 流程节点里跑业务代码 / SQL | **只能**执行已注册 Action |
| AI 通道 | 常另开接口直写，与人走两套路 | **人和 Agent 写库都走 Action** |
| 读侧 | 多在提交后卡权限 | 提交前 Agent 只能看见授权 Objects |

一句话：

- 传统也能做人审。
- AIP 把「可写什么」收成 Ontology 上的 Action；LLM **只能提议这些 Action**；读写落在同一套对象语义和权限里。

若去掉 Agent、只留人工「提议 Action → 批准」，外表会像传统审批；**对 AI 的统一写网关与机读能力目录**才是差异点。

---

## 四、点击「运行 Agent」打了哪些接口？

前端会连续调用：

1. **`POST /agent/run`**  
   真正跑 Agent：读对象、提议 Action（写入 pending）。

2. **`GET /actions?status=pending`**  
   刷新右侧 HITL 列表。

批准写回是另一次操作：

- **`POST /actions/{id}/approve`**

不是「运行 Agent」本身自动改库。

---

## 五、「读对象、提议 Action、pending」分别是什么？

### 读哪个对象？

以「将工单 t_100 标记为已解决」为例（heuristic）：

1. 读 Ontology schema（有哪些 Object / Action）
2. 读业务对象 **`Ticket` / `t_100`**
3. `submit_action(update_ticket_status, …)`

受 Casbin 约束：例如 alice 只能看到 `c_001` 相关对象。  
Demo 里 ObjectType 目前主要是 `Ticket`、`Customer`。

### 提议是临时的吗？

**不是纯内存临时变量**，而是落库的 Action 记录（表 `ontology_actions`）：

- 状态先为 `pending`
- 有稳定 `id`（UUID）
- 批准后才改业务 Object；拒绝则对象不变

「临时」指的是 **还没写业务对象**，不是请求结束就丢。

### 入职入库 / 离职出库可以吗？

可以，同一套模式。工单只是 demo，换成人事即：

```text
ObjectType: Employee
ActionType: onboard_employee   → 入库
ActionType: offboard_employee  → 出库
```

闭环不变：读对象 → 提议 Action（pending）→ 人批 → 写回。  
前提：先在本体登记 ActionType、定好参数与权限，并实现 approve 后的执行器。

---

## 六、和「以前一个功能写一个 API」的差别

不完全是「以前给人，现在给 Agent」。

### 以前

```text
POST /tickets/{id}/resolve
POST /employees/onboard
…
```

每个接口各自校验、权限、写库；前端 / 脚本 / Agent 各自对接不同 URL。

### 现在

```text
Ontology 登记 Object / Action
统一写入口：POST /actions（或工具 submit_action）
能力目录：GET /ontology/agent-context
```

| | 散装 API | Ontology / Action |
|--|--|--|
| 能力发现 | 靠文档 / Prompt | `agent-context` 机读 |
| 写入口 | 每功能一个 endpoint | 统一 Action 网关 |
| 服务对象 | 人、Agent 常两套 | 人与 Agent 共用语义 |

**本质**：给业务能力建「机读目录 + 统一写网关」，而不是简单把 API 的调用方从人换成 Agent。

---

## 七、传统 API 仍适用的场景（Ontology / Action 不是银弹）

Ontology + Action 适合「业务语义强、要给 Agent 安全动手、要统一审计/审批」的路径。  
它**不能、也不该**取代所有接口。下面这些场景，继续用（或优先用）普通 API 更合适：

### 更适合散装 / 专用 API 的情况

| 场景 | 原因 |
|------|------|
| 高 QPS、低延迟读写 | 列表分页、搜索、实时推送；走 Action + HITL 过重 |
| 简单 CRUD / 管理后台 | 字段编辑、配置页；人为主、无 Agent 参与时，直接 API 更清晰 |
| 文件上传、流式、WebSocket | 传输形态特殊，不适合塞进 Action payload |
| 登录、OAuth、Webhook 回调 | 协议型接口，不是「业务对象动作」 |
| 批量 ETL / 数仓管道 | Airbyte、dbt、作业调度；属于数据层，不是 Agent 写回 |
| 跨系统集成（对方只认固定 REST） | 对外契约已定；可对内再接到 Action execute |
| 健康检查、指标、内部运维 | `/health`、metrics；与业务 Ontology 无关 |

### 更适合 Ontology / Action 的情况

| 场景 | 原因 |
|------|------|
| Agent 要读懂业务并提议变更 | 需要机读的 Object / Action 目录 |
| 写操作风险高、要人审 | 入职、调岗、关停资源、改关键状态等 |
| 多端（人 + Agent + 将来其它客户端）共用写语义 | 避免每人一套写接口 |
| 要按对象做细粒度授权 | Casbin 挂在 Object / Action 上更自然 |

### 共存方式（推荐心智）

```text
对外 / 专用 API          Ontology 读 + Action 写
（集成、CRUD、上传…）  →  （Agent、高风险业务变更）
         ↘                    ↙
           同一套 domain service
```

- **不是**「所有功能都登记成 Action」
- **而是**「Agent 能动的手、以及要统一治理的写，走 Action；其余该 API 还 API」
- Action 的 `execute` 往往 **调用** 已有业务服务，而不是把业务逻辑重写一遍

若强行把分页查询、文件上传也做成 Action，只会增加延迟和复杂度，收益很小——**银弹不存在，边界比口号重要**。

---

## 八、`/ontology/agent-context` 是什么？

**不是文件，是 HTTP 接口。**

- 地址：`GET http://127.0.0.1:8000/ontology/agent-context`
- 路由：`src/infini_ontology/api.py` → `get_agent_context`
- 数据：`registry.agent_context()`（`ontology/registry.py`）
- 作用：把已注册的 Object / Link / Action（并按 Casbin 过滤可 submit 的 Action）收成 JSON，供 Agent 规划

```bash
curl -s -H 'X-User-Id: alice' http://127.0.0.1:8000/ontology/agent-context | jq .
```

也可在 http://127.0.0.1:8000/docs 中调试。

---

## 九、「读写面收束到 Ontology/Action」怎么实现？

不是靠 Agent 自觉，而是多层硬约束：

```text
Agent（LLM / heuristic）
   │ 只能调白名单工具
   ▼
get_ontology_schema / list_objects / get_object / follow_link / submit_action
   │
   ▼
Registry 校验 + ObjectStore + ActionService + Casbin
   │
   ▼
真正改库只在 Action approve → execute
```

1. **工具白名单**（`agent/tools.py`）  
   无 SQL、无任意 PATCH；LLM 只能 `bind_tools` 上述工具。

2. **读路径**  
   必须是已注册 ObjectType；实例再过 Casbin 过滤。

3. **写路径**  
   只能 `submit_action` → `registry.get_action`（未登记即失败）→ 参数校验 → Casbin submit → 通常只写 pending；改库要 approve。

4. **Prompt**（软约束）  
   强调写必须走 `submit_action`；硬约束仍是工具层 + 服务层。

---

## 十、还要不要写业务接口给 Ontology 用？

**要有业务逻辑，但不一定再给人/Agent 各暴露一套 REST。**

```text
业务逻辑（建员工、关账号、改状态…）
        ↑
Ontology / Action（登记 + 校验 + 权限 + HITL）
        ↑
Agent / 前端（读 Object + submit_action）
```

- Ontology：契约与入口
- 业务实现：Action `execute` 时调用的 domain service / 内部 API

当前 demo 的业务写在 `ActionService._dispatch` 内；生产中更常见是 execute 转调已有服务。

| 要准备 | 不必重复 |
|--------|----------|
| ObjectType / ActionType 登记 | 给 Agent 一人一个平行业务 URL |
| Action 参数、权限、HITL | Agent 直连旧 CRUD |
| execute 里的真实业务逻辑 | 两套完全不同的写路径 |

新功能推荐顺序：**登记 Action → 实现 executor →（按需）HITL**，而不是先给 Agent 再开平行 API。

---

## 十一、本地怎么跑

```bash
# API
uv sync
uv run uvicorn infini_ontology.main:app --reload --app-dir src

# UI（默认 3010，避免占 3000）
cd frontend && npm install && npm run dev
```

- API 文档：http://127.0.0.1:8000/docs
- 控制台：http://localhost:3010

演示用户（`X-User-Id`）：

| 用户 | 能力 |
|------|------|
| alice | 仅 Acme（c_001）相关对象；可提议 Action；不能批准 |
| bob | 仅 Beta（c_002）；只读 |
| carol | 可 approve / reject |
| admin | 全权限 |

---

## 十二、一句话收束

Infini 这套东西的关键，不是「多一个审批按钮」或「API 改给 Agent 用」，也不是取代所有接口，而是：

**用 Ontology 定义业务对象与可执行动作；对 Agent 和高风险写，用统一 Action 网关 + 权限 + HITL 收束；其余高流量 CRUD、协议型、管道型接口继续用普通 API，两者共用底层业务服务。**
