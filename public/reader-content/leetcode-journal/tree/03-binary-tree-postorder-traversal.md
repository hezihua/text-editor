---
title: 二叉树的后序遍历
description: 递归：左 → 右 → 根
date: 2026-09-03
number: 145
difficulty: easy
tags: [二叉树, 递归, DFS]
---

## 题意

给定二叉树的根节点 `root`，返回它的后序遍历（左 → 右 → 根）。

## 思路

递归：先遍历左子树，再遍历右子树，最后访问根。

## 代码

```go
func postorderTraversal(root *TreeNode) []int {
    res := []int{}
    var postorder func(*TreeNode)
    postorder = func(node *TreeNode) {
        if node == nil { return }
        postorder(node.Left)
        postorder(node.Right)
        res = append(res, node.Val)
    }
    postorder(root)
    return res
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(h)$ |
