---
title: 强化学习基础
date: "2024-03-01"
tags: [强化学习, MDP, Q-Learning]
course: reinforcement-learning
lecture: 1
---

## 什么是强化学习

**强化学习（Reinforcement Learning, RL）** 是研究智能体（Agent）如何通过与环境（Environment）交互来学习**最优策略**的学科。

### 核心思想

Agent 通过**试错**来学习：
- 执行动作 → 获得**奖励**（正或负）
- 目标是**最大化长期累积奖励**

> 类比：训练宠物——做对了给食物（正奖励），做错了不理它（负奖励）

### 强化学习 vs 其他学习范式

| 范式 | 反馈类型 | 数据来源 |
|------|----------|----------|
| 监督学习 | 正确答案 | 标注数据 |
| 无监督学习 | 无反馈 | 无标注数据 |
| **强化学习** | **延迟奖励** | **交互经验** |

## MDP：马尔可夫决策过程

强化学习的数学框架是**马尔可夫决策过程（MDP）**。

### MDP 的五要素

一个 MDP 由 $(S, A, P, R, \gamma)$ 定义：

| 符号 | 含义 | 说明 |
|------|------|------|
| $S$ | 状态空间 | Agent 可能处于的所有状态 |
| $A$ | 动作空间 | Agent 可以执行的所有动作 |
| $P$ | 状态转移概率 | $P(s'|s,a)$：在 $s$ 状态执行 $a$ 转移到 $s'$ 的概率 |
| $R$ | 奖励函数 | $R(s,a)$：执行动作 $a$ 获得的奖励 |
| $\gamma$ | 折扣因子 | 衡量远见程度，通常 $0.9$ 或 $0.99$ |

### 马尔可夫性质

```
P(s_{t+1}|s_t, a_t, s_{t-1}, a_{t-1}, \ldots) = P(s_{t+1}|s_t, a_t)
```

**当前状态包含了所有必要信息**，未来只依赖当前，与过去无关。

## 价值函数

### 状态价值函数 $V^\pi(s)$

在策略 $\pi$ 下，状态 $s$ 的期望回报：

```
V^\pi(s) = \mathbb{E}_\pi\left[\sum_{t=0}^{\infty} \gamma^t r_{t+1} | s_0 = s\right]
```

### 动作价值函数 $Q^\pi(s, a)$

在状态 $s$ 执行动作 $a$，之后遵循策略 $\pi$ 的期望回报：

```
Q^\pi(s, a) = \mathbb{E}_\pi\left[\sum_{t=0}^{\infty} \gamma^t r_{t+1} | s_0 = s, a_0 = a\right]
```

### 贝尔曼方程

价值函数满足**递推关系**：

```
V^\pi(s) = R(s, \pi(s)) + \gamma \sum_{s'} P(s'|s, \pi(s)) V^\pi(s')
```

## 最优策略

### 最优价值函数

```
V^*(s) = \max_\pi V^\pi(s)
```

### 贝尔曼最优性方程

```
V^*(s) = \max_a \left[R(s,a) + \gamma \sum_{s'} P(s'|s,a) V^*(s')\right]
```

### 最优策略

```
\pi^*(s) = \arg\max_a Q^*(s, a)
```

## Q-Learning 算法

**Q-Learning** 是最经典的无模型强化学习算法。

### 核心思想

用 Q 表存储每个状态-动作对的价值，通过**时序差分（TD）**不断更新。

### 更新公式

```
Q(s, a) \leftarrow Q(s, a) + \alpha \left[r + \gamma \max_{a'} Q(s', a') - Q(s, a)\right]
```

其中：
- $\alpha$ 是学习率
- $r + \gamma \max_{a'} Q(s', a')$ 是 TD 目标
- $r + \gamma \max_{a'} Q(s', a') - Q(s, a)$ 是 TD 误差

### 完整算法

```python
import numpy as np

class QLearning:
    def __init__(self, states, actions, lr=0.1, gamma=0.99,
                 epsilon=1.0, epsilon_decay=0.995):
        self.q_table = np.zeros((states, actions))
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay

    def choose_action(self, state):
        if np.random.random() < self.epsilon:
            return np.random.randint(len(self.q_table[state]))
        return np.argmax(self.q_table[state])

    def update(self, state, action, reward, next_state, done):
        td_target = reward
        if not done:
            td_target += self.gamma * np.max(self.q_table[next_state])

        td_error = td_target - self.q_table[state, action]
        self.q_table[state, action] += self.lr * td_error

    def decay_epsilon(self):
        self.epsilon *= self.epsilon_decay
```

### $\epsilon$-greedy 策略

- 以 $\epsilon$ 概率随机探索
- 以 $1-\epsilon$ 概率选择最优动作
- 训练过程中 $\epsilon$ 逐渐减小

## 实战示例：Frozen Lake

```python
import gymnasium as gym

env = gym.make("FrozenLake-v1", is_slippery=False)
agent = QLearning(states=16, actions=4)

for episode in range(1000):
    state, _ = env.reset()
    total_reward = 0

    while True:
        action = agent.choose_action(state)
        next_state, reward, done, _, _ = env.step(action)
        agent.update(state, action, reward, next_state, done)
        state = next_state
        total_reward += reward

        if done:
            agent.decay_epsilon()
            break

    if episode % 100 == 0:
        print(f"Episode {episode}: epsilon={agent.epsilon:.3f}")
```

## 要点总结

- 强化学习 = Agent + Environment + Reward + Policy
- MDP 是强化学习的数学框架
- Q-Learning 通过 TD 更新学习最优 Q 值
- $\epsilon$-greedy 平衡探索和利用

---

下一节：[深度强化学习](/ml/courses/reinforcement-learning/deep-rl) →