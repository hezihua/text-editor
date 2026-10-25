---
title: 柱状图中最大的矩形
description: 单调递增栈，弹出时算宽度
date: 2026-09-03
number: 84
difficulty: hard
tags: [栈, 单调栈, 数组]
---

## 题意

给定 `n` 个非负整数，表示柱状图中各个柱子的高度，每个柱子宽度为 1。求能够勾勒出的矩形的最大面积。

## 思路

使用单调递增栈（存下标）：

- 当遇到比栈顶矮的柱子时，弹出栈顶并计算以它为高的最大矩形
- 宽度 = 当前下标 − 新栈顶下标 − 1
- 末尾加高度为 0 的哨兵，强制弹出所有剩余柱子

## 代码

```go
func largestRectangleArea(heights []int) int {
    n := len(heights)
    stack := []int{}
    maxArea := 0

    for i := 0; i <= n; i++ {
        h := 0
        if i < n {
            h = heights[i]
        }
        for len(stack) > 0 && h < heights[stack[len(stack)-1]] {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]
            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }
            if area := height * width; area > maxArea {
                maxArea = area
            }
        }
        stack = append(stack, i)
    }
    return maxArea
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |
