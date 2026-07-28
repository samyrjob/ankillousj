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
java.time time"

# Individually mapped, because their package is only partly shimmed.
CLASS_MAPPINGS="javax.swing.SwingUtilities swing.SwingUtilities
java.util.concurrent.CompletableFuture concurrent.CompletableFuture
java.util.concurrent.CompletionStage concurrent.CompletionStage
java.util.concurrent.ScheduledExecutorService concurrent.ScheduledExecutorService
java.util.concurrent.ExecutorService concurrent.ExecutorService
java.util.concurrent.ScheduledFuture concurrent.ScheduledFuture
java.util.concurrent.Executors concurrent.Executors
java.util.concurrent.Future concurrent.Future
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
java.net net.Socket Socket
java.awt awt.Color Color
java.awt awt.Font Font
java.awt awt.Graphics2D Graphics2D
java.awt awt.Graphics Graphics
java.awt awt.Dimension Dimension
java.awt awt.Cursor Cursor
java.awt awt.Toolkit Toolkit'

fix_wildcards() {
  local file="$1"
  grep -qE '^import (java\.util\.concurrent|java\.net|java\.awt)\.\*;' "$file" || return 0
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
      [ "$MODE" = "--apply" ] && fix_wildcards "$f"
    else
      rm -f "$tmp"
    fi
  else
    rm -f "$tmp"
    [ "$MODE" = "--apply" ] && fix_wildcards "$f"
  fi
done < <(find "$ROOT" -name '*.java')

echo
echo "${changed} file(s), ${lines} line(s)"
[ "$MODE" = "--apply" ] || [ "$MODE" = "--revert" ] || echo "DRY RUN - add --apply to write"
