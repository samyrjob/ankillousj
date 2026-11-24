#!/usr/bin/env bash
#
# Compiles a Java desktop application for the browser.
#
#   ./build.sh --project <dir> <source-root>[,<source-root>...] [output-dir]
#   ./build.sh --fingerprint
#
# <source-root> is the directory holding your packages — the one containing
# `main/`, `view/`, `model/` and so on. A program made of several modules gives
# them all, separated by commas: they are compiled as one. Nothing given is ever
# modified: everything happens in a working copy.
#
# --project <dir> is the application's AnkillousJ project: the folder where the
# application keeps what it needs to run in a browser, beside its own code.
# It is required: the toolchain holds no application's files of its own.
# Everything in it is optional except the conf:
#
#   overlay/            files that replace or add program files
#   thirdparty/         compile-time stand-ins for libraries with no browser form
#   patches/            unified diffs against the ported sources, applied exactly
#   json-not-read.txt   what json-check.pl is to leave alone (one name a line)
#   page/               copied as it is into <output-dir>/web/, beside the JS
#   ankillousj.conf     key=value lines: main (the main class), js (the JS file)
#
# --fingerprint prints one sha1 of the toolchain's own inputs (runtime/, the
# import rewrite, this script, the checks, pom.xml) and nothing else: a project
# compares it to tell that the toolchain changed without knowing its insides.
#
# What comes out is `<output-dir>/web/`: the compiled JavaScript, the page that
# runs it, and `assets/` — the resources of each source root laid out the
# usual way (`.../src/main/java` beside `.../src/main/resources`), or the
# folders named in ANKILLOUSJ_ASSETS (commas between them).
#
# ── how it works ─────────────────────────────────────────────────────────────
#
#   1. copy your sources into work/
#   2. rewrite JDK imports onto the AnkillousJ runtime  (tools/port-imports.sh)
#   3. overlay replacements for files that cannot port  (the project's overlay/)
#   4. add compile-time stand-ins for absent libraries  (the project's thirdparty/)
#   5. compile everything with TeaVM
#
# Steps 3 and 4 are where the honesty lives: some things have no browser
# equivalent, and the overlay is the explicit list of them rather than a pile
# of silent failures.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
USAGE='usage: build.sh --project <dir> <source-root>[,<source-root>...] [output-dir]
       build.sh --fingerprint'

# ── the toolchain's fingerprint ──────────────────────────────────────────────
# What a build of any project depends on in the toolchain itself. A project's own folder is
# not in it: the project hashes that itself, with its sources.
if [ "${1:-}" = --fingerprint ]; then
  if [ "$#" -ne 1 ]; then
    echo "$USAGE" >&2
    exit 1
  fi
  # A toolchain with a piece missing has no fingerprint: a hash of what is left would look
  # like a real one.
  for f in runtime ../awt/tools build.sh format-port.pl json-check.pl pom.xml; do
    if [ ! -e "$HERE/$f" ]; then
      echo "the toolchain is incomplete, no $HERE/$f" >&2
      exit 1
    fi
  done
  {
    for d in runtime ../awt/tools; do
      echo "$d"
      (cd "$HERE/$d" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 -r sha1sum)
    done
    (cd "$HERE" && sha1sum build.sh format-port.pl json-check.pl pom.xml)
  } | sha1sum | cut -d' ' -f1
  exit 0
fi

# The project is required. An application's overlay, patches, page and JSON exemptions belong
# to the application, so a build that quietly went on without them would produce a program
# that compiles and then fails in the tab.
if [ "${1:-}" != --project ]; then
  echo "$USAGE" >&2
  echo "An application's browser adaptation lives in its own project folder: name it with --project." >&2
  exit 1
fi
if [ -z "${2:-}" ]; then
  echo "$USAGE" >&2
  exit 1
fi
if [ ! -d "$2" ]; then
  echo "no such project directory: $2" >&2
  exit 1
fi
PROJECT="$(cd "$2" && pwd)"
shift 2

SRC="${1:?$USAGE}"
OUT="${2:-$HERE/build}"

