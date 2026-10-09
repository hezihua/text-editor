#!/usr/bin/env bash
# 将 .env.local 中的变量同步到已 link 的 Vercel 项目（Production / Preview / Development）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${1:-.env.local}"
TARGETS="production,preview,development"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "找不到 $ENV_FILE"
  exit 1
fi

if ! pnpm dlx vercel@latest whoami >/dev/null 2>&1; then
  echo "未登录 Vercel，请先执行："
  echo "  pnpm dlx vercel login"
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "正在关联 Vercel 项目（请在提示中选择 text-editor）…"
  pnpm dlx vercel@latest link
fi

echo "从 $ENV_FILE 同步到 Vercel（$TARGETS）…"

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line#"${line%%[![:space:]]*}"}"
  [[ -z "$line" || "$line" == \#* ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  key="${key%"${key##*[![:space:]]}"}"
  value="${value#"${value%%[![:space:]]*}"}"
  # 去掉可选引号
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  if [[ -z "$key" ]]; then
    continue
  fi

  echo "→ $key"
  pnpm dlx vercel@latest env rm "$key" -y 2>/dev/null || true
  printf '%s' "$value" | pnpm dlx vercel@latest env add "$key" "$TARGETS"
done <"$ENV_FILE"

echo "完成。可在 Dashboard → Settings → Environment Variables 确认。"
echo "建议重新部署一次 Production 使运行时生效：pnpm dlx vercel --prod"
