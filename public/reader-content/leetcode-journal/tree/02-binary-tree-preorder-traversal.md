---
title: 二叉树的前序遍历
description: 递归：根 → 左 → 右
date: 2026-09-03
number: 144
difficulty: easy
tags: [二叉树, 递归, DFS]
---

## 题意

给定二叉树的根节点 `root`，返回它的前序遍历（根 → 左 → 右）。

## 思路

递归：先访问根，再遍历左子树，最后遍历右子树。

## 代码

```go
func preorderTraversal(root *TreeNode) []int {
    res := []int{}
    var preorder func(*TreeNode)
    preorder = func(node *TreeNode) {
        if node == nil { return }
        res = append(res, node.Val)
        preorder(node.Left)
        preorder(node.Right)
    }
    preorder(root)
    return res
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(h)$ |
