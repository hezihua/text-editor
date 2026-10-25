---
title: 接雨水
description: 双指针维护左右最大值
date: 2026-09-03
number: 42
difficulty: hard
tags: [数组, 双指针]
---

## 题意

给定 `n` 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

## 思路

双指针向中间移动：

- 维护 `leftMax` 和 `rightMax`
- 哪边更矮，就以哪边为瓶颈计算当前能接的水
- 当前高度小于对应方向最大值时，差值累加到结果

## 代码

```go
func trap(height []int) int {
    n := len(height)
    if n == 0 { return 0 }

    left, right := 0, n-1
    leftMax, rightMax := 0, 0
    water := 0

    for left < right {
        if height[left] < height[right] {
            if height[left] >= leftMax {
                leftMax = height[left]
            } else {
                water += leftMax - height[left]
            }
            left++
        } else {
            if height[right] >= rightMax {
                rightMax = height[right]
            } else {
                water += rightMax - height[right]
            }
            right--
        }
    }
    return water
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
