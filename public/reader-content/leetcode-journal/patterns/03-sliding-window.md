---
title: 滑动窗口
description: 右端扩张、左端收缩，维护窗口内约束
date: 2026-08-31
tags: [常用算法, 滑动窗口]
---

## 什么时候用

在连续子数组 / 子串上求最长、最短、个数，约束是「窗口内某种计数合法」。右指针只往右，左指针不回头，总时间 $O(n)$。

典型信号：无重复最长子串、最小覆盖子串、和大于等于 $s$ 的最短子数组、窗口内异位词。

## 模板

```go
func slidingWindow(s string) int {
    cnt := make(map[byte]int)
    left, best := 0, 0
    for right := 0; right < len(s); right++ {
        cnt[s[right]]++          // 1. 右端纳入
        for !valid(cnt) {        // 2. 不合法就收缩左端
            cnt[s[left]]--
            left++
        }
        best = max(best, right-left+1) // 3. 用当前窗口更新答案
    }
    return best
}
```

两种更新时机：

- 求**最长**：先收缩到合法，再更新
- 求**最短**：纳入后一旦合法就更新，并尽量收缩

## 和为条件的窗口

全是正数时，窗口和随左右端单调，可以直接缩。有负数就失去单调，改前缀和 + 哈希，或其它结构。

```go
func minSubArrayLen(target int, nums []int) int {
    sum, left, ans := 0, 0, len(nums)+1
    for right, x := range nums {
        sum += x
        for sum >= target {
            ans = min(ans, right-left+1)
            sum -= nums[left]
            left++
        }
    }
    if ans == len(nums)+1 {
        return 0
    }
    return ans
}
```

## 计数窗口

用数组或哈希记窗口内频率。异位词、覆盖子串维护「还缺多少种字符」：纳入使某字符刚好达标则 `need--`，移出刚好失守则 `need++`。$need=0$ 表示覆盖成功。

## 和别的指针的差别

| | 滑动窗口 | 快慢指针 | 对撞指针 |
|--|----------|----------|----------|
| 方向 | 同向，维护区间 | 同向，不同速度 | 两端往中间 |
| 区间含义 | 当前候选子段 | 相对位置 | 两端元素的组合 |
| 前提 | 约束对窗口单调或可 $O(1)$ 维护 | 链表/原地写 | 有序 |

## 注意

- 左端收缩时记得改计数，否则窗口状态是错的
- 有负数、有「任意删一个」这类破坏单调的条件，窗口可能失效
- 更新答案放在收缩前还是后，决定求的是最长还是最短
