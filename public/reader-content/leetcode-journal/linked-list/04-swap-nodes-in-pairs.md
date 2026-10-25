---
title: 两两交换链表中的节点
description: 哑节点迭代交换，prev 移到 first
date: 2026-08-31
number: 24
difficulty: medium
tags: [链表]
---

## 题意

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

**示例 1：**

```
输入：head = [1,2,3,4]
输出：[2,1,4,3]
```

**示例 2：**

```
输入：head = []
输出：[]
```

**示例 3：**

```
输入：head = [1]
输出：[1]
```

**约束：**

- 链表中节点的数目在范围 `[0, 100]` 内
- `0 <= Node.val <= 100`

## 思路

使用**哑节点 + 迭代**：

1. 哑节点指向头节点。
2. `prev` 始终指向待交换两个节点的前一个节点。
3. 取出 `first` 和 `second`，完成指针交换：
   - `first.Next = second.Next`
   - `second.Next = first`
   - `prev.Next = second`
4. 然后把 `prev` 移动到 `first`（交换后它变成了这一对的第二个节点），继续处理下一对。

递归写法更简洁，但迭代满足 $O(1)$ 空间。

## 代码

```go
func swapPairs(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    prev := dummy

    for prev.Next != nil && prev.Next.Next != nil {
        first := prev.Next
        second := first.Next

        // 交换
        first.Next = second.Next
        second.Next = first
        prev.Next = second

        // 移动到下一组
        prev = first
    }
    return dummy.Next
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
