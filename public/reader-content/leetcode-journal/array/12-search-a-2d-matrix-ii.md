---
title: 搜索二维矩阵 II
description: 从右上角逼近，一次排除一行或一列
date: 2026-08-30
number: 240
difficulty: medium
tags: [矩阵, 二分]
---

## 题意

矩阵每行从左到右升序、每列从上到下升序。判断 `target` 是否存在。

## 思路

从右上角 `(0, n-1)` 出发：

- 当前值等于 `target`：找到
- 当前值大于 `target`：这一列下面更大，只能往左
- 当前值小于 `target`：这一行左边更小，只能往下

每一步排除一行或一列，最多走 $m+n$ 步。

左下角出发同理，只是移动方向对调。

## 代码

```ts
function searchMatrix(matrix: number[][], target: number): boolean {
  const m = matrix.length;
  const n = matrix[0].length;
  let i = 0;
  let j = n - 1;

  while (i < m && j >= 0) {
    const val = matrix[i][j];
    if (val === target) return true;
    if (val > target) j--;
    else i++;
  }

  return false;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(m+n)$ |
| 空间 | $O(1)$ |

## 复盘

- 不能从左上或右下出发，那两个角无法同时排除行和列
- 同类题：240、74、378
