---
title: 最长连续序列
description: 只从序列起点往右扩
date: 2026-08-30
number: 128
difficulty: medium
tags: [哈希表]
---

## 题意

给未排序整数数组，求最长连续序列的长度。要求 $O(n)$。连续指数值连续，不要求下标连续，例如 `[100,4,200,1,3,2]` 的答案是 `4`（`1,2,3,4`）。

## 思路

先把所有数放进集合。对每个数 `x`，只有当 `x-1` 不在集合里时，`x` 才是一段的起点，再向右数 `x+1, x+2, ...`。

这样每段只会被走一遍，总时间仍是 $O(n)$。

## 代码

```ts
function longestConsecutive(nums: number[]): number {
  const set = new Set(nums);
  let best = 0;

  for (const x of set) {
    if (set.has(x - 1)) continue;

    let y = x;
    while (set.has(y + 1)) y++;
    best = Math.max(best, y - x + 1);
  }

  return best;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |

## 复盘

- 排序也能做，但达不到 $O(n)$
- 同类题：128、298、1218
