---
title: 二叉树展开为链表
description: 左子树最右节点接右子树，原地先序展开
date: 2026-08-31
number: 114
difficulty: medium
tags: [链表, 二叉树]
---

## 题意

给你二叉树的根结点 `root`，请你将它展开为一个单链表：

- 展开后的单链表应该同样使用 `TreeNode`，其中 `right` 子指针指向链表中下一个结点，而左子指针始终为 `null`。
- 展开后的单链表应该与二叉树**先序遍历**顺序相同。

**示例 1：**

```
输入：root = [1,2,5,3,4,null,6]
输出：[1,null,2,null,3,null,4,null,5,null,6]
```

**示例 2：**

```
输入：root = []
输出：[]
```

**示例 3：**

```
输入：root = [0]
输出：[0]
```

**约束：**

- 树中结点数在范围 `[0, 2000]` 内
- `-100 <= Node.val <= 100`

进阶：你可以使用原地算法（$O(1)$ 额外空间）展开这棵树吗？

## 思路

使用**迭代 + 前驱节点**实现原地展开：

1. 从根节点开始遍历。
2. 如果当前节点有左子树：
   - 找到左子树的**最右节点**（前驱节点）。
   - 把当前节点的右子树接到这个最右节点后面。
   - 把左子树整体移到右边，并把左指针置为 `nil`。
3. 然后继续处理当前节点的右节点（已经是展开后的下一个节点）。

这样完全原地，满足进阶要求。

## 代码

```go
func flatten(root *TreeNode) {
    curr := root
    for curr != nil {
        if curr.Left != nil {
            // 找左子树最右节点
            prev := curr.Left
            for prev.Right != nil {
                prev = prev.Right
            }
            // 右子树接到最右节点后面
            prev.Right = curr.Right
            // 左子树移到右边
            curr.Right = curr.Left
            curr.Left = nil
        }
        curr = curr.Right
    }
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(1)$ |
