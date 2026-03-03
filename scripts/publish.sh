#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  MSG="${1:-update: $(date '+%Y-%m-%d %H:%M:%S')}"
  git add .
  git commit -m "$MSG"
else
  echo "No local changes to commit."
fi

git push origin main
echo "Done. Pushed to origin/main."
