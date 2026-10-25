---
title: 对撞指针
description: 有序数组两端往中间收，或两条有序链归并
date: 2026-08-31
tags: [常用算法, 双指针]
---

## 什么时候用

序列**有序**（或先排成有序），两个指针从两端或从两条链的头出发，根据和 / 大小决定谁移动。每次排除一侧，总时间 $O(n)$，不再 $O(n^2)$ 枚举。

典型信号：两数之和（有序版）、三数之和、盛水、有序数组合并、回文判断。

## 模板：有序两数之和

```go
func twoSumSorted(nums []int, target int) []int {
    l, r := 0, len(nums)-1
    for l < r {
        sum := nums[l] + nums[r]
        if sum == target {
            return []int{l, r}
        }
        if sum < target {
            l++
        } else {
            r--
        }
    }
    return nil
}
```

和无序的 [1 两数之和](/topics/array/two-sum) 对照：要下标且不能排序，用哈希；只要值或可以排序，对撞更省空间。

## 模板：三数之和

先排序，枚举第一个数，剩下两个对撞。注意三处去重：`i`、`l`、`r`。

和偏小动左，偏大动右。这是「定一移二」，四数之和就是「定二移二」。

## 模板：合并两条有序链

[21 合并两个有序链表](/topics/linked-list/merge-two-sorted-lists) 是对撞思想的「双路归并」：谁小接谁，剩下一截直接挂上。

```go
func mergeTwoLists(a, b *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    for a != nil && b != nil {
        if a.Val <= b.Val {
            curr.Next, a = a, a.Next
        } else {
            curr.Next, b = b, b.Next
        }
        curr = curr.Next
    }
    if a != nil {
        curr.Next = a
    } else {
        curr.Next = b
    }
    return dummy.Next
}
```

[56 合并区间](/topics/array/merge-intervals) 也是排完序后线性扫，用一个 `end` 当「右指针」往外扩。

## 盛水这类贪心收缩

容器面积由「较矮边 × 宽度」决定。移动较矮的那一侧，才可能让 $\min$ 变大；移动高的一边，宽度变小且 $\min$ 不会变大。

## 注意

- 无序先排序，排序会打乱下标，题目要原下标就改哈希
- 去重发生在「已经用过的相同值」，不要把第一个合法值也跳掉
- `l < r` 还是 `l <= r` 看是否允许同一元素用两次
