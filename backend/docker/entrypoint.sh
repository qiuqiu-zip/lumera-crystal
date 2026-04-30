#!/usr/bin/env bash
set -euo pipefail

DB_WAIT_TIMEOUT="${DB_WAIT_TIMEOUT:-60}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
SYNC_ADMIN_ON_START="${SYNC_ADMIN_ON_START:-0}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[backend] waiting for database..."
  python - <<'PY'
import os
import socket
import time
from urllib.parse import urlparse

url = os.environ.get("DATABASE_URL", "")
timeout = int(os.environ.get("DB_WAIT_TIMEOUT", "60"))

parsed = urlparse(url.replace("+psycopg", ""))
host = parsed.hostname or "postgres"
port = parsed.port or 5432

start = time.time()
while True:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"[backend] database is ready at {host}:{port}")
            break
    except OSError:
        if time.time() - start > timeout:
            raise SystemExit(f"[backend] timeout waiting for database {host}:{port}")
        time.sleep(1)
PY
fi

if [[ "$RUN_MIGRATIONS" == "1" ]]; then
  echo "[backend] running migrations..."
  alembic upgrade head
fi

if [[ "$SYNC_ADMIN_ON_START" == "1" ]]; then
  echo "[backend] syncing admin credentials from env..."
  python scripts/sync_admin_credentials.py
fi

echo "[backend] starting app..."
exec "$@"
