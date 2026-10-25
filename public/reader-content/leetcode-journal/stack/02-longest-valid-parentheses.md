---
title: 最长有效括号
description: 栈存下标，-1 哨兵分段
date: 2026-09-03
number: 32
difficulty: hard
tags: [栈, 字符串, 动态规划]
---

## 题意

给定只包含 `'('` 和 `')'` 的字符串，找出最长有效（格式正确且连续）括号子串的长度。

## 思路

使用栈存储下标：

- 初始化栈放入 `-1` 作为哨兵
- 遇到 `'('` → 下标入栈
- 遇到 `')'` → 弹出栈顶
  - 栈空 → 当前 `')'` 作为新哨兵入栈
  - 栈不空 → 当前长度 = `i - 栈顶`，更新最大值

## 代码

```go
func longestValidParentheses(s string) int {
    maxLen := 0
    stack := []int{-1}

    for i, char := range s {
        if char == '(' {
            stack = append(stack, i)
        } else {
            stack = stack[:len(stack)-1]
            if len(stack) == 0 {
                stack = append(stack, i)
            } else {
                maxLen = max(maxLen, i-stack[len(stack)-1])
            }
        }
    }
    return maxLen
}

func max(a, b int) int {
    if a > b { return a }
    return b
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |
