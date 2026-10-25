---
title: 神经网络基础
date: "2024-02-10"
tags: [神经网络, 深度学习, 反向传播]
course: machine-learning
lecture: 5
---

## 神经网络的起源

**神经网络（Neural Network）** 受生物神经元的启发，由多个**感知机**组合而成。

### 生物神经元

一个生物神经元接收多个输入信号，进行处理后输出：

```
输入信号 → [加权求和 + 激活函数] → 输出
```

### 感知机（Perceptron）

感知机是神经网络的基本单元：

```
y = \varphi\left(\sum_{i=1}^{n} w_i x_i + b\right)
```

其中 $\varphi$ 是**激活函数**。

## 激活函数

激活函数给神经网络引入**非线性**，使其能够学习复杂的模式。

### 常见激活函数

**Sigmoid**：$\sigma(z) = \frac{1}{1+e^{-z}}$
- 输出范围 $[0, 1]$
- 适合二分类的输出层
- 缺点：梯度消失

**Tanh**：$\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}$
- 输出范围 $[-1, 1]$
- 零均值，便于优化

**ReLU**：$\text{ReLU}(z) = \max(0, z)$
- 计算简单，收敛快
- **最常用的隐藏层激活函数**
- 缺点：神经元可能"死亡"

**Leaky ReLU**：$\text{LeakyReLU}(z) = \max(\alpha z, z)$
- 解决了 ReLU 的"死亡"问题

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

def relu(z):
    return np.maximum(0, z)

def leaky_relu(z, alpha=0.01):
    return np.where(z > 0, z, alpha * z)
```

## 多层感知机

将多个感知机按层连接，就形成了**多层感知机（MLP）**：

```
输入层 → 隐藏层 1 → 隐藏层 2 → 输出层
```

### 网络结构

- **输入层**：数据输入
- **隐藏层**：特征提取和变换
- **输出层**：最终预测

每一层都是一个线性变换 + 激活函数：

```
\mathbf{a}^{l} = \varphi(\mathbf{W}^{l} \mathbf{a}^{l-1} + \mathbf{b}^{l})
```

## 前向传播

**前向传播（Forward Propagation）** 从输入到输出依次计算：

```python
def forward(self, X):
    # 第一层
    self.z1 = np.dot(X, self.W1) + self.b1
    self.a1 = relu(self.z1)

    # 第二层
    self.z2 = np.dot(self.a1, self.W2) + self.b2
    self.a2 = relu(self.z2)

    # 输出层
    self.z3 = np.dot(self.a2, self.W3) + self.b3
    self.a3 = sigmoid(self.z3)

    return self.a3
```

## 反向传播

**反向传播（Backpropagation）** 通过链式法则高效计算梯度。

### 计算图

反向传播的本质是沿计算图**逆向传播误差**：

```
输出层误差 → 第二层误差 → 第一层误差
```

### 梯度计算

以输出层为例：

```
\delta^{(L)} = \frac{\partial L}{\partial z^{(L)}} = \hat{y} - y
```

```
\frac{\partial L}{\partial W^{(l)}} = \delta^{(l)} \cdot \mathbf{a}^{(l-1)T}
```

```
\frac{\partial L}{\partial \mathbf{b}^{(l)}} = \sum \delta^{(l)}
```

### 完整的训练循环

```python
for epoch in range(epochs):
    # 前向传播
    y_pred = model.forward(X)

    # 计算损失
    loss = compute_loss(y_pred, y)

    # 反向传播
    model.backward(y)

    # 更新参数
    model.update(learning_rate)
```

## 优化技巧

### 1. 权重初始化

- 小的随机值初始化（如 Xavier / He 初始化）
- 避免所有权重相同

### 2. 学习率调度

- 固定学习率
- 学习率衰减
- 自适应优化器（Adam、RMSProp）

### 3. 正则化

- Dropout：随机丢弃部分神经元
- Early Stopping：监控验证集，提前停止
- Weight Decay：L2 正则化

### 4. 批量训练

- 使用 mini-batch 训练
- 打乱数据顺序
- 每个 epoch 重新洗牌

## 完整代码示例

```python
class NeuralNetwork:
    def __init__(self, layers, activation='relu'):
        self.layers = layers
        self.activation = activation
        self.weights = []
        self.biases = []

        for i in range(len(layers) - 1):
            self.weights.append(
                np.random.randn(layers[i], layers[i + 1]) * 0.01
            )
            self.biases.append(np.zeros((1, layers[i + 1])))

    def activate(self, z, derivative=False):
        if self.activation == 'relu':
            return z * (z > 0) if derivative else np.maximum(0, z)
        elif self.activation == 'sigmoid':
            s = 1 / (1 + np.exp(-np.clip(z, -500, 500)))
            return s * (1 - s) if derivative else s

    def forward(self, X):
        self.activations = [X]
        self.zs = []

        for i in range(len(self.weights)):
            z = np.dot(self.activations[-1], self.weights[i]) + self.biases[i]
            self.zs.append(z)
            self.activations.append(
                self.activate(z) if i < len(self.weights) - 1
                else z
            )

        return self.activations[-1]

    def backward(self, y):
        m = y.shape[0]
        dZ = self.activations[-1] - y

        for i in reversed(range(len(self.weights))):
            dW = np.dot(self.activations[i].T, dZ) / m
            db = np.sum(dZ, axis=0, keepdims=True) / m

            if i > 0:
                dA = np.dot(dZ, self.weights[i].T)
                dZ = dA * self.activate(self.zs[i-1], derivative=True)

            self.weights[i] -= self.lr * dW
            self.biases[i] -= self.lr * db
```

## 要点总结

- 神经网络 = 多层感知机 + 激活函数
- 前向传播计算输出，反向传播计算梯度
- 激活函数引入非线性
- 合理的初始化和正则化是成功的关键

---

下一节：[卷积神经网络](/ml/courses/machine-learning/cnn) →