#!/usr/bin/env bash
# Reproduces the integration compile. Point SRC at the game sources.
#
#   ./build.sh ../../virtual_world_sources
set -euo pipefail
SRC="${1:?usage: build.sh <game-source-root>}"
SHIM="$(cd "$(dirname "$0")/../awt/src/main/java" && pwd)"
GSON="${GSON_JAR:?set GSON_JAR to the gson jar}"
TEAVM="${TEAVM_JARS:?set TEAVM_JARS to teavm-jso-apis.jar:teavm-interop.jar}"

rm -rf work && cp -r "$SRC" work

echo "== porting =="
"$(dirname "$0")/../awt/tools/port-imports.sh" work --apply | tail -2

echo
echo "== compiling against the shims =="
javac -nowarn -Xmaxerrs 10000 -encoding UTF-8 \
  -cp "$GSON:$TEAVM" -d out \
  $(find work stubs -name '*.java' 2>/dev/null) \
  $(find "$SHIM"/awt "$SHIM"/concurrent "$SHIM"/swing "$SHIM"/nethttp \
         "$SHIM"/time "$SHIM"/imageio "$SHIM"/sound "$SHIM"/security "$SHIM"/net \
         -name '*.java') \
  2>&1 | grep 'error:' > errors.txt || true

total=$(wc -l < errors.txt)
grep -rl '^import javax\.swing' work > swing-files.txt || true
real=$(grep -vFf swing-files.txt errors.txt | wc -l)
echo "  total: $total"
echo "  swing files (out of scope): $((total - real))"
echo "  genuine: $real"
