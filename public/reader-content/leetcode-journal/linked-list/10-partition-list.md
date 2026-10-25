---
title: 分隔链表
description: 小链和大链拼接，保持相对顺序并防环
date: 2026-08-31
number: 86
difficulty: medium
tags: [链表]
---

## 题意

给你一个链表的头节点 `head` 和一个特定值 `x`，请你对链表进行分隔，使得所有**小于** `x` 的节点都出现在**大于或等于** `x` 的节点之前。

你应当保留两个分区中每个节点的初始相对位置。

**示例 1：**

```
输入：head = [1,4,3,2,5,2], x = 3
输出：[1,2,2,4,3,5]
```

**示例 2：**

```
输入：head = [2,1], x = 2
输出：[1,2]
```

**约束：**

- 链表中节点的数目在范围 `[0, 200]` 内
- `-100 <= Node.val <= 100`
- `-200 <= x <= 200`

## 思路

使用**双链表拼接**，保持相对顺序：

1. 创建两条新链表：
   - `small`：存放所有 `< x` 的节点
   - `large`：存放所有 `≥ x` 的节点
2. 一次遍历原链表，按值把节点分别接到对应链表后面。
3. 遍历结束后，把 `small` 的尾部接到 `large` 的头部。
4. 记得把 `large` 的尾部置为 `nil`，防止成环。

## 代码

```go
func partition(head *ListNode, x int) *ListNode {
    smallDummy := &ListNode{}
    small := smallDummy
    largeDummy := &ListNode{}
    large := largeDummy

    for head != nil {
        if head.Val < x {
            small.Next = head
            small = small.Next
        } else {
            large.Next = head
            large = large.Next
        }
        head = head.Next
    }

    large.Next = nil          // 防止成环
    small.Next = largeDummy.Next
    return smallDummy.Next
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
