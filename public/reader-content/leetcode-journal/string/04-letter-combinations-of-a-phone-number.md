---
title: 电话号码的字母组合
description: 回溯按位枚举键盘字母
date: 2026-09-05
number: 17
difficulty: medium
tags: [字符串, 回溯]
---

## 题意

给定仅包含数字 2-9 的字符串，返回它能表示的所有字母组合（电话键盘映射）。

## 思路

每一位数字对应若干字母，用回溯逐位选择：选 → 递归下一位 → 撤销。路径长度等于 `digits` 长度时收集答案。

## 代码

```go
func letterCombinations(digits string) []string {
    if len(digits) == 0 {
        return []string{}
    }

    phone := map[byte]string{
        '2': "abc",
        '3': "def",
        '4': "ghi",
        '5': "jkl",
        '6': "mno",
        '7': "pqrs",
        '8': "tuv",
        '9': "wxyz",
    }

    var result []string
    var path []byte

    var backtrack func(index int)
    backtrack = func(index int) {
        if index == len(digits) {
            result = append(result, string(path))
            return
        }
        letters := phone[digits[index]]
        for i := 0; i < len(letters); i++ {
            path = append(path, letters[i])
            backtrack(index + 1)
            path = path[:len(path)-1]
        }
    }

    backtrack(0)
    return result
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(4^n)$，$n$ 为 `digits` 长度（最坏每位 4 个字母） |
| 空间 | $O(n)$（递归深度） |

## 复盘

- 标准回溯模板，见 [DFS 与回溯](/topics/patterns/dfs-backtrack)
- 空字符串直接返回空切片
