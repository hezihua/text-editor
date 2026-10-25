---
title: 合并 K 个升序链表
description: 最小堆维护当前各链头，或分治两两合并
date: 2026-08-31
number: 23
difficulty: hard
tags: [链表, 优先队列, 分治]
---

## 题意

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

**示例 1：**

```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
```

**示例 2：**

```
输入：lists = []
输出：[]
```

**示例 3：**

```
输入：lists = [[]]
输出：[]
```

**约束：**

- `k == lists.length`
- `0 <= k <= 10^4`
- `0 <= lists[i].length <= 500`
- `-10^4 <= lists[i][j] <= 10^4`
- `lists[i]` 按**升序**排列
- `lists[i].length` 的总和不超过 `10^4`

## 思路

两种主流解法：

**方法一：优先队列（最小堆）**

1. 把所有非空链表的头节点放入最小堆。
2. 每次取出堆顶（当前最小节点），接到结果后面。
3. 如果该节点还有下一个，继续放入堆。
4. 重复直到堆为空。

**方法二：分治合并**

1. 两两合并链表，类似归并排序。
2. 递归把 k 个链表分成左右两半，分别合并后再合并结果。

优先队列直观，分治空间更优。

## 代码

```go
import "container/heap"

type NodeHeap []*ListNode

func (h NodeHeap) Len() int           { return len(h) }
func (h NodeHeap) Less(i, j int) bool { return h[i].Val < h[j].Val }
func (h NodeHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *NodeHeap) Push(x interface{}) {
    *h = append(*h, x.(*ListNode))
}
func (h *NodeHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &NodeHeap{}
    heap.Init(h)

    for _, node := range lists {
        if node != nil {
            heap.Push(h, node)
        }
    }

    dummy := &ListNode{}
    curr := dummy

    for h.Len() > 0 {
        node := heap.Pop(h).(*ListNode)
        curr.Next = node
        curr = curr.Next
        if node.Next != nil {
            heap.Push(h, node.Next)
        }
    }
    return dummy.Next
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(N \log k)$，$N$ 为所有节点总数，$k$ 为链表个数 |
| 空间 | $O(k)$（堆的大小） |
