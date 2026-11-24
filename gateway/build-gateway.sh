#!/usr/bin/env bash
#
# Builds the gateway as one runnable jar.
#
#   bash build-gateway.sh [output-dir]
#
# Makes <output-dir>/ankillous-gateway.jar; <output-dir> defaults to dist/
# beside this script. Only the JDK is used (javac and jar, 17 or later), and
# the jar needs nothing beside it:
#
#   java -jar ankillous-gateway.jar --listen 5556 --target localhost:5555
#
# The classes are compiled for Java 17 (--release 17), so a newer JDK on the
# build machine still makes a jar that a Java 17 server runs.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$HERE/src/main/java"
JAR_NAME="ankillous-gateway.jar"
MAIN_CLASS="ankillousj.gateway.AnkillousGateway"
USAGE="usage: bash build-gateway.sh [output-dir]"

if [ $# -gt 1 ]; then
  echo "$USAGE" >&2
  exit 1
fi
OUT="${1:-$HERE/dist}"

for tool in javac jar; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "no $tool on the PATH: the gateway is built with a JDK, version 17 or later" >&2
    exit 1
  fi
done

if [ ! -d "$SRC" ]; then
  echo "the gateway sources are missing: no $SRC" >&2
  exit 1
fi

SOURCES=()
while IFS= read -r -d '' f; do
  SOURCES+=("$f")
done < <(find "$SRC" -name '*.java' -print0)
if [ ${#SOURCES[@]} -eq 0 ]; then
  echo "no .java file under $SRC" >&2
  exit 1
fi

mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
JAR="$OUT/$JAR_NAME"

# Compiled in a throwaway folder, so a class left over from an earlier build
# can never end up in the jar.
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$WORK/classes"

echo "AnkillousJ gateway"
echo "  sources: $SRC (${#SOURCES[@]} file(s))"
echo "  output : $JAR"
echo

echo "1. compiling for Java 17"
if ! javac --release 17 -encoding UTF-8 -d "$WORK/classes" "${SOURCES[@]}"; then
  echo "the gateway did not compile (see above); no jar was made" >&2
  exit 1
fi

echo "2. packing the jar (Main-Class: $MAIN_CLASS)"
# a failed pack must not leave an earlier jar looking like this build's
rm -f "$JAR"
if ! jar --create --file "$JAR" --main-class "$MAIN_CLASS" -C "$WORK/classes" .; then
  echo "jar could not pack the classes; no jar was made" >&2
  exit 1
fi

echo
echo "built: $JAR"
