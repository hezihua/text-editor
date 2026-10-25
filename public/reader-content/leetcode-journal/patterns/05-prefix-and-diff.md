---
title: 前缀和与差分
description: 区间查询变两次前缀相减；区间修改变两个点修改
date: 2026-08-31
tags: [常用算法, 前缀和, 差分]
---

## 前缀和

先花 $O(n)$ 做成 `pre[i] = a[0]+…+a[i-1]`，之后任意区间和 $O(1)$：

$$
\textit{sum}[l..r] = \textit{pre}[r+1] - \textit{pre}[l]
$$

乘法版本就是前缀积。[238 除自身乘积](/topics/array/product-of-array-except-self) 把「除 $i$ 以外」拆成左前缀积 × 右后缀积，不能用除法、有 $0$ 时除法还会炸。

## 前缀 + 哈希

求「和为 $k$ 的子数组个数」：扫到 $i$ 时，`pre` 已知，看之前有多少个前缀等于 `pre - k`。

```go
func subarraySum(nums []int, k int) int {
    seen := map[int]int{0: 1}
    pre, ans := 0, 0
    for _, x := range nums {
        pre += x
        ans += seen[pre-k]
        seen[pre]++
    }
    return ans
}
```

这是滑动窗口做不了「含负数」时的替代。最长连续序列那种「值连续、下标不连续」用集合，不是前缀和。

## 差分数组

前缀和的逆操作：区间 $[l,r]$ 一律加 $d$，变成：

```text
diff[l] += d
diff[r+1] -= d
```

全部改完后，对 `diff` 做一遍前缀和，还原数组。$m$ 次区间更新从 $O(mn)$ 降到 $O(m+n)$。

航班预订、公司里加减范围薪资，都是这个模型。二维差分同理，矩形四角 $+d,-d,-d,+d$。

## 和本站题的关系

| 题 | 用法 |
|----|------|
| [238 除自身乘积](/topics/array/product-of-array-except-self) | 左右前缀积 |
| [53 最大子数组和](/topics/array/maximum-subarray) | 可以前缀 + 扫最小前缀，Kadane 更短 |
| [56 合并区间](/topics/array/merge-intervals) | 不是前缀，是排序后扫；差分适合「覆盖次数」 |

## 注意

- `pre` 长度多为 $n+1$，下标别和原数组错位
- 哈希要先查再写入，避免空区间或自身当补
- 差分数组最后一定要还原，直接读 `diff` 不是原值
