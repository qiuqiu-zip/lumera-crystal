#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f ".env" ]]; then
  cp .env.example .env
  echo "未检测到 .env，已从 .env.example 自动创建。"
fi

echo "启动 Docker 全栈（postgres + logistics + app + frontend）..."
docker compose up -d --build

echo
echo "启动完成："
echo "- Frontend:  http://localhost:${FRONTEND_PORT:-3000}"
echo "- Backend:   http://localhost:${BACKEND_PORT:-8000}/docs"
echo "- Logistics: http://localhost:${LOGISTICS_PORT:-8010}/dashboard"
