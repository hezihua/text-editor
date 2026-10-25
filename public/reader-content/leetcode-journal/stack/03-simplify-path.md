---
title: 简化路径
description: 按 / 分割，栈处理 . 和 ..
date: 2026-09-03
number: 71
difficulty: medium
tags: [栈, 字符串]
---

## 题意

给定一个表示 Unix 风格绝对路径的字符串 `path`，将其转化为更加简洁的规范路径。

规则：

- `.` 表示当前目录
- `..` 表示上一级目录
- 多个连续 `/` 视为单个 `/`
- 其他格式（如 `...`）视为有效目录名

## 思路

- 按 `/` 分割路径
- 使用栈处理：
  - `""` 或 `"."` → 忽略
  - `".."` → 弹出栈顶（栈非空时）
  - 其他 → 入栈
- 最后用 `/` 拼接栈中内容

## 代码

```go
func simplifyPath(path string) string {
    parts := strings.Split(path, "/")
    stack := []string{}

    for _, part := range parts {
        if part == "" || part == "." {
            continue
        }
        if part == ".." {
            if len(stack) > 0 {
                stack = stack[:len(stack)-1]
            }
        } else {
            stack = append(stack, part)
        }
    }
    return "/" + strings.Join(stack, "/")
}
```

## 复杂度

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(n)$ |
| 空间 | $O(n)$ |