# ── where the application's browser adaptation is read from ──────────────────
# Set once here; nothing below names any other folder for these.
CONF="$PROJECT/ankillousj.conf"
if [ ! -f "$CONF" ]; then
  echo "the project has no ankillousj.conf: $CONF" >&2
  echo "It names the main class and the JS file, one key=value a line:" >&2
  echo "  main=main.BrowserMain" >&2
  echo "  js=app.js" >&2
  exit 1
fi
# One key of the conf: "#" starts a comment, spaces around the key and the value do not
# count, a Windows line end neither. Empty when the key is not there.
conf_get() {
  local line k v
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="${line//$'\r'/}"
    case "$line" in *=*) ;; *) continue ;; esac
    k="${line%%=*}"
    v="${line#*=}"
    k="${k#"${k%%[![:space:]]*}"}"; k="${k%"${k##*[![:space:]]}"}"
    v="${v#"${v%%[![:space:]]*}"}"; v="${v%"${v##*[![:space:]]}"}"
    if [ "$k" = "$1" ]; then
      printf '%s' "$v"
      return 0
    fi
  done < "$CONF"
  return 0
}
MAIN="$(conf_get main)"
JS="$(conf_get js)"
for key in main js; do
  if [ -z "$(conf_get "$key")" ]; then
    echo "ankillousj.conf does not say $key=...: $CONF" >&2
    echo "  main = the fully qualified main class (main.BrowserMain), js = the JS file (app.js)" >&2
    exit 1
  fi
done
OVERLAY="$PROJECT/overlay"
THIRDPARTY="$PROJECT/thirdparty"
PATCHES="$PROJECT/patches"
NOT_READ="$PROJECT/json-not-read.txt"
PAGE="$PROJECT/page"

# Both go into pom.xml as they are, and the JS name becomes a file name: nothing else gets
# through, so a stray character cannot turn into a broken pom or a file somewhere else.
CLASS_NAME='^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$'
JS_NAME='^[A-Za-z0-9_][A-Za-z0-9_.-]*\.js$'
if ! [[ "$MAIN" =~ $CLASS_NAME ]]; then
  echo "the main class is not a Java class name: $MAIN" >&2
  exit 1
fi
if ! [[ "$JS" =~ $JS_NAME ]]; then
  echo "the JS file is not a plain file name ending in .js: $JS" >&2
  exit 1
fi

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
echo "  project: $PROJECT   ($MAIN -> $JS)"
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
# The runtime is added BESIDE the program, never over it. A runtime file with the path of a
# program file would take its place without a word, and the program's own file, with whatever
# changed in it since, would never reach the build. (Three of Futura's sound classes sat in the
# runtime folder for months: the game's package is named "sound", as the runtime's is.) What
# replaces a program file goes in the overlay, where the build names it.
hidden="$(cd "$HERE/runtime/src/main/java" && find . -name '*.java' | sed 's|^\./||' | while IFS= read -r f; do
  if [ -f "$JAVA/$f" ]; then echo "     $f"; fi
done)"
if [ -n "$hidden" ]; then
  echo
  echo "   THE RUNTIME HIDES A FILE OF THE PROGRAM:"
  printf '%s\n' "$hidden"
  echo "   The program's own file would be dropped. What replaces a program file belongs in"
  echo "   $OVERLAY/; anything else is to be taken out of runtime/."
  exit 1
