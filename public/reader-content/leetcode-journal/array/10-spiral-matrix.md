---
title: 螺旋矩阵
description: 四条边收缩，层层剥圈
date: 2026-08-30
number: 54
difficulty: medium
tags: [矩阵, 模拟]
---

## 题意

按顺时针螺旋顺序，返回矩阵中的所有元素。

## 思路

维护上下左右四个边界，每次走完一条边就收紧对应边界：

1. 上边：左 → 右，然后 `top++`
2. 右边：上 → 下，然后 `right--`
3. 下边：右 → 左，然后 `bottom--`
4. 左边：下 → 上，然后 `left++`

每走完一条边先判断边界是否交叉，避免单行、单列时重复取数。

## 代码

```ts
function spiralOrder(matrix: number[][]): number[] {
  const res: number[] = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(matrix[top][j]);
    top++;
    if (top > bottom) break;

    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
    right--;
    if (left > right) break;

    for (let j = right; j >= left; j--) res.push(matrix[bottom][j]);
    bottom--;
    if (top > bottom) break;

    for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);
    left++;
  }

  return res;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(mn)$ |
| 空间 | $O(1)$（不计输出） |

## 复盘

- 单行或单列是最容易重复的边界
- 同类题：54、59、885
