#!/usr/bin/env bash
#
# Rewrites JDK imports onto the AnkillousJ shim packages, and back.
#
#   ./port-imports.sh <src-root>            preview
#   ./port-imports.sh <src-root> --apply    write
#   ./port-imports.sh <src-root> --revert   undo
#
# TeaVM reserves the java.* and javax.* namespaces for its own class library
# and will not load application classes from them, so the shims live in
# top-level packages and imports are rewritten to match.
#
# Both import statements *and* fully-qualified references are rewritten.
# Rewriting only imports leaves a file saying `import awt.Color` at the top and
# `java.awt.Color` in the body — two different types, and the memorable error
# "Color cannot be converted to Color".
#
# javax.swing is deliberately NOT mapped. Swing widgets have no canvas
# equivalent; those files want rebuilding as HTML, and failing loudly beats
# pretending.
set -euo pipefail

ROOT="${1:?usage: port-imports.sh <src-root> [--apply|--revert]}"
MODE="${2:-}"

# Longest prefix first: java.awt.geom must be rewritten before java.awt.
MAPPINGS="java.awt.geom awt.geom
java.awt.image awt.image
java.awt.event awt.event
java.awt.font awt.font
java.awt awt
javax.imageio imageio
javax.sound.sampled sound
java.net.http nethttp
java.security.spec security
java.security security
com.google.gson.internal.bind json
com.google.gson.internal json
com.google.gson json"

# Individually mapped, because their package is only partly shimmed.
CLASS_MAPPINGS="javax.swing.SwingUtilities swing.SwingUtilities
javax.swing.JOptionPane swing.JOptionPane
javax.swing.UIManager swing.UIManager
javax.swing.ImageIcon swing.ImageIcon
javax.swing.Timer swing.Timer
javax.swing.Icon swing.Icon
java.util.concurrent.CompletableFuture concurrent.CompletableFuture
java.util.concurrent.CompletionStage concurrent.CompletionStage
java.util.concurrent.ScheduledExecutorService concurrent.ScheduledExecutorService
java.util.concurrent.ExecutorService concurrent.ExecutorService
java.util.concurrent.ScheduledFuture concurrent.ScheduledFuture
java.util.concurrent.Executors concurrent.Executors
java.util.concurrent.Future concurrent.Future
java.util.concurrent.CopyOnWriteArrayList concurrent.CopyOnWriteArrayList
java.net.Socket net.Socket
System.exit ankillousj.Platform.exit"

REVERSE=no
[ "$MODE" = "--revert" ] && REVERSE=yes

SED_ARGS=()
while read -r jdk shim; do
  [ -z "$jdk" ] && continue
  if [ "$REVERSE" = yes ]; then from=$shim; to=$jdk; else from=$jdk; to=$shim; fi
  SED_ARGS+=(-e "s/\\b${from//./\\.}\\./${to}./g")
done <<< "$MAPPINGS"

while read -r jdk shim; do
  [ -z "$jdk" ] && continue
  if [ "$REVERSE" = yes ]; then from=$shim; to=$jdk; else from=$jdk; to=$shim; fi
  SED_ARGS+=(-e "s/\\b${from//./\\.}\\b/${to}/g")
done <<< "$CLASS_MAPPINGS"

# Wildcard imports defeat class-level mapping: `import java.util.concurrent.*`
# leaves CompletionStage resolving to the JDK's while the rest of the file uses
# ours, and javac reports it as the unhelpful
# "CompletionStage is not compatible with CompletionStage".
#
# The package cannot simply be remapped — TeaVM ships most of
# java.util.concurrent and only a handful of classes are shimmed. So an
# explicit import is inserted for each shimmed class the file actually uses,
# which takes precedence over the wildcard.
# format: <wildcard package>  <shim class>  <simple name>
WILDCARD_FIX='java.util.concurrent concurrent.CompletableFuture CompletableFuture
java.util.concurrent concurrent.CompletionStage CompletionStage
java.util.concurrent concurrent.ExecutorService ExecutorService
java.util.concurrent concurrent.ScheduledExecutorService ScheduledExecutorService
java.util.concurrent concurrent.Executors Executors
java.util.concurrent concurrent.ScheduledFuture ScheduledFuture
java.util.concurrent concurrent.ThreadFactory ThreadFactory
java.util.concurrent concurrent.CopyOnWriteArrayList CopyOnWriteArrayList
java.util.concurrent concurrent.Future Future
java.util.concurrent concurrent.ScheduledFuture ScheduledFuture
java.net net.Socket Socket
java.awt awt.Color Color
java.awt awt.Font Font
java.awt awt.Graphics2D Graphics2D
java.awt awt.Graphics Graphics
java.awt awt.Dimension Dimension
java.awt awt.Cursor Cursor
java.awt awt.Toolkit Toolkit
javax.swing swing.SwingUtilities SwingUtilities
javax.swing swing.JOptionPane JOptionPane
javax.swing swing.UIManager UIManager
javax.swing swing.ImageIcon ImageIcon
javax.swing swing.Timer Timer
javax.swing swing.Icon Icon'