fi
cp -r "$HERE/runtime/src/main/java"/* "$JAVA"/
cp -r "$HERE/runtime/src/main/resources"/* "$RES"/
echo "3. added the AnkillousJ runtime"

# The overlay replaces files, so it is copied AFTER the sources.
overlaid=0
if [ -d "$OVERLAY" ]; then
  while IFS= read -r f; do
    rel="${f#"$OVERLAY/"}"
    mkdir -p "$JAVA/$(dirname "$rel")"
    cp "$f" "$JAVA/$rel"
    overlaid=$((overlaid + 1))
    echo "   replaced $rel"
  done < <(find "$OVERLAY" -name '*.java')
fi
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
  echo "   These still use javax.swing and have no replacement in $OVERLAY/:"
  echo "$remaining" | sed "s#$JAVA/#     #"
  echo "   Add a replacement under $OVERLAY/ mirroring the same path."
  echo
fi

# ── 4. stand-ins for libraries with no browser form ──────────────────────────
standins=0
if [ -d "$THIRDPARTY" ]; then
  standins=$(find "$THIRDPARTY" -name '*.java' | wc -l | tr -d ' ')
fi
if [ "$standins" -gt 0 ]; then
  cp -r "$THIRDPARTY"/* "$JAVA"/
  echo "4. added third-party stand-ins ($standins files)"
else
  echo "4. no third-party stand-in needed"
fi

# ── 5. compile ───────────────────────────────────────────────────────────────
# Patches: a few lines of one file changed for the browser, where replacing the whole file
# (the overlay) would mean keeping a copy of it up to date. Each is a unified diff against the
# PORTED source. One that no longer applies stops the build: the source moved on, and the
# patch is to be brought up to its new text.
if [ -d "$PATCHES" ]; then
  patched=0
  while IFS= read -r p; do
    if ! (cd "$JAVA" && patch -p1 --forward --no-backup-if-mismatch --fuzz=0 -l < "$p" > "$OUT/patch.log" 2>&1); then
      echo
      echo "   A PATCH DOES NOT APPLY: ${p#"$PROJECT/"}"
      sed 's/^/     /' "$OUT/patch.log"
      echo "   The source it changes has moved on. Bring the patch up to the new text."
      exit 1
    fi
    patched=$((patched + 1))
    echo "   patched ${p#"$PATCHES/"}"
  done < <(find "$PATCHES" -name '*.patch' | sort)
  [ "$patched" -gt 0 ] && echo "   $patched patch(es) applied"
fi

# Format strings. TeaVM's formatter knows fewer conversions than the JDK's, and says so only
# when the line runs: a %n in a line printed from the drawing left a room black. %n is
# rewritten here, in the working copy; any other conversion the formatter does not know stops
# the build. After the patches, which are written against the text as the program has it.
# format-port.pl says what it reads, and how.
if command -v perl >/dev/null 2>&1; then
  perl "$HERE/format-port.pl" "$JAVA" || exit 1
else
  echo "   (no perl here: format strings are not checked)"
fi

# What the program hands to its JSON library is checked before anything is compiled: a type
# with no reader or writer, a field its reader does not read. None of it fails at the build
# by itself (nothing looks inside a class here): it fails in the tab, or says nothing and
# leaves a field empty. json-check.pl says what it looks for, and how. A project with no
# json-not-read.txt exempts nothing: json-check.pl reads the file only when it is there.
if command -v perl >/dev/null 2>&1; then
  perl "$HERE/json-check.pl" "$JAVA" "$NOT_READ" || exit 1
else
  echo "   (no perl here: what is read and written as JSON is not checked)"
fi

# The main class and the JS file are pom.xml properties: they are written into the working
# copy's pom, so that mvn run by hand in work/ builds the same thing as this script.
sed -e "s|<ankillousj.main>[^<]*</ankillousj.main>|<ankillousj.main>$MAIN</ankillousj.main>|" \
    -e "s|<ankillousj.js>[^<]*</ankillousj.js>|<ankillousj.js>$JS</ankillousj.js>|" \
    "$HERE/pom.xml" > "$WORK/pom.xml"
if ! grep -q "<ankillousj.main>$MAIN</ankillousj.main>" "$WORK/pom.xml" \
   || ! grep -q "<ankillousj.js>$JS</ankillousj.js>" "$WORK/pom.xml"; then
  echo "   pom.xml has no <ankillousj.main> or <ankillousj.js> property to write: $HERE/pom.xml" >&2
  exit 1
fi

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

if [ ! -s "$WORK/target/js/$JS" ]; then
  echo
  echo "BUILD FAILED — see $OUT/build.log   (no $JS was produced)"
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
cp "$WORK/target/js/$JS" "$OUT/web/"
if [ -d "$PAGE" ]; then
  cp -r "$PAGE"/. "$OUT/web"/
fi
printf '{ "type": "commonjs" }\n' > "$OUT/web/package.json"

size=$(du -h "$OUT/web/$JS" | cut -f1)
echo
echo "BUILD SUCCESS"
echo "  $OUT/web/$JS  ($size)"
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
if [ -f "$OUT/web/index.html" ]; then
  echo "Try it:  node $HERE/serve.mjs $OUT/web      then open http://localhost:8080/"
else
  echo "No page came with the build: an index.html that loads $JS goes in the project's page/."
fi
