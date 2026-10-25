---
title: 拓扑排序
description: 有向无环图按依赖顺序出队，顺便判环
date: 2026-08-31
tags: [常用算法, 拓扑排序, 图]
---

## 什么时候用

有向图，边表示「先完成 u 才能做 v」。要一个合法顺序，或判断有没有环（课程表）。

前提：必须是 **DAG**。有环就无法拓扑。

## Kahn：入度 + 队列

```go
func topoSort(n int, edges [][]int) []int {
    g := make([][]int, n)
    indeg := make([]int, n)
    for _, e := range edges {
        g[e[0]] = append(g[e[0]], e[1])
        indeg[e[1]]++
    }
    q := []int{}
    for i, d := range indeg {
        if d == 0 {
            q = append(q, i)
        }
    }
    var order []int
    for len(q) > 0 {
        u := q[0]
        q = q[1:]
        order = append(order, u)
        for _, v := range g[u] {
            indeg[v]--
            if indeg[v] == 0 {
                q = append(q, v)
            }
        }
    }
    if len(order) != n {
        return nil // 有环
    }
    return order
}
```

出队个数少于 $n$，剩下的点互相卡着，就是环。课程表、最长递增路径（先拓扑再 DP）用这个。

## DFS 染色

`0` 未访、`1` 访问中、`2` 已完成。走到 `1` 说明回到当前链，有环。后序入栈再反转，得到拓扑序。

和 Kahn 等价，Kahn 更好写「顺序」和「是否有环」。

## 和本站的关系

[23 合并 K 路](/topics/linked-list/merge-k-sorted-lists) 不是拓扑，是多路归并。拓扑出现在「任务依赖」「字符顺序（外星词典）」「配方合成」。

DAG 上的 DP：先拓扑，再按顺序转移，见 [图与动态规划](/topics/theory/graph-and-dp)。

## 注意

- 建图方向别反：`a 先于 b` 是 `a → b` 还是反过来，和入度定义要一致
- 可能有多个合法序，队列换成堆就能得到字典序最小
- 无向图没有拓扑，用并查集或 DFS 判环
