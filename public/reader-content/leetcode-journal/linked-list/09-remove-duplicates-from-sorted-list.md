---
title: 删除排序链表中的重复元素
description: 单指针跳过相邻重复，各值只留一个
date: 2026-08-31
number: 83
difficulty: easy
tags: [链表]
---

## 题意

给定一个已排序的链表的头 `head`，删除所有重复的元素，使每个元素只出现一次。返回已排序的链表。

**示例 1：**

```
输入：head = [1,1,2]
输出：[1,2]
```

**示例 2：**

```
输入：head = [1,1,2,3,3]
输出：[1,2,3]
```

**约束：**

- 链表中节点数目在范围 `[0, 300]` 内
- `-100 <= Node.val <= 100`
- 题目数据保证链表已经按升序排列

## 思路

比 82 题简单，只需**保留一个**重复元素：

1. 从链表头开始遍历。
2. 如果当前节点和下一个节点的值相同，就把当前节点的 `Next` 指向下下个节点（跳过重复节点）。
3. 如果不同，就正常往后移动。

因为链表已排序，相同元素一定相邻。

## 代码

```go
func deleteDuplicates(head *ListNode) *ListNode {
    if head == nil {
        return nil
    }

    curr := head
    for curr.Next != nil {
        if curr.Val == curr.Next.Val {
            curr.Next = curr.Next.Next
        } else {
            curr = curr.Next
        }
    }
    return head
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
