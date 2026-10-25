---
title: 字母异位词分组
description: 排序或计数作为哈希键
date: 2026-08-30
number: 49
difficulty: medium
tags: [哈希表, 字符串]
---

## 题意

给一组字符串，把互为字母异位词的分到同一组。字母异位词：字母相同、顺序可以不同。

## 思路

异位词的「签名」相同。两种常用签名：

1. 把字符串排序后当 key
2. 统计 26 个字母出现次数，拼成 key

同一 key 丢进同一个桶。排序写法短，计数写法在短串上更快。

## 代码

```ts
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const s of strs) {
    const key = [...s].sort().join("");
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(s);
    } else {
      groups.set(key, [s]);
    }
  }

  return [...groups.values()];
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(nk\log k)$，$k$ 为最长串长度 |
| 空间 | $O(nk)$ |

## 复盘

- 分组题先想「什么是等价类，怎么编码」
- 同类题：49、242、438
