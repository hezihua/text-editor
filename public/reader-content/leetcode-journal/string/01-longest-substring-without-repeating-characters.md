---
title: 无重复字符的最长子串
description: 滑动窗口 + 哈希记字符最后出现位置
date: 2026-09-05
number: 3
difficulty: medium
tags: [字符串, 滑动窗口, 哈希表]
---

## 题意

给定字符串 `s`，找出其中不含重复字符的最长子串的长度。

## 思路

滑动窗口维护当前无重复子串 `[left, right]`。用哈希表记录每个字符**最后出现的位置**。

右指针扩展时，若字符已在窗口内出现过，把 `left` 跳到该字符上次位置的下一个。

## 代码

```go
func lengthOfLongestSubstring(s string) int {
    n := len(s)
    if n == 0 {
        return 0
    }

    lastIndex := make(map[byte]int)
    maxLen := 0
    left := 0

    for right := 0; right < n; right++ {
        ch := s[right]
        if idx, ok := lastIndex[ch]; ok && idx >= left {
            left = idx + 1
        }
        lastIndex[ch] = right
        if right-left+1 > maxLen {
            maxLen = right - left + 1
        }
    }
    return maxLen
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(\min(n, \|\Sigma\|))$，$\Sigma$ 为字符集 |

## 复盘

- 经典滑动窗口，见 [滑动窗口](/topics/patterns/sliding-window)
- 用 `lastIndex` 比维护窗口内计数更直接
