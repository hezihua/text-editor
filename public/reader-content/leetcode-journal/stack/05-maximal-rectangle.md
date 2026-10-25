---
title: 最大矩形
description: 逐行累加高度，复用柱状图最大矩形
date: 2026-09-03
number: 85
difficulty: hard
tags: [栈, 单调栈, 矩阵, 动态规划]
---

## 题意

给定一个仅包含 `0` 和 `1` 的二维二进制矩阵，找出只包含 `1` 的最大矩形，并返回其面积。

## 思路

- 把每一行看作柱状图的底部
- 维护 `height` 数组：表示每列向上连续 `1` 的个数
- 每处理完一行，就对当前 `height` 调用「柱状图最大矩形」算法
- 本质是 [84 题](/topics/stack/largest-rectangle-in-histogram) 的二维扩展

## 代码

```go
func maximalRectangle(matrix [][]byte) int {
    if len(matrix) == 0 || len(matrix[0]) == 0 {
        return 0
    }
    rows, cols := len(matrix), len(matrix[0])
    height := make([]int, cols)
    maxArea := 0

    for i := 0; i < rows; i++ {
        for j := 0; j < cols; j++ {
            if matrix[i][j] == '1' {
                height[j]++
            } else {
                height[j] = 0
            }
        }
        maxArea = max(maxArea, largestRectangleArea(height))
    }
    return maxArea
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(rows \times cols)$ |
| 空间 | $O(cols)$ |
