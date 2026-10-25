---
title: DFS 与回溯
description: 走到底再回头；做选择、递归、撤销
date: 2026-08-31
tags: [常用算法, DFS, 回溯]
---

## 什么时候用

**DFS**：连通块、网格染色、树的递归、判断能否到达。不要求最短。

**回溯**：要枚举所有方案（全排列、组合、子集、N 皇后）。是带「撤销」的 DFS。

理论见 [递归、分治与回溯](/topics/theory/recursion-and-backtrack)。这里给能直接抄的板子。

## 网格 DFS

```go
var dirs = [4][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}}

func dfs(grid [][]byte, i, j int) {
    if i < 0 || j < 0 || i >= len(grid) || j >= len(grid[0]) || grid[i][j] != '1' {
        return
    }
    grid[i][j] = '0' // 沉岛，兼作访问标记
    for _, d := range dirs {
        dfs(grid, i+d[0], j+d[1])
    }
}
```

岛屿数量：扫到 `'1'` 就 DFS 并把整块沉掉。注意边界和「先标访问再递归」，否则会转圈。

## 回溯模板

```go
func permute(nums []int) [][]int {
    n := len(nums)
    used := make([]bool, n)
    var path []int
    var ans [][]int

    var bt func()
    bt = func() {
        if len(path) == n {
            ans = append(ans, append([]int(nil), path...))
            return
        }
        for i, x := range nums {
            if used[i] {
                continue
            }
            used[i] = true
            path = append(path, x)
            bt()
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    bt()
    return ans
}
```

三步：选 → 递归 → 撤。存 `path` 进答案时必须拷贝，切片是引用。

## 剪枝

组合总和：当前和已经超 `target` 就 return，且下一层从 `i` 或 `i+1` 开始，避免重复组合。子集题用「选或不选」二叉树，或「从 start 往后枚举」。

## 和 BFS 怎么选

要最短步数 → BFS。要连通、染色、全部方案 → DFS / 回溯。树题默认递归 DFS，层序才上队列。
