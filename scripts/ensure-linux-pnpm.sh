#!/usr/bin/env bash
set -euo pipefail

pnpm_path="$(command -v pnpm || true)"
if [[ -z "$pnpm_path" ]]; then
  echo "未找到 pnpm。请在 WSL 内执行: corepack enable && corepack prepare pnpm@11.24.0 --activate" >&2
  exit 1
fi

if [[ "$pnpm_path" == /mnt/c/* ]]; then
  echo "当前 pnpm 是 Windows 版: $pnpm_path" >&2
  echo "在 WSL 项目目录请不要用 Windows pnpm（会 EPERM/EISDIR）。" >&2
  echo "请新开终端或执行: source ~/.bashrc" >&2
  echo "确认: which pnpm 应指向 fnm/corepack 下的 Linux 路径。" >&2
  exit 1
fi