fix_wildcards() {
  local file="$1"
  grep -qE '^import (java\.util\.concurrent|java\.net|java\.awt|javax\.swing)\.\*;' "$file" || return 0
  local pkg shim cls
  while read -r pkg shim cls; do
    [ -z "$pkg" ] && continue
    grep -q "^import ${pkg}\.\*;" "$file" || continue
    grep -q "^import ${shim};" "$file" && continue
    grep -qE "\b${cls}\b" "$file" || continue
    local pkg_re="${pkg//./\\.}"
    sed -i "0,/^import ${pkg_re}\.\*;/s||import ${shim};\nimport ${pkg}.*;|" "$file"
  done <<< "$WILDCARD_FIX"
}

# Rewrites that are not a simple name substitution.
extra_rewrites() {
  local f="$1"

  # Gson's TypeToken has no reflection-free equivalent. Dropping the import
  # makes the compiler point at the call site, which is where the decision has
  # to be made, instead of at a missing class.
  sed -i '/^import json\.reflect\.TypeToken;/d' "$f"
  sed -i '/^import com\.google\.gson\.reflect\.TypeToken;/d' "$f"

  # Classpath resources become HTTP fetches. The path itself is unchanged;
  # ankillousj.Resources.setBase(...) prefixes it at runtime.
  sed -i -E 's/[A-Za-z_][A-Za-z0-9_]*\.getClass\(\)\.getResourceAsStream\(/ankillousj.Resources.open(/g' "$f"
  sed -i -E 's/getClass\(\)\.getResourceAsStream\(/ankillousj.Resources.open(/g' "$f"
  sed -i -E 's/[A-Za-z_][A-Za-z0-9_]*\.class\.getResourceAsStream\(/ankillousj.Resources.open(/g' "$f"

  # A page cannot exit. See ankillousj.Platform.exit for what happens instead.
  sed -i -E 's/\bSystem\.exit\(/ankillousj.Platform.exit(/g' "$f"

  # Two methods TeaVM's own classes lack. A missing METHOD cannot be substituted the way a
  # missing class can (the class library's own class wins), so the call moves instead.
  # Runtime.maxMemory: a page has no fixed heap; ankillousj.Platform.maxMemory answers a budget.
  sed -i -E 's/\bRuntime\.getRuntime\(\)\.maxMemory\(\)/ankillousj.Platform.maxMemory()/g' "$f"
  # ConcurrentHashMap.newKeySet: the same set, from concurrent.KeySets. A type witness is kept.
  sed -i -E 's/\b(java\.util\.concurrent\.)?ConcurrentHashMap\.(<[^>()]*>)?newKeySet\(/concurrent.KeySets.\2newKeySet(/g' "$f"

  # A game panel is a JPanel only because Swing had nothing better. What it
  # actually is, is a canvas with a paint method — which is what awt.Component
  # provides. This is the single highest-value rewrite in the whole script:
  # while the panel is a Swing component, every class that touches it receives
  # java.awt types, and on Futura that one declaration accounted for twenty-one
  # compile errors on its own.
  #
  # Only classes that both extend JPanel and override paintComponent are
  # rewritten. A JPanel used as a container has no canvas equivalent and is
  # left alone, so it shows up in the javax.swing report instead.
  if grep -q 'extends JPanel' "$f" && grep -q 'paintComponent' "$f"; then
    sed -i -E 's/\bextends JPanel\b/extends awt.Component/' "$f"
    # First: drop the super call. It must go before the rename, or the rename
    # turns it into super.paint() and Component has no such override to chain.
    # Clearing is wrong anyway — a game panel fills every pixel itself.
    sed -i -E 's#^([[:space:]]*)super\.paintComponent\(.*\);#\1// super.paintComponent removed: this panel fills the canvas itself#' "$f"
    sed -i -E 's#^([[:space:]]*)super\.paint\(.*\);#\1// super.paint removed: this panel fills the canvas itself#' "$f"
    # Then the declaration, and any remaining call.
    sed -i -E 's/(public|protected)( void paintComponent\()/public\2/' "$f"
    sed -i -E 's/\bpaintComponent\(/paint(/g' "$f"
    sed -i '/^import javax\.swing\.JPanel;/d' "$f"
  fi

  # Fully-qualified javax.swing uses that no import rewrite would catch.
  sed -i -E 's/\bjavax\.swing\.(JOptionPane|UIManager|ImageIcon|Icon|Timer|SwingUtilities)\b/swing.\1/g' "$f"
}

changed=0
lines=0
while IFS= read -r f; do
  tmp=$(mktemp)
  sed "${SED_ARGS[@]}" "$f" > "$tmp"
  if ! cmp -s "$f" "$tmp"; then
    n=$(diff "$f" "$tmp" | grep -c '^<' || true)
    echo "  ${f#"$ROOT"/}  ${n} line(s)"
    changed=$((changed + 1)); lines=$((lines + n))
    if [ "$MODE" = "--apply" ] || [ "$MODE" = "--revert" ]; then
      mv "$tmp" "$f"
      if [ "$MODE" = "--apply" ]; then fix_wildcards "$f"; extra_rewrites "$f"; fi
    else
      rm -f "$tmp"
    fi
  else
    rm -f "$tmp"
    if [ "$MODE" = "--apply" ]; then fix_wildcards "$f"; extra_rewrites "$f"; fi
  fi
done < <(find "$ROOT" -name '*.java')

echo
echo "${changed} file(s), ${lines} line(s)"
[ "$MODE" = "--apply" ] || [ "$MODE" = "--revert" ] || echo "DRY RUN - add --apply to write"
