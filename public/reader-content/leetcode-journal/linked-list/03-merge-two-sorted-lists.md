---
title: 合并两个有序链表
description: 哑节点双指针，剩余段直接接上
date: 2026-08-31
number: 21
difficulty: easy
tags: [链表, 双指针]
---

## 题意

将两个升序链表合并为一个新的**升序**链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

**示例 1：**

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

**示例 2：**

```
输入：l1 = [], l2 = []
输出：[]
```

**示例 3：**

```
输入：l1 = [], l2 = [0]
输出：[0]
```

**约束：**

- 两个链表的节点数目范围是 `[0, 50]`
- `-100 <= Node.val <= 100`
- `l1` 和 `l2` 均按**非递减**顺序排列

## 思路

使用**哑节点 + 双指针**：

1. 创建哑节点作为结果链表的起点。
2. 同时遍历两条链表，每次把较小的节点接到结果后面。
3. 当其中一条链表遍历完后，直接把另一条剩余部分接上去即可。

也可以用递归实现，但迭代版本空间更优。

## 代码

```go
func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy

    for list1 != nil && list2 != nil {
        if list1.Val <= list2.Val {
            curr.Next = list1
            list1 = list1.Next
        } else {
            curr.Next = list2
            list2 = list2.Next
        }
        curr = curr.Next
    }

    // 接上剩余部分
    if list1 != nil {
        curr.Next = list1
    } else {
        curr.Next = list2
    }
    return dummy.Next
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(m + n)$ |
| 空间 | $O(1)$ |
