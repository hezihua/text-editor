---
title: 删除排序链表中的重复元素 II
description: 哑节点跳过整段重复值，只留出现一次的
date: 2026-08-31
number: 82
difficulty: medium
tags: [链表]
---

## 题意

给定一个已排序的链表的头 `head`，删除原始链表中所有重复数字的节点，只留下不同的数字。返回已排序的链表。

**示例 1：**

```
输入：head = [1,2,3,3,4,4,5]
输出：[1,2,5]
```

**示例 2：**

```
输入：head = [1,1,1,2,3]
输出：[2,3]
```

**约束：**

- 链表中节点数目在范围 `[0, 300]` 内
- `-100 <= Node.val <= 100`
- 题目数据保证链表已经按升序排列

## 思路

与 83 题不同，这里要**删除所有出现过重复的数字**（只保留出现一次的）。

1. 使用哑节点。
2. `prev` 指向已确定保留的最后一个节点。
3. 当发现当前节点后面有相同值时，一直往后跳过所有相同值，然后让 `prev.Next` 直接指向这段重复之后的节点。
4. 如果当前节点是唯一的，就把 `prev` 往前移动。

关键点：整段删除，而不是保留一个。

## 代码

```go
func deleteDuplicates(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    prev := dummy

    for head != nil {
        if head.Next != nil && head.Val == head.Next.Val {
            // 跳过所有相同值
            for head.Next != nil && head.Val == head.Next.Val {
                head = head.Next
            }
            prev.Next = head.Next
        } else {
            prev = prev.Next
        }
        head = head.Next
    }
    return dummy.Next
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
