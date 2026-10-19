#!/bin/sh
# Non-Slop installer: curl -fsSL https://raw.githubusercontent.com/Nonarkara/Non-Slop/main/install.sh | sh
# Downloads the repo, then runs `non-slop init` in the current folder. Never overwrites your files.
# Pass flags after `sh -s --`, e.g. ... | sh -s -- --no-hook
set -eu
REF="${NON_SLOP_REF:-main}"
command -v node >/dev/null 2>&1 || { echo "non-slop needs Node 18+ (https://nodejs.org)"; exit 1; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
curl -fsSL "https://codeload.github.com/Nonarkara/Non-Slop/tar.gz/$REF" | tar -xz -C "$TMP"
node "$TMP"/Non-Slop-*/bin/non-slop.mjs init . "$@"
