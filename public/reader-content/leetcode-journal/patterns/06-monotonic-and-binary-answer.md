---
title: 单调栈与二分答案
description: 下一个更大用栈；答案在值域上单调就二分 check
date: 2026-08-31
tags: [常用算法, 单调栈, 二分]
---

## 单调栈

栈里下标对应的值保持单调。扫到 $i$ 时，不断弹出不满足单调的栈顶，$i$ 就是那些下标的「下一个更大 / 更小」。每个元素进出各一次，$O(n)$。

```go
func nextGreater(nums []int) []int {
    n := len(nums)
    ans := make([]int, n)
    for i := range ans {
        ans[i] = -1
    }
    st := []int{} // 存下标，对应值单调减
    for i, x := range nums {
        for len(st) > 0 && nums[st[len(st)-1]] < x {
            ans[st[len(st)-1]] = x
            st = st[:len(st)-1]
        }
        st = append(st, i)
    }
    return ans
}
```

变体：上一个更大（从右往左，或入栈前先记栈顶）、矩形直方图（左右第一个更小）、接雨水（凹槽）。

单调**队列**用在滑动窗口最值：队头过期就弹，队尾不如新人就弹，队头即窗口最值。

## 二分答案

不是在下标上二分，而是在**可行答案的值域**上二分。前提：存在单调性——「$x$ 可行则更大 / 更小也可行」。

```go
func minimizeMax(n int, check func(int) bool) int {
    l, r := 0, n // 值域
    for l < r {
        mid := l + (r-l)/2
        if check(mid) {
            r = mid
        } else {
            l = mid + 1
        }
    }
    return l
}
```

`check(mid)`：假设答案是 $mid$，贪心或模拟一遍看行不行。吃香蕉、分割数组的最大和、最小运送天数，都是「猜一个上限，看能否在约束内完成」。

和普通二分的差别：数组不必有序，**check 相对 mid 单调**即可。见理论篇 [排序与二分](/topics/theory/sort-and-binary-search)。

## 怎么选

| 题感 | 用 |
|------|----|
| 下一个更大 / 更小 | 单调栈 |
| 窗口内最值 | 单调队列 |
| 最小化最大值、最大化最小值 | 二分答案 |
| 有序数组里找下标 | 普通二分 |

## 注意

- 栈里存下标还是存值：要算宽度必须留下标
- 相等时弹不弹，决定的是「严格下一个」还是「非严格」
- 二分答案的值域要覆盖所有可能，`check` 写反会收敛到错的一端
