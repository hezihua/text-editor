---
title: 哑节点与原地改写
description: 统一头节点变化；用输入或输出当工作区
date: 2026-08-31
tags: [常用算法, 链表, 原地]
---

## 哑节点

链表题里，头节点可能被删、被换、被新节点取代。单独写「如果动的是头」会分叉。在头前面挂一个假节点，最后返回 `dummy.Next`，所有操作都变成「改某一个 `Next`」。

```go
dummy := &ListNode{Next: head}
prev := dummy
// 只操作 prev.Next，不必特判 head
return dummy.Next
```

本站几乎每道链表题都用：

- [2 两数相加](/topics/linked-list/add-two-numbers) — 结果链从头长出来
- [19 删倒数](/topics/linked-list/remove-nth-node-from-end) — 可能删的就是头
- [24 两两交换](/topics/linked-list/swap-nodes-in-pairs) — 新头是原来的第二个
- [82 删全部重复](/topics/linked-list/remove-duplicates-from-sorted-list-ii) — 开头一段可能整段丢掉
- [86 分隔](/topics/linked-list/partition-list) — 两条哑链再拼

## 分组改指针

[25 K 组翻转](/topics/linked-list/reverse-nodes-in-k-group)、[24 两两交换](/topics/linked-list/swap-nodes-in-pairs) 的共同点：`prev` 钉在这一组前面，组内翻转或交换，再把 `prev` 移到这一组新的尾。

画图顺序：先抓住 `first` / `second` / `groupNext`，再改三条边，最后移动 `prev`。顺序反了会丢链。

## 拼接两条链

[86 分隔链表](/topics/linked-list/partition-list)：小链、大链各一条哑节点，扫完后 `small.Next = largeDummy.Next`，**大链尾必须置 `nil`**，否则可能成环。

## 数组原地

题目要求 $O(1)$ 额外空间时，用输入或输出当工作区。

- [189 轮转](/topics/array/rotate-array)：三次翻转
- [238 除自身乘积](/topics/array/product-of-array-except-self)：输出数组先当左前缀，再乘右后缀
- [73 矩阵置零](/topics/array/set-matrix-zeroes)：第一行第一列当标记
- [41 缺失的第一个正数](/topics/array/first-missing-positive)：值 $x$ 放到下标 $x-1$（原地哈希）

```go
// 原地哈希：把 x 放到 nums[x-1]
for i := 0; i < n; i++ {
    for nums[i] >= 1 && nums[i] <= n && nums[nums[i]-1] != nums[i] {
        j := nums[i] - 1
        nums[i], nums[j] = nums[j], nums[i]
    }
}
```

## 注意

- 哑节点本身不要当成数据节点返回
- 原地交换要避免死循环：目标位置已经是正确值就停
- 第一行第一列既是数据又是标记时，先记下它们原来有没有 $0$
