---
title: 合并区间
description: 按起点排序后线性合并
date: 2026-08-30
number: 56
difficulty: medium
tags: [区间, 排序]
---

## 题意

给若干闭区间，合并所有重叠区间，返回不重叠的区间列表。

## 思路

先按左端点排序。扫描时维护当前合并段 `[start, end]`：

- 下一个区间左端点 $\le end$：重叠，把 `end` 扩成两者右端点的较大值
- 否则：当前段封口，开启新段

排序后重叠关系变成局部的，一遍扫描即可。

## 代码

```ts
function merge(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);

  const res: number[][] = [];
  let [start, end] = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const [l, r] = intervals[i];
    if (l <= end) {
      end = Math.max(end, r);
    } else {
      res.push([start, end]);
      start = l;
      end = r;
    }
  }

  res.push([start, end]);
  return res;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n\log n)$ |
| 空间 | $O(n)$（不计排序） |

## 复盘

- 区间题几乎都是「先排序，再扫一遍」
- 同类题：56、57、435
