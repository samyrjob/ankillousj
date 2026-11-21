#!/usr/bin/env bash
#
# Compiles a Java desktop application for the browser.
#
#   ./build.sh <source-root>[,<source-root>...] [output-dir]
#
# <source-root> is the directory holding your packages — the one containing
# `main/`, `view/`, `model/` and so on. A program made of several modules gives
# them all, separated by commas: they are compiled as one. Nothing given is ever
# modified: everything happens in a working copy.
#
# What comes out is `<output-dir>/web/`: the compiled JavaScript, an index.html
# that runs it, and `assets/` — the resources of each source root laid out the
# usual way (`.../src/main/java` beside `.../src/main/resources`), or the
# folders named in ANKILLOUSJ_ASSETS (commas between them).
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
SRC="${1:?usage: build.sh <source-root>[,<source-root>...] [output-dir]}"
OUT="${2:-$HERE/build}"

IFS=',' read -r -a SOURCES <<< "$SRC"
for s in "${SOURCES[@]}"; do
  if [ ! -d "$s" ]; then
    echo "no such directory: $s" >&2
    exit 1
  fi
done

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
for s in "${SOURCES[@]}"; do
  cp -r "$s"/* "$JAVA"/
done
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
# A file that names a Swing class in an import, or that keeps the wildcard import AND still
# uses a widget. (A panel the port turned into a canvas keeps its wildcard import with nothing
# left behind it: that is not a file to replace.)
WIDGETS='JFrame|JDialog|JWindow|JPanel|JButton|JLabel|JTextField|JTextArea|JPasswordField|JScrollPane|JComponent|JMenu|JMenuBar|JMenuItem|JPopupMenu|JCheckBox|JRadioButton|JComboBox|JList|JTable|JTree|JSlider|JSpinner|JProgressBar|JTabbedPane|JSplitPane|JToolBar|JFileChooser|JColorChooser|JLayeredPane|BorderFactory|SwingConstants|KeyStroke|AbstractAction|BoxLayout|GroupLayout'
named=$(grep -rlE '^import javax\.swing\.[A-Za-z]' "$JAVA" --include='*.java' 2>/dev/null || true)
wild=$(grep -rlE '^import javax\.swing\.\*;' "$JAVA" --include='*.java' 2>/dev/null | xargs -r grep -lE "\b($WIDGETS)\b" 2>/dev/null || true)
remaining=$(printf '%s\n' "$named" "$wild" | sed '/^$/d' | sort -u)
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
# Patches: a few lines of one file changed for the browser, where replacing the whole file
# (overlay/) would mean keeping a copy of it up to date. Each is a unified diff against the
# PORTED source. One that no longer applies stops the build: the source moved on, and the
# patch is to be brought up to its new text.
if [ -d "$HERE/patches" ]; then
  patched=0
  while IFS= read -r p; do
    if ! (cd "$JAVA" && patch -p1 --forward --no-backup-if-mismatch -l < "$p" > "$OUT/patch.log" 2>&1); then
      echo
      echo "   A PATCH DOES NOT APPLY: ${p#"$HERE/"}"
      sed 's/^/     /' "$OUT/patch.log"
      echo "   The source it changes has moved on. Bring the patch up to the new text."
      exit 1
    fi
    patched=$((patched + 1))
    echo "   patched ${p#"$HERE/patches/"}"
  done < <(find "$HERE/patches" -name '*.patch' | sort)
  [ "$patched" -gt 0 ] && echo "   $patched patch(es) applied"
fi

cp "$HERE/pom.xml" "$WORK/pom.xml"

# ANKILLOUSJ_PREPARE_ONLY=1 stops here: the working copy is ready (sources ported, runtime and
# replacements in place), for a compile by hand or a look at what the port produced.
if [ "${ANKILLOUSJ_PREPARE_ONLY:-}" = 1 ]; then
  echo "prepared: $WORK"
  exit 0
fi
echo "5. compiling with TeaVM (this takes a minute)"
echo

# Maven when it is installed; else the wrapper beside this script, which fetches it once.
if command -v mvn >/dev/null 2>&1; then MVN=mvn; else MVN="$HERE/mvnw"; fi
if ! (cd "$WORK" && "$MVN" -B -q process-classes 2>&1 | tee "$OUT/build.log" | grep -E '^\[ERROR\]' | head -30); then
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
# Assets: what the program reads from its classpath, served beside the page.
ASSET_DIRS=()
if [ -n "${ANKILLOUSJ_ASSETS:-}" ]; then
  IFS=',' read -r -a ASSET_DIRS <<< "$ANKILLOUSJ_ASSETS"
else
  for s in "${SOURCES[@]}"; do
    [ -d "$s/../resources" ] && ASSET_DIRS+=("$s/../resources")
  done
fi
copied=0
for a in "${ASSET_DIRS[@]:-}"; do
  [ -n "$a" ] && [ -d "$a" ] || continue
  mkdir -p "$OUT/web/assets"
  cp -r "$a"/. "$OUT/web/assets"/
  copied=$((copied + 1))
done
if [ "$copied" -gt 0 ]; then
  echo "  $OUT/web/assets  ($(find "$OUT/web/assets" -type f | wc -l | tr -d ' ') files, from $copied folder(s))"
else
  echo "  No assets were found to copy. Put them in $OUT/web/assets,"
  echo "  or name their folders in ANKILLOUSJ_ASSETS."
fi
echo
echo "Try it:  node $HERE/serve.mjs $OUT/web      then open http://localhost:8080/"
