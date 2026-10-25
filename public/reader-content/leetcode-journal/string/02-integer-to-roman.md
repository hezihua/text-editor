---
title: 整数转罗马数字
description: 贪心枚举 13 个面值，能减就减
date: 2026-09-05
number: 12
difficulty: medium
tags: [字符串, 贪心]
---

## 题意

将整数转换为罗马数字（支持 1~3999）。

## 思路

罗马数字不是任意组合，题目给了 13 种合法面值（含 900、400 等减法形式）。从大到小贪心：当前面值能减就减，并拼接对应符号。

## 代码

```go
func intToRoman(num int) string {
    values := []int{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
    symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}

    var result []byte
    for i := 0; i < len(values); i++ {
        for num >= values[i] {
            num -= values[i]
            result = append(result, symbols[i]...)
        }
    }
    return string(result)
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(1)$（固定 13 个面值） |
| 空间 | $O(1)$ |

## 复盘

- 和 [13 罗马转整数](/topics/string/roman-to-integer) 成对记忆
- 面值表把 IV、IX 等特殊形式写死，避免现场推导
