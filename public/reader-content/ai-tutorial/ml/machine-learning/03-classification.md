---
title: 分类问题
date: "2024-01-25"
tags: [机器学习, 分类, 逻辑回归, 生成模型]
course: machine-learning
lecture: 3
---

## 分类问题概述

**分类（Classification）** 是监督学习的另一大任务——预测**离散的类别标签**。

### 分类 vs 回归

| | 分类 | 回归 |
|---|---|---|
| 输出类型 | 离散类别 | 连续数值 |
| 例子 | 垃圾邮件 / 正常邮件 | 预测房价 |
| 模型 | 逻辑回归、SVM、决策树 | 线性回归、多项式回归 |

### 分类的类型

- **二分类**（Binary Classification）：只有两个类别（是/否）
- **多分类**（Multi-class Classification）：多个类别（猫/狗/鸟）
- **多标签分类**（Multi-label Classification）：一个样本可以属于多个类别

## 逻辑回归

**逻辑回归（Logistic Regression）** 虽然名字有"回归"，但它是一个**分类**算法。

### Sigmoid 函数

逻辑回归使用 **Sigmoid 函数**将线性输出映射到 $[0, 1]$ 区间，表示概率：

```
\sigma(z) = \frac{1}{1 + e^{-z}}
```

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))
```

### 模型形式

```
P(y=1|\mathbf{x}) = \sigma(\mathbf{w}^T \mathbf{x} + b)
```

- 当概率 > 0.5 时，预测为类别 1
- 当概率 ≤ 0.5 时，预测为类别 0

### 损失函数：交叉熵

逻辑回归使用**交叉熵损失**（Cross Entropy Loss）：

```
L = -\frac{1}{n} \sum_{i=1}^{n} [y_i \log(\hat{y}_i) + (1-y_i) \log(1-\hat{y}_i)]
```

为什么不用 MSE？因为交叉熵的**梯度更稳定**，优化效果更好。

## 概率生成模型

与逻辑回归（判别模型）不同，**生成模型**从另一个角度进行分类。

### 判别模型 vs 生成模型

| | 判别模型 | 生成模型 |
|---|---|---|
| 学习目标 | $P(y|\mathbf{x})$ | $P(\mathbf{x}|y) P(y)$ |
| 代表方法 | 逻辑回归、SVM | 朴素贝叶斯、GDA |
| 优点 | 准确率通常更高 | 训练速度快、可生成新样本 |
| 缺点 | 不能生成样本 | 准确率稍低 |

### 高斯判别分析（GDA）

GDA 假设每个类别下特征服从**多元高斯分布**：

```
P(\mathbf{x}|y) = \frac{1}{2\pi|\Sigma|^{1/2}} e^{-\frac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{x}-\boldsymbol{\mu})}
```

参数估计：
- $\boldsymbol{\mu}_y$：类别 $y$ 的均值向量
- $\Sigma$：协方差矩阵
- $\phi_y = P(y)$：先验概率

### 朴素贝叶斯分类器

"朴素"地假设特征之间**条件独立**：

```
P(\mathbf{x}|y) = \prod_{i=1}^{d} P(x_i|y)
```

虽然这个假设几乎不可能完全成立，但朴素贝叶斯在很多任务上表现得出奇地好！

## 多分类

### One-vs-Rest（一对多）

将 $K$ 分类问题转化为 $K$ 个二分类问题：

- 第 $i$ 个分类器：判断样本是或不是类别 $i$
- 选择置信度最高的类别

### Softmax 回归

逻辑回归的多分类推广，使用 **Softmax 函数**：

```
P(y=i|\mathbf{x}) = \frac{e^{\mathbf{w}_i^T \mathbf{x}}}{\sum_{j} e^{\mathbf{w}_j^T \mathbf{x}}}
```

这是**神经网络中最常用的多分类方法**。

## 代码实现

```python
class LogisticRegression:
    def __init__(self, lr=0.01, n_iter=1000):
        self.lr = lr
        self.n_iter = n_iter

    def sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0

        for _ in range(self.n_iter):
            linear_model = np.dot(X, self.weights) + self.bias
            y_pred = self.sigmoid(linear_model)

            dw = (1 / n_samples) * np.dot(X.T, (y_pred - y))
            db = (1 / n_samples) * np.sum(y_pred - y)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

    def predict(self, X):
        linear_model = np.dot(X, self.weights) + self.bias
        y_pred = self.sigmoid(linear_model)
        return (y_pred > 0.5).astype(int)
```

## 要点总结

- 逻辑回归用 Sigmoid 函数输出概率
- 交叉熵是分类任务的标准损失函数
- 生成模型和判别模型各有优势
- 多分类可以通过 One-vs-Rest 或 Softmax 实现

---

下一节：[支持向量机](/ml/courses/machine-learning/svm) →