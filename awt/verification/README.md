# Ed25519 verification harness

The crypto in `security/` is the one part of this project where being *nearly*
right is worse than not shipping. So it is checked against two independent
references: the RFC 8032 test vectors, and the JDK's own Ed25519.

Requires a JDK 15 or newer (that is when `Ed25519` arrived in the JCA).

```bash
javac -d . security/*.java Sha512Check.java
java -cp . Sha512Check       # SHA-512 vs MessageDigest

javac -cp . -d . EdCheck.java
java -cp . EdCheck           # RFC vectors + differential vs the JDK

javac -cp . -d . Bench.java
java -cp . Bench             # cost per verification
```

Expected:

```
SHA-512: 2301 messages, 0 mismatches
RFC 8032 vectors: all pass
1207 checks, 0 failures
```

`Sha512Check` covers every message length from 0 to 300 bytes, which walks the
padding boundaries at 111/112 and 119/120, plus 2,000 random lengths.

`EdCheck` does more than confirm valid signatures pass — a verifier that
returned `true` unconditionally would sail through that. It also requires
rejection of: a signature with one bit flipped, a message with one bit flipped,
a different public key, malformed lengths, an all-zero signature, a public key
that is not a point on the curve, and `S >= L` (which would otherwise make
signatures malleable).
