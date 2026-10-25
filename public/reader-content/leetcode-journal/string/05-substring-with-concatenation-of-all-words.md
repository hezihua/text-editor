---
title: 串联所有单词的子串
description: 按单词长度对齐，滑动窗口 + 计数
date: 2026-09-05
number: 30
difficulty: hard
tags: [字符串, 滑动窗口, 哈希表]
---

## 题意

给定字符串 `s` 和字符串数组 `words`（所有单词长度相同），找出 `s` 中所有由 `words` 中单词任意排列串联而成的子串的起始下标。

## 思路

所有单词等长，设为 `wordLen`。合法起点只有 `0, 1, …, wordLen-1` 这 `wordLen` 种对齐方式，每种单独滑。

维护窗口内各单词出现次数 `seen`，和 `wordMap` 对比：

- 切出一个合法单词就纳入窗口
- 某词超出配额，从左缩窗口直到合法
- 窗口内单词总数等于 `words` 个数时，记录起点并继续缩一格

遇到不在 `wordMap` 里的片段，整窗重置。

## 代码

```go
func findSubstring(s string, words []string) []int {
    if len(s) == 0 || len(words) == 0 {
        return []int{}
    }

    wordLen := len(words[0])
    wordCount := len(words)
    totalLen := wordLen * wordCount
    n := len(s)

    if n < totalLen {
        return []int{}
    }

    wordMap := make(map[string]int)
    for _, w := range words {
        wordMap[w]++
    }

    var result []int

    for i := 0; i < wordLen; i++ {
        left := i
        count := 0
        seen := make(map[string]int)

        for j := i; j+wordLen <= n; j += wordLen {
            word := s[j : j+wordLen]

            if _, ok := wordMap[word]; ok {
                seen[word]++
                count++

                for seen[word] > wordMap[word] {
                    leftWord := s[left : left+wordLen]
                    seen[leftWord]--
                    count--
                    left += wordLen
                }

                if count == wordCount {
                    result = append(result, left)
                    leftWord := s[left : left+wordLen]
                    seen[leftWord]--
                    count--
                    left += wordLen
                }
            } else {
                seen = make(map[string]int)
                count = 0
                left = j + wordLen
            }
        }
    }

    return result
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n \times m)$，$n$ 为 `s` 长度，$m$ 为单词长度 |
| 空间 | $O(k)$，$k$ 为不同单词数 |

## 复盘

- 固定单词长度才能按 `wordLen` 步长切，不能逐字符滑
- 和 [滑动窗口](/topics/patterns/sliding-window) 的计数版一脉相承，只是窗口边界按单词对齐
