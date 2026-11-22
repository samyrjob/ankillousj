#!/usr/bin/env bash
#
# The web build of Futura, in one command.
#
#   ./build-futura.sh [--if-changed] <Futura folder> [dev|prod] [version] [output-dir]
#
# Futura's game is two modules (client, shared) and two classes its release
# build stamps: config.BuildEnv (dev or prod addresses) and main.GameVersion.
# This gathers the first and writes the second, then hands everything to
# build.sh. Nothing in the Futura folder is modified.
#
#   dev    the game talks to http://localhost:9090 and localhost:5555 (default)
#   prod   the game talks to the public backend and game server
#
# version: what the game says it is (its release number). Read from the game's
# own build file when not given.
#
# --if-changed: for a build that starts by itself each time the game is built.
# It builds only when the game or this toolchain changed since the last build,
# never twice at once, and it ends on the game as it is now (see the end).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
IF_CHANGED=false
if [ "${1:-}" = "--if-changed" ]; then
  IF_CHANGED=true
  shift
fi
FUTURA="${1:?usage: build-futura.sh [--if-changed] <Futura folder> [dev|prod] [version] [output-dir]}"
ENVIRONMENT="${2:-dev}"
VERSION="${3:-}"
if [ "$VERSION" = "-" ]; then VERSION=""; fi   # "-": not given (an empty argument does not survive every shell)
OUT="${4:-$HERE/build}"

case "$ENVIRONMENT" in
  dev)  PRODUCTION=false ;;
  prod) PRODUCTION=true ;;
  *)    echo "dev or prod, not: $ENVIRONMENT" >&2; exit 1 ;;
esac

CLIENT="$FUTURA/Virtual_World/client/src/main/java"
SHARED="$FUTURA/Virtual_World/shared/src/main/java"
for d in "$CLIENT" "$SHARED"; do
  if [ ! -d "$d" ]; then
    echo "not a Futura folder (no $d)" >&2
    exit 1
  fi
done

if [ -z "$VERSION" ]; then
  # The build file says:   version = (findProperty("version") as String?) ... ?: "1.0.11-SNAPSHOT"
  # What a build without -Pversion gets is the literal after the ?: , a few lines down.
  GRADLE="$FUTURA/Virtual_World/build.gradle.kts"
  VERSION="$(grep -A4 -E '^[[:space:]]*version[[:space:]]*=' "$GRADLE" 2>/dev/null \
             | grep -oE '\?:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"([^"]+)"/\1/' || true)"
  if [ -z "$VERSION" ]; then
    VERSION="$(grep -oE '^[[:space:]]*version[[:space:]]*=[[:space:]]*"[^"]+"' "$GRADLE" 2>/dev/null \
               | head -1 | sed -E 's/.*"([^"]+)"/\1/' || true)"
  fi
  VERSION="${VERSION:-web}"
fi

# The two stamped classes, as the game's Gradle build writes them.
STAMP="$OUT/stamped"
rm -rf "$STAMP"
mkdir -p "$STAMP/config" "$STAMP/main"
cat > "$STAMP/config/BuildEnv.java" <<EOF
package config;

/** Written by AnkillousJ's build-futura.sh: the "$ENVIRONMENT" web build. */
public final class BuildEnv {
    public static final boolean PRODUCTION = $PRODUCTION;
    private BuildEnv() {}
}
EOF
cat > "$STAMP/main/GameVersion.java" <<EOF
package main;

/** Written by AnkillousJ's build-futura.sh. */
public final class GameVersion {
    public static final String VERSION = "$VERSION";
    private GameVersion() {}
}
EOF

echo "Futura web build: $ENVIRONMENT, version $VERSION"
if ! $IF_CHANGED; then
  exec bash "$HERE/build.sh" "$CLIENT,$SHARED,$STAMP" "$OUT"
fi

# ── only when something changed ──────────────────────────────────────────────
# A build that is started by itself must cost nothing when nothing changed, must never run twice
# at once, and must end on what the game is now, not on what it was when the build began.
# A build that fails leaves the last good web version in place: build.sh writes web/ last.

# What a build is made from: the game's sources and resources, this toolchain, and what is stamped in.
made_from() {
  {
    echo "$ENVIRONMENT $VERSION"
    for d in "$CLIENT" "$SHARED" "${CLIENT%/java}/resources" "${SHARED%/java}/resources" "$HERE/runtime" "$HERE/overlay" "$HERE/patches" "$HERE/config" "$HERE/thirdparty" "$HERE/../awt/tools"; do
      if [ -d "$d" ]; then
        (cd "$d" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 -r sha1sum)
      fi
    done
    (cd "$HERE" && sha1sum build.sh build-futura.sh format-port.pl json-check.pl pom.xml index.html 2>/dev/null) || true
  } | sha1sum | cut -d' ' -f1
}

LOCK="$OUT/.building"
mkdir -p "$OUT"
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  echo "A web build is already running. It builds again by itself if the game changed meanwhile."
  exit 0
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT

BUILT="$OUT/web/.built-from"
for round in 1 2 3; do
  NOW="$(made_from)"
  if [ -f "$OUT/web/futura.js" ] && [ "$(cat "$BUILT" 2>/dev/null)" = "$NOW" ]; then
    if [ "$round" = 1 ]; then
      echo "The web version is up to date: nothing changed in the game or in the toolchain."
    fi
    exit 0
  fi
  bash "$HERE/build.sh" "$CLIENT,$SHARED,$STAMP" "$OUT"
  echo "$NOW" > "$BUILT"
done
echo "The game changed during three builds in a row. The web version is built from the last one read."
