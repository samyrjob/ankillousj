#!/usr/bin/env bash
#
# Compiles a Java desktop application for the browser.
#
#   ./build.sh <source-root> [output-dir]
#
# <source-root> is the directory holding your packages — the one containing
# `main/`, `view/`, `model/` and so on. It is never modified: everything happens
# in a working copy.
#
# What comes out is `<output-dir>/web/`, containing the compiled JavaScript and
# an index.html that runs it.
#
# ── how it works ─────────────────────────────────────────────────────────────
#
#   1. copy your sources into work/
#   2. rewrite JDK imports onto the AnkillousJ runtime  (tools/port-imports.sh)
#   3. overlay replacements for files that cannot port  (overlay/)
#   4. add compile-time stand-ins for absent libraries  (thirdparty/)
#   5. compile everything with TeaVM
#
# Steps 3 and 4 are where the honesty lives: some things have no browser
# equivalent, and the overlay is the explicit list of them rather than a pile
# of silent failures.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:?usage: build.sh <source-root> [output-dir]}"
OUT="${2:-$HERE/build}"

if [ ! -d "$SRC" ]; then
  echo "no such directory: $SRC" >&2
  exit 1
fi

WORK="$OUT/work"
JAVA="$WORK/src/main/java"
RES="$WORK/src/main/resources"

echo "AnkillousJ"
echo "  source : $SRC"
echo "  output : $OUT"
echo

# ── 1. working copy ──────────────────────────────────────────────────────────
rm -rf "$WORK"
mkdir -p "$JAVA" "$RES"
cp -r "$SRC"/* "$JAVA"/
echo "1. copied $(find "$JAVA" -name '*.java' | wc -l | tr -d ' ') source files"

# ── 2. rewrite imports ───────────────────────────────────────────────────────
echo "2. rewriting JDK imports"
# invoked through bash so the script needs no execute bit
bash "$HERE/../awt/tools/port-imports.sh" "$JAVA" --apply | tail -1 | sed 's/^/   /'

# ── 3. the runtime and the overlay ───────────────────────────────────────────
cp -r "$HERE/runtime/src/main/java"/* "$JAVA"/
cp -r "$HERE/runtime/src/main/resources"/* "$RES"/
echo "3. added the AnkillousJ runtime"

# The overlay replaces files, so it is copied AFTER the sources.
overlaid=0
while IFS= read -r f; do
  rel="${f#"$HERE/overlay/"}"
  mkdir -p "$JAVA/$(dirname "$rel")"
  cp "$f" "$JAVA/$rel"
  overlaid=$((overlaid + 1))
  echo "   replaced $rel"
done < <(find "$HERE/overlay" -name '*.java')
echo "   $overlaid file(s) replaced"

# Anything else still importing javax.swing cannot compile. Report it rather
# than letting the build fail with a wall of unrelated errors.
remaining=$(grep -rl '^import javax\.swing' "$JAVA" --include='*.java' 2>/dev/null || true)
if [ -n "$remaining" ]; then
  echo
  echo "   These still use javax.swing and have no replacement in overlay/:"
  echo "$remaining" | sed "s#$JAVA/#     #"
  echo "   Add a replacement under overlay/ mirroring the same path."
  echo
fi

# ── 4. stand-ins for libraries with no browser form ──────────────────────────
cp -r "$HERE/thirdparty"/* "$JAVA"/ 2>/dev/null || true
echo "4. added third-party stand-ins"

# Project glue, if the developer has customised it.
if [ -d "$HERE/config" ]; then
  mkdir -p "$JAVA/ankillousj"
  cp "$HERE/config"/*.java "$JAVA/ankillousj/" 2>/dev/null || true
fi

# ── 5. compile ───────────────────────────────────────────────────────────────
cp "$HERE/pom.xml" "$WORK/pom.xml"
echo "5. compiling with TeaVM (this takes a minute)"
echo

if ! (cd "$WORK" && mvn -B -q process-classes 2>&1 | tee "$OUT/build.log" | grep -E '^\[ERROR\]' | head -30); then
  :
fi

if [ ! -s "$WORK/target/js/futura.js" ]; then
  echo
  echo "BUILD FAILED — see $OUT/build.log"
  echo
  echo "The two failure modes worth knowing:"
  echo "  'error:'             a source problem. Usually an import the rewrite"
  echo "                       missed, or a file needing an overlay replacement."
  echo "  'was not found'      TeaVM cannot link a JDK class. Its class library"
  echo "                       is not complete; the class needs a stand-in, or"
  echo "                       the code path that reaches it needs changing."
  exit 1
fi

mkdir -p "$OUT/web"
cp "$WORK/target/js/futura.js" "$OUT/web/"
cp "$HERE/index.html" "$OUT/web/" 2>/dev/null || true
printf '{ "type": "commonjs" }\n' > "$OUT/web/package.json"

size=$(du -h "$OUT/web/futura.js" | cut -f1)
echo
echo "BUILD SUCCESS"
echo "  $OUT/web/futura.js  ($size)"
echo
echo "Serve it:  npx serve $OUT/web"
echo
echo "Assets are not copied — put them where index.html expects, and set the"
echo "base in your entry point:"
echo "    Resources.setBase(\"assets\");"
echo "    ImageIO.setResourceBase(\"assets\");"
