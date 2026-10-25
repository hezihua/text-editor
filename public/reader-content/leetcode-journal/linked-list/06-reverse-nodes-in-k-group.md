---
title: K 个一组翻转链表
description: 先判断够不够 k 个，再分组头插翻转
date: 2026-08-31
number: 25
difficulty: hard
tags: [链表, 翻转]
---

## 题意

给你链表的头节点 `head`，每 `k` 个节点一组进行翻转，请你返回修改后的链表。

`k` 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 `k` 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

**示例 1：**

```
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
```

**示例 2：**

```
输入：head = [1,2,3,4,5], k = 3
输出：[3,2,1,4,5]
```

**约束：**

- 链表中的节点数目为 `n`
- `1 <= k <= n <= 5000`
- `0 <= Node.val <= 1000`

进阶：你可以设计一个只使用常数额外空间的算法解决此问题吗？

## 思路

使用**哑节点 + 分组翻转**：

1. 哑节点方便处理头节点变化。
2. `prevGroupEnd` 始终指向上一组的最后一个节点。
3. 每次先检查后面是否还有完整的 k 个节点，不足则直接返回。
4. 对当前这一组进行头插法翻转。
5. 翻转完成后，把这一组接到前面，并更新 `prevGroupEnd`。

关键点：先判断是否够 k 个，再翻转。

## 代码

```go
func reverseKGroup(head *ListNode, k int) *ListNode {
    dummy := &ListNode{Next: head}
    prevGroupEnd := dummy

    for {
        // 检查后面是否还有 k 个节点
        kth := prevGroupEnd
        for i := 0; i < k; i++ {
            kth = kth.Next
            if kth == nil {
                return dummy.Next
            }
        }

        groupStart := prevGroupEnd.Next
        groupNext := kth.Next

        // 翻转当前组
        prev, curr := groupNext, groupStart
        for curr != groupNext {
            next := curr.Next
            curr.Next = prev
            prev = curr
            curr = next
        }

        // 接到前面
        prevGroupEnd.Next = kth
        prevGroupEnd = groupStart
    }
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
