#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-update: $(date '+%Y-%m-%d %H:%M:%S')}"
PROXY="${2:-${GIT_PUSH_PROXY:-}}"
MAX_RETRIES=3

run_git() {
  if [[ -n "$PROXY" ]]; then
    git -c "http.proxy=$PROXY" -c "https.proxy=$PROXY" "$@"
  else
    git "$@"
  fi
}

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "$MSG"
else
  echo "No local changes to commit."
fi

# Keep local main up to date before pushing to avoid non-fast-forward errors.
sync_attempt=1
synced=false
while (( sync_attempt <= MAX_RETRIES )); do
  echo "Sync attempt $sync_attempt/$MAX_RETRIES (pull --rebase) ..."
  if run_git fetch origin main && run_git pull --rebase origin main; then
    synced=true
    break
  fi
  ((sync_attempt++))
  sleep 2
done

if [[ "$synced" != "true" ]]; then
  echo "Sync failed after $MAX_RETRIES attempts."
  echo "Please resolve conflicts (if any), then run again."
  exit 1
fi

attempt=1
while (( attempt <= MAX_RETRIES )); do
  echo "Push attempt $attempt/$MAX_RETRIES ..."
  if run_git push origin main; then
    if [[ -n "$PROXY" ]]; then
      echo "Done. Pushed to origin/main (via proxy $PROXY)."
    else
      echo "Done. Pushed to origin/main."
    fi
    exit 0
  else
    echo "Push failed on this attempt."
  fi
  ((attempt++))
  sleep 2
done

echo "Push failed after $MAX_RETRIES attempts."
echo "Tip: bash scripts/publish.sh \"msg\" \"http://127.0.0.1:7890\""
exit 1
