---
title: 线性回归
date: "2024-01-20"
tags: [机器学习, 线性回归, 梯度下降]
course: machine-learning
lecture: 2
---

## 线性回归模型

**线性回归（Linear Regression）** 是最基础的机器学习算法之一，用于解决**回归问题**——预测连续数值。

### 模型定义

假设我们有 $n$ 个特征，线性回归模型的形式为：

```
y = w_1 x_1 + w_2 x_2 + \cdots + w_n x_n + b
```

用向量表示更简洁：

```
y = \mathbf{w}^T \mathbf{x} + b
```

其中：
- $\mathbf{w}$ 是**权重向量**（模型要学习的参数）
- $b$ 是**偏置项**
- $\mathbf{x}$ 是输入特征向量
- $y$ 是预测值

### 矩阵形式

```
y = \mathbf{W}^T \mathbf{X}
```

其中 $\mathbf{X}$ 包含了偏置列（全为 1）。

## 损失函数

损失函数衡量模型预测值与真实值之间的**差距**。

### 均方误差（MSE）

最常用的损失函数是**均方误差（Mean Squared Error）**：

```
L = \frac{1}{n} \sum_{i=1}^{n} (\hat{y}_i - y_i)^2
```

其中：
- $\hat{y}_i$ 是第 $i$ 个样本的预测值
- $y_i$ 是真实值
- $n$ 是样本数量

### 为什么用平方？

- 平方使误差始终为正，避免正负抵消
- 平方加大了大误差的惩罚力度，促使模型更关注预测差的样本
- 平方函数在数学上便于求导

## 梯度下降

我们的目标是**找到使损失最小的 $\mathbf{w}$**。梯度下降是最常用的优化算法。

### 梯度的含义

梯度指向**函数增长最快**的方向。那么沿着梯度的**反方向**走，就能让损失减小。

```
\mathbf{w}^{t+1} = \mathbf{w}^t - \eta \nabla L(\mathbf{w}^t)
```

其中 $\eta$ 是**学习率**（learning rate），控制每步走多远。

### 学习率的选择

学习率太大或太小都会有问题：

| 学习率 | 问题 |
|--------|------|
| 太大 | 可能跳过最优点，来回震荡甚至发散 |
| 太小 | 收敛太慢，训练时间过长 |

### 三种梯度下降变体

**1. 批量梯度下降（Batch GD）**
- 每次更新使用**全部**训练数据
- 优点：稳定
- 缺点：数据量大时速度慢

**2. 随机梯度下降（SGD）**
- 每次更新使用**一个**样本
- 优点：速度快
- 缺点：震荡大，不稳定

**3. 小批量梯度下降（Mini-batch GD）**
- 每次更新使用**一小批**样本（通常 32、64、128）
- **实际工程中最常用**的方案

## 过拟合与欠拟合

### 欠拟合（Underfitting）

模型**太简单**，连训练数据都学不好：

- 高偏差（High Bias）
- 解决方法：增加模型复杂度、加入更多特征

### 过拟合（Overfitting）

模型**太复杂**，在训练数据上学得太好，导致泛化能力差：

- 高方差（High Variance）
- 解决方法：正则化、增加数据、早停

### 正则化

在损失函数中加入**惩罚项**：

```
L_{reg} = L + \lambda ||\mathbf{w}||^2
```

这称为 **L2 正则化**（Ridge Regression），它会使权重趋向于更小的值。

还有 **L1 正则化**（Lasso）：

```
L_{reg} = L + \lambda ||\mathbf{w}||_1
```

L1 正则化不仅惩罚大权重，还倾向于将不重要的特征权重压缩到 0，相当于**特征选择**。

## 代码实现

```python
import numpy as np

class LinearRegression:
    def __init__(self, lr=0.01, n_iter=1000):
        self.lr = lr
        self.n_iter = n_iter
        self.weights = None
        self.bias = None

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0

        for _ in range(self.n_iter):
            y_pred = np.dot(X, self.weights) + self.bias
            error = y_pred - y

            dw = (2 / n_samples) * np.dot(X.T, error)
            db = (2 / n_samples) * np.sum(error)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

    def predict(self, X):
        return np.dot(X, self.weights) + self.bias
```

## 要点总结

- 线性回归是**最基础**的模型，但非常重要
- 损失函数衡量预测值与真实值的差距
- 梯度下降是优化的核心方法
- 注意平衡过拟合和欠拟合
- 正则化是防止过拟合的有效手段

---

下一节：[分类问题](/ml/courses/machine-learning/classification) →