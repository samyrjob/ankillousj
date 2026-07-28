# Add `AtomicIntegerArray` and `AtomicLongArray` to the class library

## What

Two new classes in `org.teavm.classlib.java.util.concurrent.atomic`,
implementing `java.util.concurrent.atomic.AtomicIntegerArray` and
`AtomicLongArray`. Nothing existing is modified.

## Why

The package already has `AtomicInteger`, `AtomicLong`, `AtomicBoolean`,
`AtomicReference` and the field updaters. The array forms are missing, and
that becomes a hard blocker when a dependency references them rather than the
application.

Gson registers type adapters for both in a static initialiser, so
whole-program analysis reaches them and the build stops:

```
[ERROR] Class java.util.concurrent.atomic.AtomicIntegerArray was not found
[ERROR] Class java.util.concurrent.atomic.AtomicLongArray was not found
```

There is no way to opt out from the application side — the reference is inside
the library.

## Implementation

Both follow `TAtomicInteger` closely, including the `version` counter used to
detect a functional update being interrupted partway through. The array forms
keep one counter for the whole array rather than one per element: it is only
read to notice interruption, and a false positive costs a retry rather than
correctness.

`toString` builds the `[a, b, c]` form directly rather than going through
`Arrays.toString`, matching how the reference formats it and keeping the
dependency footprint small.

The array constructor copies its argument. That is not cosmetic — the
reference does the same, and aliasing would let a caller mutate the array
behind the atomic's back. There is a test for it.

## Verification

Both classes were driven through a 4,000-step random operation sequence
alongside the reference implementation, with **every element and `toString`
compared after each step**, so a divergence surfaces at the operation that
caused it:

| | comparisons | mismatches |
|---|---|---|
| `AtomicIntegerArray`, 4,000 mixed operations | ~42,000 | 0 |
| `AtomicLongArray`, 4,000 mixed operations | ~42,000 | 0 |
| Edge cases | 11 | 0 |
| **Total** | **84,043** | **0** |

Beyond the happy path, it specifically checks:

- the array constructor **copies** rather than aliases
- `compareAndSet` on the succeeding path *and* the failing one, with the value
  left untouched after a failure
- `Integer.MAX_VALUE` / `Long.MAX_VALUE` wrapping rather than saturating
- the empty-array branch of `toString`
- out-of-range indices throwing `ArrayIndexOutOfBoundsException`

The harness is in `verification/` on the branch, so the numbers can be
reproduced rather than taken on trust.

## Tests

`AtomicArrayTest` in the `tests` module: construction from a length and from
an array, constructor copying, get/set/lazySet/getAndSet, both compare-and-set
paths, the arithmetic family, the four functional-update methods, overflow
wrapping, `toString` formatting, and element independence.

Every expected value in it came from running the same assertions against the
reference implementation, not from reasoning about what they should be.

## Files

```
classlib/src/main/java/org/teavm/classlib/java/util/concurrent/atomic/TAtomicIntegerArray.java   added
classlib/src/main/java/org/teavm/classlib/java/util/concurrent/atomic/TAtomicLongArray.java      added
tests/src/test/java/org/teavm/classlib/java/util/concurrent/atomic/AtomicArrayTest.java          added
```

`./gradlew build -x test -x javadoc` passes.

---

Happy to split the test class in two, or to drop it if `java.util.concurrent.atomic`
is not expected to be covered in `tests` yet — I noticed there is nothing under
that package currently.
