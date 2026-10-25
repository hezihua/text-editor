---
title: 最大子数组和
description: Kadane：要么接上，要么重开
date: 2026-08-30
number: 53
difficulty: medium
tags: [动态规划, 数组]
---

## 题意

给整数数组 `nums`，找一个连续子数组，使其和最大，返回这个和。

## 思路

设 $f(i)$ 为「以 $i$ 结尾的最大子数组和」：

$$
f(i) = \max(nums[i],\ f(i-1) + nums[i])
$$

含义：前面那段和如果是负数，就丢掉，从当前位置重开。全局答案是所有 $f(i)$ 的最大值。

滚动一个变量即可，不必留整张 DP 表。

## 代码

```ts
function maxSubArray(nums: number[]): number {
  let current = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }

  return best;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |

## 复盘

- 先定义「以 i 结尾」，转移才不会漏段或重段
- 同类题：53、152、918
