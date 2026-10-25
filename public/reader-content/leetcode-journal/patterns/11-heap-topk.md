---
title: 堆与 Top-K
description: 只要反复拿最值，用大小为 K 的堆
date: 2026-08-31
tags: [常用算法, 堆]
---

## 什么时候用

不需要全排序，只要最大 / 最小的 K 个，或动态维护当前最值。见理论 [哈希、树与堆](/topics/theory/hash-tree-heap)。

典型信号：第 K 大、前 K 高频、数据流中位数、合并 K 条有序链。

## 第 K 大：小根堆

堆里只留 K 个最大候选，堆顶是这 K 个里最小的，也就是第 K 大。

```go
// 这里用手写直觉：Go 标准库是 container/heap
// 小根堆大小为 k，多了就弹出堆顶
func findKthLargest(nums []int, k int) int {
    h := &IntHeap{}
    heap.Init(h)
    for _, x := range nums {
        heap.Push(h, x)
        if h.Len() > k {
            heap.Pop(h)
        }
    }
    return (*h)[0]
}
```

时间 $O(n\log k)$，比全排 $O(n\log n)$ 更适合 $k \ll n$。第 K 小改用大根堆。

快选平均 $O(n)$，但不稳定、不好处理数据流。数据流用堆。

## 合并 K 路

[23 合并 K 个升序链表](/topics/linked-list/merge-k-sorted-lists)：堆里放每条链的当前头，弹出最小，再把该链下一个塞回去。$O(N\log k)$。

## 双堆求中位数

左边大根堆（较小的一半），右边小根堆（较大的一半）。平衡个数，中位数在堆顶。

## 注意

- 第 K **大**用小根堆，第 K **小**用大根堆，容易反
- Go 的 `container/heap` 默认小根堆，大根堆把 `Less` 反过来
- 频率 Top-K：先计数，再按次数进堆，不要对原数组直接堆
