---
title: 有效的括号
description: 栈匹配，右括号查对应左括号
date: 2026-09-03
number: 20
difficulty: easy
tags: [栈, 字符串]
---

## 题意

给定一个只包含 `'('`、`')'`、`'{'`、`'}'`、`'['`、`']'` 的字符串 `s`，判断字符串是否有效。

有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合
2. 左括号必须以正确的顺序闭合
3. 每个右括号都有一个对应的相同类型的左括号

## 思路

使用栈：

- 遇到左括号 → 入栈
- 遇到右括号 → 检查栈顶是否是对应的左括号，是则弹出，否则无效
- 遍历结束后栈必须为空

## 代码

```go
func isValid(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', '}': '{', ']': '['}

    for _, char := range s {
        if left, ok := pairs[char]; ok {
            if len(stack) == 0 || stack[len(stack)-1] != left {
                return false
            }
            stack = stack[:len(stack)-1]
        } else {
            stack = append(stack, char)
        }
    }
    return len(stack) == 0
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |
