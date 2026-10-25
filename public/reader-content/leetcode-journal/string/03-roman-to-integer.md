---
title: 罗马数字转整数
description: 左到右扫，小遇大则减否则加
date: 2026-09-05
number: 13
difficulty: easy
tags: [字符串, 模拟]
---

## 题意

将罗马数字字符串转换为整数。

## 思路

从左到右遍历。若当前字符的值小于下一个字符的值（如 `I` 在 `V` 前），说明是减法组合，减去当前值；否则加上当前值。

## 代码

```go
func romanToInt(s string) int {
    values := map[byte]int{
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000,
    }

    total := 0
    n := len(s)
    for i := 0; i < n; i++ {
        if i+1 < n && values[s[i]] < values[s[i+1]] {
            total -= values[s[i]]
        } else {
            total += values[s[i]]
        }
    }
    return total
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |

## 复盘

- 和 [12 整数转罗马](/topics/string/integer-to-roman) 对照
- 只需记住「当前 < 下一个就减」
