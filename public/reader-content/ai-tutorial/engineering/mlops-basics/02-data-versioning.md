---
title: "数据版本管理"
description: "使用 DVC 等工具对训练数据进行版本控制，实现实验可复现。"
date: "2025-07-08"
tags: ["MLOps", "DVC", "版本控制"]
course: "MLOps 基础"
lecture: 2
---

> **课程来源**：AI 工程化实战笔记
> **影片链接**：待补充
> **投影片**：待补充

## 一、为什么要做数据版本

在机器学习项目中，数据往往会经历多轮迭代：特征增加、样本修正、标注更新。如果没有版本控制，我们将面临：

- 无法定位"某个模型版本使用了哪份数据"
- 多人协作时的数据相互覆盖
- 线上问题难以回溯

## 二、DVC 基础用法

DVC（Data Version Control）是目前最主流的数据版本管理工具，与 Git 深度集成。

### 1. 初始化项目

```bash
git init
dvc init
```

### 2. 添加数据

```bash
dvc add data/train.csv
# 会生成 data/train.csv.dvc 元信息文件
git add data/train.csv.dvc
git commit -m "add training data"
```

### 3. 切换数据版本

```bash
git checkout <commit-hash>
dvc checkout
```

DVC 会根据 `.dvc` 文件中记录的哈希值，自动从远端存储拉取对应版本的大文件。

## 三、远端存储配置

```bash
dvc remote add -d myremote s3://my-bucket/dvc-store
dvc push
```

支持的远端类型包括：S3、GCS、Azure Blob、NAS、WebDAV 等。

## 四、与训练流水线集成

在 CI/CD 中，典型的工作流是：

1. `dvc pull` 拉取指定版本数据
2. 执行训练脚本
3. `dvc repro` 自动判断是否需要重跑下游步骤
4. 将模型产物登记到模型注册中心

## 五、小结

数据版本化是 MLOps 的地基。没有可复现的数据版本，后续的实验追踪、模型部署、线上诊断都无从谈起。
