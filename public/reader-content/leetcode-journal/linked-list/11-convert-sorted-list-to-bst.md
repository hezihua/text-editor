---
title: 有序链表转换二叉搜索树
description: 快慢指针取中点作根，递归建左右子树
date: 2026-08-31
number: 109
difficulty: medium
tags: [链表, 二叉树]
---

## 题意

给定一个单链表的头节点 `head`，其中的元素按升序排序，将其转换为高度平衡的二叉搜索树。

本题中，一个高度平衡二叉树是指一个二叉树每个节点的左右两个子树的高度差不超过 1。

**示例 1：**

```
输入：head = [-10,-3,0,5,9]
输出：[0,-3,9,-10,null,5]
解释：一个可能的答案是 [0,-3,9,-10,null,5]，它表示所示的高度平衡的二叉搜索树。
```

**示例 2：**

```
输入：head = []
输出：[]
```

**约束：**

- `head` 中的节点数在 `[0, 2 * 10^4]` 范围内
- `-10^5 <= Node.val <= 10^5`

## 思路

使用**快慢指针找中点 + 递归**：

1. 用快慢指针找到链表的中点（中点作为当前子树的根节点，保证平衡）。
2. 断开中点前的链表，把链表分成左右两部分。
3. 递归地用左半部分构建左子树，右半部分构建右子树。

这样每次选中点作为根，天然保证高度平衡。

## 代码

```go
func sortedListToBST(head *ListNode) *TreeNode {
    if head == nil {
        return nil
    }
    if head.Next == nil {
        return &TreeNode{Val: head.Val}
    }

    // 快慢指针找中点
    slow, fast := head, head
    var prev *ListNode
    for fast != nil && fast.Next != nil {
        prev = slow
        slow = slow.Next
        fast = fast.Next.Next
    }

    // 断开链表
    if prev != nil {
        prev.Next = nil
    }

    root := &TreeNode{Val: slow.Val}
    root.Left = sortedListToBST(head)
    root.Right = sortedListToBST(slow.Next)
    return root
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n \log n)$ |
| 空间 | $O(\log n)$（递归栈） |
