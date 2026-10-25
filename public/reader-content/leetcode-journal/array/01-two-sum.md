---
title: 两数之和
description: 哈希表一次遍历，用补数定位下标
date: 2026-08-30
number: 1
difficulty: easy
tags: [哈希表]
---

## 题意

给定整数数组 `nums` 和目标值 `target`，返回两个数的下标，使它们的和等于 `target`。每个输入恰好有一组答案，同一个元素不能用两次。

## 思路

暴力枚举是 $O(n^2)$。更好的做法是用哈希表记录「已经看过的值 → 下标」：

- 遍历到 `nums[i]` 时，查表里有没有 `target - nums[i]`
- 有就直接返回答案
- 没有就把当前值写入表，继续往后走

每个元素只看一次，查询是 $O(1)$。

> 先查再写，避免同一个下标被用两次。

## 代码

```ts
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const j = seen.get(complement);
    if (j !== undefined) {
      return [j, i];
    }
    seen.set(nums[i], i);
  }

  return [];
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |

## 复盘

- 需要下标时，哈希表比排序 + 双指针更合适
- 同类题：1、167、454
