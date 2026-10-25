---
title: 最小稳定下标 II
description: 前缀 max 减后缀 min，线性找第一个 ≤ k
date: 2026-09-05
number: 3904
difficulty: medium
tags: [数组, 前缀和]
---

## 题意

给定长度为 `n` 的整数数组 `nums` 和整数 `k`。

对每个下标 `i`，定义不稳定值 = `max(nums[0..i]) - min(nums[i..n-1])`。

返回最小的稳定下标（不稳定值 ≤ `k`），若不存在则返回 `-1`。

## 思路

对每个 `i`，左边最大值和后缀最小值可以预处理：

- `prefixMax[i]` = `max(nums[0..i])`
- `suffixMin[i]` = `min(nums[i..n-1])`

然后从左到右扫，第一个满足 `prefixMax[i] - suffixMin[i] <= k` 的下标就是答案。

## 代码

```go
func firstStableIndex(nums []int, k int) int {
    n := len(nums)
    if n == 0 {
        return -1
    }

    prefixMax := make([]int, n)
    suffixMin := make([]int, n)

    prefixMax[0] = nums[0]
    for i := 1; i < n; i++ {
        if nums[i] > prefixMax[i-1] {
            prefixMax[i] = nums[i]
        } else {
            prefixMax[i] = prefixMax[i-1]
        }
    }

    suffixMin[n-1] = nums[n-1]
    for i := n - 2; i >= 0; i-- {
        if nums[i] < suffixMin[i+1] {
            suffixMin[i] = nums[i]
        } else {
            suffixMin[i] = suffixMin[i+1]
        }
    }

    for i := 0; i < n; i++ {
        if prefixMax[i]-suffixMin[i] <= k {
            return i
        }
    }
    return -1
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |

## 复盘

- 和 [238 除自身乘积](/topics/array/product-of-array-except-self) 一样，都是「左一段 + 右一段」拆成两次线性扫描
- 求的是**第一个**满足的下标，预处理完后一遍扫即可
