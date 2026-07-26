# Verification harness

Reproduces the numbers in the PR description. Requires a JDK with `java.desktop`
(any standard JDK) — the reference implementation is the oracle.

```bash
# 1. record what the reference implementation does
javac -d . Characterise.java
java -cp . Characterise > oracle.txt          # 10,648 colours

# 2. replay it against the patched TColor
mkdir -p out/org/teavm/classlib/java/awt
cp ../classlib/src/main/java/org/teavm/classlib/java/awt/TColor.java out/org/teavm/classlib/java/awt/
javac -d out out/org/teavm/classlib/java/awt/TColor.java Verify.java
java -cp out Verify                            # expect: 0 mismatches

# 3. wider sweep — every grey, every single channel, 200k random, repeated application
javac -cp out -d out Exhaustive.java
java -cp out Exhaustive                        # expect: 402,584 comparisons, 0 mismatches
```

`Characterise` writes the oracle; `Verify` replays it; `Exhaustive` compares
directly against `java.awt.Color` across a much wider input space including
repeated application, where rounding drift would show up.
