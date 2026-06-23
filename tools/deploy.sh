#!/usr/bin/env bash
# Validate app.html, then commit + push it to the GitHub Pages deploy repo
# (haleoworld/jmc, branch main). app.html is the ONLY file published.
#
# Usage: tools/deploy.sh "commit message"
#        tools/deploy.sh            # uses a default message
set -euo pipefail

cd "$(dirname "$0")/.."

MSG="${1:-Update app.html}"

echo "▶ Validating app.html…"
node tools/validate.js

if git diff --quiet -- app.html && git diff --cached --quiet -- app.html; then
  echo "▶ No changes to app.html — nothing to deploy."
  exit 0
fi

echo "▶ Committing & pushing…"
git add app.html
git commit -m "$MSG" -m "🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" >/dev/null
git push origin main

SHA=$(git rev-parse --short HEAD)
echo "✓ Deployed $SHA → https://haleoworld.github.io/jmc/app.html"
echo "  (GitHub Pages rebuilds in ~30s)"
