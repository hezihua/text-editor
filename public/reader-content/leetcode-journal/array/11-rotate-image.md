---
title: 旋转图像
description: 先转置再左右翻转
date: 2026-08-30
number: 48
difficulty: medium
tags: [矩阵, 原地]
---

## 题意

将 $n \times n$ 矩阵顺时针旋转 $90^\circ$，要求原地修改。

## 思路

顺时针 $90^\circ$ 等价于两步：

1. 沿主对角线转置：`(i, j) ↔ (j, i)`
2. 每一行左右翻转

也可以按圈四个位置对换，但「转置 + 翻转」更好记。

逆时针则是转置后再上下翻转。

## 代码

```ts
function rotate(matrix: number[][]): void {
  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const tmp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = tmp;
    }
  }

  for (let i = 0; i < n; i++) {
    let left = 0;
    let right = n - 1;
    while (left < right) {
      const tmp = matrix[i][left];
      matrix[i][left] = matrix[i][right];
      matrix[i][right] = tmp;
      left++;
      right--;
    }
  }
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n^2)$ |
| 空间 | $O(1)$ |

## 复盘

- 转置时 `j` 从 `i+1` 开始，避免换两次变回去
- 同类题：48、867、1886
