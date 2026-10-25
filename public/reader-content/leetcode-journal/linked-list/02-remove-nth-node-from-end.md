---
title: 删除链表的倒数第 N 个结点
description: 快指针先走 n+1 步，慢指针停在前驱
date: 2026-08-31
number: 19
difficulty: medium
tags: [链表, 双指针]
---

## 题意

给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

**示例 1：**

```
输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]
```

**示例 2：**

```
输入：head = [1], n = 1
输出：[]
```

**示例 3：**

```
输入：head = [1,2], n = 1
输出：[1]
```

**约束：**

- 链表中结点的数目为 `sz`
- `1 <= sz <= 30`
- `0 <= Node.val <= 100`
- `1 <= n <= sz`

进阶：你能尝试使用一趟扫描实现吗？

## 思路

使用**双指针 + 哑节点**实现一趟扫描：

1. 哑节点指向头节点，方便处理删除头节点的情况。
2. 快指针先走 `n+1` 步，使快慢指针之间正好隔着 `n` 个节点。
3. 然后快慢指针一起移动，当快指针到达 `nil` 时，慢指针正好停在待删除节点的**前一个**节点。
4. 执行 `slow.Next = slow.Next.Next` 即可删除。

为什么先走 `n+1` 步？因为要让慢指针停在待删节点的前驱。

## 代码

```go
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    fast, slow := dummy, dummy

    // 快指针先走 n+1 步
    for i := 0; i <= n; i++ {
        fast = fast.Next
    }

    // 快慢一起走
    for fast != nil {
        fast = fast.Next
        slow = slow.Next
    }

    // 删除节点
    slow.Next = slow.Next.Next
    return dummy.Next
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(L)$，$L$ 为链表长度 |
| 空间 | $O(1)$ |
