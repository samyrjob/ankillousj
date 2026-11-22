#!/usr/bin/env bash
#
# The web build of Futura, in one command.
#
#   ./build-futura.sh <Futura folder> [dev|prod] [version] [output-dir]
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
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
FUTURA="${1:?usage: build-futura.sh <Futura folder> [dev|prod] [version] [output-dir]}"
ENVIRONMENT="${2:-dev}"
VERSION="${3:-}"
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
exec bash "$HERE/build.sh" "$CLIENT,$SHARED,$STAMP" "$OUT"
