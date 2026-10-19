#!/bin/sh
# Non-Slop installer: curl -fsSL https://raw.githubusercontent.com/Nonarkara/Non-Slop/main/install.sh | sh
# Downloads the repo, then runs `non-slop init` in the current folder. Never overwrites your files.
# Pass flags after `sh -s --`, e.g. ... | sh -s -- --no-hook
set -eu
REF="${NON_SLOP_REF:-main}"
case "$REF" in
  *..*) echo "non-slop: refusing NON_SLOP_REF (contains ..)" >&2; exit 1 ;;
  *[!A-Za-z0-9._/-]*) echo "non-slop: refusing NON_SLOP_REF" >&2; exit 1 ;;
esac
command -v node >/dev/null 2>&1 || { echo "non-slop needs Node 18+ (https://nodejs.org)" >&2; exit 1; }
major=$(node -p "process.versions.node.split('.')[0]")
if [ "$major" -lt 18 ]; then echo "non-slop needs Node 18+ (found $(node -v)). https://nodejs.org" >&2; exit 1; fi
command -v curl >/dev/null 2>&1 || { echo "non-slop needs curl" >&2; exit 1; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
# Save the tarball first so a failed download cannot be fed to tar.
curl -fsSL "https://codeload.github.com/Nonarkara/Non-Slop/tar.gz/$REF" -o "$TMP/src.tgz"
tar -xz -f "$TMP/src.tgz" -C "$TMP"
found=""
for d in "$TMP"/Non-Slop-*; do
  if [ -f "$d/bin/non-slop.mjs" ]; then found=$d; break; fi
done
if [ -z "$found" ]; then echo "non-slop: download did not contain the scanner" >&2; exit 1; fi
node "$found/bin/non-slop.mjs" init . "$@"
