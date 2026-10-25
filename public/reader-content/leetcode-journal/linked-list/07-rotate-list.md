---
title: 旋转链表
description: 先取模再闭合成环，找新断点
date: 2026-08-31
number: 61
difficulty: medium
tags: [链表]
---

## 题意

给你一个链表的头节点 `head`，旋转链表，将链表每个节点向右移动 `k` 个位置。

**示例 1：**

```
输入：head = [1,2,3,4,5], k = 2
输出：[4,5,1,2,3]
```

**示例 2：**

```
输入：head = [0,1,2], k = 4
输出：[2,0,1]
```

**约束：**

- 链表中节点的数目在范围 `[0, 500]` 内
- `-100 <= Node.val <= 100`
- `0 <= k <= 2 * 10^9`

## 思路

**闭合成环 + 找新头**：

1. 先遍历得到链表长度 `length` 和尾节点。
2. `k %= length`，处理 k 很大的情况。
3. 把尾节点指向头节点，形成环。
4. 从原头节点走 `length - k - 1` 步，到达**新的尾节点**。
5. 新尾节点的下一个就是**新的头节点**，然后断开环。

关键点：先取模，再闭合成环，最后找断点。

## 代码

```go
func rotateRight(head *ListNode, k int) *ListNode {
    if head == nil || head.Next == nil || k == 0 {
        return head
    }

    // 计算长度并找到尾节点
    length := 1
    tail := head
    for tail.Next != nil {
        tail = tail.Next
        length++
    }

    k %= length
    if k == 0 {
        return head
    }

    // 闭合成环
    tail.Next = head

    // 找到新的尾节点
    stepsToNewTail := length - k - 1
    newTail := head
    for i := 0; i < stepsToNewTail; i++ {
        newTail = newTail.Next
    }

    newHead := newTail.Next
    newTail.Next = nil
    return newHead
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
