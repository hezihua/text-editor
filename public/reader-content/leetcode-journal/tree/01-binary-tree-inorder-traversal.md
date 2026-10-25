---
title: 二叉树的中序遍历
description: 递归：左 → 根 → 右
date: 2026-09-03
number: 94
difficulty: easy
tags: [二叉树, 递归, DFS]
---

## 题意

给定二叉树的根节点 `root`，返回它的中序遍历（左 → 根 → 右）。

## 思路

递归：先遍历左子树，再访问根，最后遍历右子树。

## 代码

```go
func inorderTraversal(root *TreeNode) []int {
    res := []int{}
    var inorder func(*TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil { return }
        inorder(node.Left)
        res = append(res, node.Val)
        inorder(node.Right)
    }
    inorder(root)
    return res
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(h)$（$h$ 为树高，最坏 $O(n)$） |
