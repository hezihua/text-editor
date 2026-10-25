---
title: 快慢指针
description: 同一方向不同步长，找中点、环、倒数第 k 个
date: 2026-08-31
tags: [常用算法, 双指针, 链表]
---

## 什么时候用

两条指针走**同一方向**，速度不同（或一先一后）。链表上最常见：一次遍历得到「相对位置」，不必先数长度。

典型信号：找中点、判断环、环入口、倒数第 $k$ 个、删除倒数节点。

## 模板：找中点

快指针一次两步，慢指针一次一步。快到尾时，慢在中点。

```go
func middleNode(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    return slow
}
```

偶数个节点时，这样拿到的是**靠右**的中点。要靠左中点，改成 `fast.Next != nil && fast.Next.Next != nil`，或另用 `prev` 记下慢指针前驱。

[109 有序链表转 BST](/topics/linked-list/convert-sorted-list-to-bst) 就是每次取中点当根，还要用 `prev` 断开左半段。

## 模板：倒数第 k 个 / 删除

快指针先走 $k$ 步（删除时走 $k+1$，为了停在前驱），再一起走。快到 `nil` 时，慢在目标或目标前驱。

```go
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    fast, slow := dummy, dummy
    for i := 0; i <= n; i++ {
        fast = fast.Next
    }
    for fast != nil {
        fast, slow = fast.Next, slow.Next
    }
    slow.Next = slow.Next.Next
    return dummy.Next
}
```

见 [19 删除倒数第 N 个](/topics/linked-list/remove-nth-node-from-end)。先走几步一定要画清楚：要的是节点本身还是前驱。

## 模板：环

快慢都从头走，能相遇则有环。求入口：相遇后一指针回头，另一次一步，再次相遇即入口（Floyd）。

```go
func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true
        }
    }
    return false
}
```

## 数组上的快慢指针

同一数组里也可以：慢指针写、快指针读。原地去重、移动零、移除元素都是「快扫慢写」，时间 $O(n)$，空间 $O(1)$。

```go
func removeDuplicates(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    slow := 0
    for fast := 1; fast < len(nums); fast++ {
        if nums[fast] != nums[slow] {
            slow++
            nums[slow] = nums[fast]
        }
    }
    return slow + 1
}
```

和 [83 删除排序链表重复](/topics/linked-list/remove-duplicates-from-sorted-list) 是同一思想，只是载体从数组换成链表。

## 注意

- 快指针每次两步，循环条件必须写 `fast != nil && fast.Next != nil`，否则空指针
- 要前驱时另开 `prev`，或快指针多走一步
- 和**对撞指针**不同：对撞是两端往中间；快慢是同向不同速
