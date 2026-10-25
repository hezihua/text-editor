---
title: 除自身以外数组的乘积
description: 左右前缀积，避开除法
date: 2026-08-30
number: 238
difficulty: medium
tags: [前缀积, 数组]
---

## 题意

给一个整数数组 `nums`，返回数组 `answer`，其中 `answer[i]` 等于除 `nums[i]` 以外其余元素的乘积。要求 $O(n)$，且不能使用除法。

## 思路

`answer[i] = 左侧所有数的积 × 右侧所有数的积`。

分两趟扫描：

1. 从左到右，用变量 `prefix` 累积左侧乘积，写入 `answer[i]`
2. 从右到左，用变量 `suffix` 累积右侧乘积，再乘回 `answer[i]`

这样只需要一个输出数组，额外空间是 $O(1)$（不计输出）。

## 代码

```ts
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const answer = new Array<number>(n).fill(1);

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= suffix;
    suffix *= nums[i];
  }

  return answer;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$（不计输出） |

## 复盘

- 有 $0$ 时除法会失效，前缀积不受影响
- 同类题：238、152
