# Issue to open first

The contribution guide asks for an issue before a PR. Post this, wait for a
reply, then link the PR to it.

Title:

```
Add AtomicIntegerArray and AtomicLongArray to the class library
```

Body:

---

`java.util.concurrent.atomic` has `AtomicInteger`, `AtomicLong`,
`AtomicBoolean`, `AtomicReference` and the field updaters, but not
`AtomicIntegerArray` or `AtomicLongArray`.

That is normally easy to work around — until something in a dependency
references them. Gson's `TypeAdapters` registers adapters for both in a static
initialiser, so whole-program analysis reaches them and the build stops:

```
[ERROR] Class java.util.concurrent.atomic.AtomicIntegerArray was not found
[ERROR] Class java.util.concurrent.atomic.AtomicLongArray was not found
```

Nothing in the application touches either class. Gson is common enough that
this is probably not the only project to hit it.

I have a patch ready and would like to contribute it.

**Implementation.** Both follow `TAtomicInteger` exactly, including the
`version` counter that detects a functional update being interrupted, so they
should read as the same code. Nineteen methods each, plus both constructors.

**Verification.** Both are driven through a 4,000-step random operation
sequence alongside the reference implementation, with every element and
`toString` compared after each step — 84,043 comparisons, no mismatches. It
covers the constructor copying rather than aliasing, `compareAndSet` on both
the hit and miss paths, overflow wrapping, the empty-array `toString` branch,
and out-of-range indices. I can include the harness so that is checkable.

**Tests.** `AtomicArrayTest` in the `tests` module, ten cases. Every expected
value was taken from the reference implementation rather than written by hand.

**Scope.** Two new files in `classlib`, one in `tests`. Nothing existing is
modified.

I notice there are no tests under `org.teavm.classlib.java.util.concurrent.atomic`
yet, so this would be the first — happy to follow whatever you would prefer for
that package.
