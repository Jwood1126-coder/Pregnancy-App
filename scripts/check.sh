#!/usr/bin/env bash
# Syntax gate: `node --check` every .js / .mjs file under app/, scripts/, test/.
# Exits nonzero if any file fails to parse. No dependencies, no network.

set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root" || exit 1

failed=0
checked=0

while IFS= read -r file; do
  checked=$((checked + 1))
  if ! output="$(node --check "$file" 2>&1)"; then
    failed=$((failed + 1))
    printf 'FAIL %s\n%s\n\n' "$file" "$output"
  fi
done < <(find app scripts test -type f \( -name '*.js' -o -name '*.mjs' \) | sort)

if [ "$checked" -eq 0 ]; then
  echo "check.sh: no JavaScript files found — expected app/, scripts/, test/ to contain some"
  exit 1
fi

if [ "$failed" -ne 0 ]; then
  printf 'check.sh: %d of %d file(s) failed node --check\n' "$failed" "$checked"
  exit 1
fi

printf 'check.sh: %d file(s) OK\n' "$checked"
