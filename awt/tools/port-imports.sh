#!/usr/bin/env bash
# Same rewrite as port-imports.ps1, for bash.
#   ./port-imports.sh <src-root>            preview
#   ./port-imports.sh <src-root> --apply    write
#   ./port-imports.sh <src-root> --revert   undo
set -euo pipefail
ROOT="${1:?usage: port-imports.sh <src-root> [--apply|--revert]}"
MODE="${2:-}"

if [[ "$MODE" == "--revert" ]]; then
  EXPR=(-e 's/^import awt\.geom\./import java.awt.geom./'
        -e 's/^import awt\.image\./import java.awt.image./'
        -e 's/^import awt\.event\./import java.awt.event./'
        -e 's/^import awt\./import java.awt./'
        -e 's/\bawt\.geom\./java.awt.geom./g'
        -e 's/\bawt\.image\./java.awt.image./g')
else
  EXPR=(-e 's/^import java\.awt\.geom\./import awt.geom./'
        -e 's/^import java\.awt\.image\./import awt.image./'
        -e 's/^import java\.awt\.event\./import awt.event./'
        -e 's/^import java\.awt\./import awt./'
        -e 's/\bjava\.awt\.geom\./awt.geom./g'
        -e 's/\bjava\.awt\.image\./awt.image./g'
        -e 's/\bjava\.awt\.\(Color\|Font\|Graphics2D\|Shape\|Rectangle\|Composite\|Paint\|Stroke\)\b/awt.\1/g'
        -e 's/^import javax\.swing\.SwingUtilities;/import swing.SwingUtilities;/'
        -e 's/^import java\.util\.concurrent\.\(Executors\|ExecutorService\|ScheduledExecutorService\|CompletableFuture\|CompletionStage\|ScheduledFuture\|Future\);/import concurrent.\1;/'
        -e 's/^import java\.net\.http\.\(HttpClient\|WebSocket\);/import nethttp.\1;/'
        -e 's/^import java\.time\.\(Duration\|Instant\|Clock\);/import time.\1;/'
        -e 's/^import javax\.imageio\.ImageIO;/import imageio.ImageIO;/'
        -e 's/\bjava\.net\.http\.\(HttpClient\|WebSocket\)\b/nethttp.\1/g'
        -e 's/\bjava\.time\.\(Duration\|Instant\|Clock\)\b/time.\1/g')
fi

n=0
while IFS= read -r f; do
  if [[ "$MODE" == "--apply" || "$MODE" == "--revert" ]]; then
    before=$(md5sum "$f" | cut -d' ' -f1)
    sed -i "${EXPR[@]}" "$f"
    after=$(md5sum "$f" | cut -d' ' -f1)
    [[ "$before" != "$after" ]] && { echo "  ${f#$ROOT/}"; n=$((n+1)); }
  else
    if sed "${EXPR[@]}" "$f" | diff -q - "$f" >/dev/null; then :; else
      echo "  ${f#$ROOT/}  $(sed "${EXPR[@]}" "$f" | diff - "$f" | grep -c '^<') line(s)"
      n=$((n+1))
    fi
  fi
done < <(find "$ROOT" -name '*.java')

echo
echo "$n file(s)"
[[ "$MODE" == "--apply" || "$MODE" == "--revert" ]] || echo "DRY RUN - add --apply to write"
