---
title: 并查集
description: 动态维护连通性，加边后问是否同一集合
date: 2026-08-31
tags: [常用算法, 并查集]
---

## 什么时候用

元素分到若干集合里，要频繁「合并两集」和「查询是否同集」。比每次 DFS 扫全图便宜。

典型信号：冗余连接、省份数量、账户合并、等式方程、最小生成树里的 Kruskal。

## 模板

```go
type UF struct {
    parent []int
    rank   []int
    count  int
}

func NewUF(n int) *UF {
    p := make([]int, n)
    for i := range p {
        p[i] = i
    }
    return &UF{parent: p, rank: make([]int, n), count: n}
}

func (u *UF) Find(x int) int {
    if u.parent[x] != x {
        u.parent[x] = u.Find(u.parent[x]) // 路径压缩
    }
    return u.parent[x]
}

func (u *UF) Union(a, b int) bool {
    ra, rb := u.Find(a), u.Find(b)
    if ra == rb {
        return false // 已连通，这条边是环
    }
    if u.rank[ra] < u.rank[rb] {
        ra, rb = rb, ra
    }
    u.parent[rb] = ra
    if u.rank[ra] == u.rank[rb] {
        u.rank[ra]++
    }
    u.count--
    return true
}
```

带路径压缩 + 按秩合并，均摊近 $O(\alpha(n))$，当作 $O(1)$。

## 用法

- **连通分量个数**：一开始 $n$ 个集合，每次成功 `Union` 就 `count--`
- **判环**：加边前 `Find` 已相同，再加就成环（冗余连接）
- **等式 / 账户**：先把相等或邮箱相同的 `Union`，再按根分组

字符串当元素时，先离散化成整数下标。

## 和 DFS 的差别

静态图只问连通，DFS / BFS 就够。边是**逐步加上来**、或要边加边查，用并查集。网格也可以把 `(i,j)` 编成 `i*n+j`。

## 注意

- 比较是否同集必须用 `Find`，不要直接比 `parent[x]`
- `Union` 返回 false 往往就是「这条边多余」的答案
- 权值并查集（带偏移）是进阶，等式里的不等关系有时要拆成「与否」两套
