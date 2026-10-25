---
title: 重排链表
description: 找中点、反转后半、交替合并
date: 2026-09-03
number: 143
difficulty: medium
tags: [链表, 快慢指针, 翻转]
---

## 题意

给定单链表 `L0 → L1 → … → Ln-1 → Ln`，将其重排为 `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …`。

要求实际进行节点交换，不能只改变节点内部的值。

## 思路

1. 快慢指针找中点，断开前后两段
2. 反转后半段
3. 交替合并前半段和反转后的后半段

## 代码

```go
func reorderList(head *ListNode) {
    if head == nil || head.Next == nil { return }

    slow, fast := head, head
    for fast.Next != nil && fast.Next.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }

    second := slow.Next
    slow.Next = nil
    second = reverseList(second)

    first := head
    for second != nil {
        tmp1, tmp2 := first.Next, second.Next
        first.Next = second
        second.Next = tmp1
        first, second = tmp1, tmp2
    }
}

func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    for head != nil {
        next := head.Next
        head.Next = prev
        prev = head
        head = next
    }
    return prev
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
