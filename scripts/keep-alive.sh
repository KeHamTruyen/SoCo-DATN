#!/usr/bin/env bash
# Ping Render services so Free web dynos do not sleep after 15m idle.
set -euo pipefail

urls=(
  https://be-socomain.onrender.com/health
  https://be-socoadmin.onrender.com/health
  https://socomain.onrender.com
  https://socoadmin.onrender.com
)

for url in "${urls[@]}"; do
  echo "ping ${url}"
  curl -fsS --retry 2 --retry-all-errors --max-time 90 "${url}" >/dev/null
done
