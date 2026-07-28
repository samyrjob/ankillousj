# Verification harness

Both classes are compared against the reference implementation on every method.

Requires any JDK.

```bash
javac -d out ../classlib/src/main/java/org/teavm/classlib/java/util/concurrent/atomic/*.java
javac -cp out -d out ArrayCheck.java
java -cp out ArrayCheck
```

Expected:

```
84043 comparisons, 0 mismatches
```

`ArrayCheck` drives an `AtomicIntegerArray` and the proposed `TAtomicIntegerArray`
through the same 4,000-step random sequence, and checks **every element plus
`toString`** after each step — so a divergence is reported at the operation
that caused it, not at the end. The same is done for the long variant.

It covers all nineteen methods, both constructors, and specifically:

- that the array constructor **copies** rather than aliases its source
- a `compareAndSet` that must succeed and one that must fail, with the value
  left untouched after the failure
- `Integer.MAX_VALUE` and `Long.MAX_VALUE` wrapping rather than saturating
- the empty-array branch of `toString`
- out-of-range indices throwing `ArrayIndexOutOfBoundsException`
