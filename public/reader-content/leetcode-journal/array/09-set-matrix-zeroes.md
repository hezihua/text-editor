---
title: 矩阵置零
description: 用第一行第一列当标记，原地清零
date: 2026-08-30
number: 73
difficulty: medium
tags: [矩阵, 原地]
---

## 题意

若矩阵某个位置是 $0$，则把它所在行和列都置为 $0$。要求原地完成。

## 思路

额外的行/列标记数组是 $O(m+n)$。把第一行、第一列当作标记位：

1. 先记下第一行、第一列本身有没有 $0$
2. 从 $(1,1)$ 扫到右下，遇到 $0$ 就在该行首、该列首打标记
3. 再根据标记把对应行、列置零
4. 最后按第 1 步的记录处理第一行、第一列

顺序不能反，否则会把标记本身抹掉。

## 代码

```ts
function setZeroes(matrix: number[][]): void {
  const m = matrix.length;
  const n = matrix[0].length;
  let firstRow = false;
  let firstCol = false;

  for (let j = 0; j < n; j++) if (matrix[0][j] === 0) firstRow = true;
  for (let i = 0; i < m; i++) if (matrix[i][0] === 0) firstCol = true;

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][0] = 0;
        matrix[0][j] = 0;
      }
    }
  }

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) {
        matrix[i][j] = 0;
      }
    }
  }

  if (firstRow) for (let j = 0; j < n; j++) matrix[0][j] = 0;
  if (firstCol) for (let i = 0; i < m; i++) matrix[i][0] = 0;
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(mn)$ |
| 空间 | $O(1)$ |

## 复盘

- 第一行第一列既是数据又是标记，要单独记原状态
- 同类题：73、289
