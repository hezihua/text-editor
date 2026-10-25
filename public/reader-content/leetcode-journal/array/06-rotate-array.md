---
title: 轮转数组
description: 三次翻转，把后 k 个搬到前面
date: 2026-08-30
number: 189
difficulty: medium
tags: [数组, 原地]
---

## 题意

把数组中的元素向右轮转 $k$ 步。要求尽量原地。

例如 `[1,2,3,4,5,6,7]`，$k=3$，变成 `[5,6,7,1,2,3,4]`。

## 思路

$k$ 先对 $n$ 取模。三次翻转：

1. 翻转整个数组
2. 翻转前 $k$ 个
3. 翻转剩下的

翻转后，原来的后 $k$ 个到了最前面，且各自内部顺序恢复。

也可以用额外数组，按下标 $(i+k) \bmod n$ 回写，空间是 $O(n)$。

## 代码

```ts
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k %= n;

  const reverse = (left: number, right: number) => {
    while (left < right) {
      const tmp = nums[left];
      nums[left] = nums[right];
      nums[right] = tmp;
      left++;
      right--;
    }
  };

  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |

## 复盘

- 先取模，否则 $k > n$ 会翻错
- 同类题：189、61、151
