---
title: 广度优先搜索
description: 队列按层扩展，无权最短路和多源扩散
date: 2026-08-31
tags: [常用算法, BFS, 图]
---

## 什么时候用

要「最少步数」「按层」「从多个源同时扩散」。无权图的最短路用 BFS，不要用 DFS 碰运气。

典型信号：二叉树层序、矩阵里到最近 0 的距离、腐烂橘子、单词接龙、打开转盘锁。

## 模板：单源

```go
func bfs(start int, graph [][]int) []int {
    n := len(graph)
    dist := make([]int, n)
    for i := range dist {
        dist[i] = -1
    }
    dist[start] = 0
    q := []int{start}
    for len(q) > 0 {
        u := q[0]
        q = q[1:]
        for _, v := range graph[u] {
            if dist[v] == -1 {
                dist[v] = dist[u] + 1
                q = append(q, v)
            }
        }
    }
    return dist
}
```

每个点只入队一次，时间 $O(V+E)$。网格把四向当邻居，越界和障碍先判掉。

## 多源 BFS

若干个源同时入队，`dist=0`。第一次走到某格，就是离最近源的距离。腐烂橘子、01 矩阵都是这个。

比「对每个 0 再 BFS 一次」少一个数量级。

## 层序写法

要严格按层处理（二叉树右视图、锯齿层序），用 `size := len(q)` 把当前层一次性掏完。

```go
for len(q) > 0 {
    size := len(q)
    for i := 0; i < size; i++ {
        u := q[0]
        q = q[1:]
        // 处理 u，把下一层塞进队列
    }
}
```

## 注意

- 入队时就标记访问，出队再标会重复入队
- 有权边最短路改 Dijkstra，BFS 只保证边权相等（通常是 1）
- 状态可能不只是坐标，比如「位置 + 剩余钥匙」，把状态打包进队列
