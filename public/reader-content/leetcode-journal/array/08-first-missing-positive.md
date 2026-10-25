---
title: 缺失的第一个正数
description: 把数字放到对应下标，再扫空洞
date: 2026-08-30
number: 41
difficulty: hard
tags: [数组, 原地哈希]
---

## 题意

给未排序整数数组，找出其中没有出现的最小正整数。要求时间 $O(n)$、常数级额外空间。

## 思路

答案一定在 $[1, n+1]$。把值 $x$（$1 \le x \le n$）放到下标 $x-1$ 上，相当于原地哈希。

交换完成后，再扫一遍：第一个不满足 `nums[i] === i+1` 的位置，答案就是 $i+1$；都对上了，答案是 $n+1$。

交换时注意：目标位置已经是正确值就停，避免死循环。

## 代码

```ts
function firstMissingPositive(nums: number[]): number {
  const n = nums.length;

  for (let i = 0; i < n; i++) {
    while (
      nums[i] >= 1 &&
      nums[i] <= n &&
      nums[nums[i] - 1] !== nums[i]
    ) {
      const j = nums[i] - 1;
      const tmp = nums[i];
      nums[i] = nums[j];
      nums[j] = tmp;
    }
  }

  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }

  return n + 1;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |

## 复盘

- 负数、零、大于 $n$ 的数都是噪声，不参与归位
- 同类题：41、268、448
