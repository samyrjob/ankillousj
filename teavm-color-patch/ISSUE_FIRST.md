# Issue to open first

The contribution guide says: *"Anyway, open issue first so that communication
with you could start."* Post this as a GitHub issue, wait for a reply, then
link the PR to it.

Title:

```
Add Color.brighter() and Color.darker() to the class library
```

Body:

---

`org.teavm.classlib.java.awt.TColor` provides the constructors and
`getRed` / `getGreen` / `getBlue` / `getAlpha`, but not `brighter()` or
`darker()`. Code that uses them fails to link:

```
[ERROR] Method java.awt.Color.brighter()Ljava/awt/Color; was not found
```

These two come up a lot in AWT and Swing UI code — hover and pressed states
are very commonly written as `base.brighter()` or `base.darker()` rather than
as a second literal colour. I hit this porting a desktop application's UI to
the browser; the rest compiled, and these were the only missing pieces.

I have a patch ready and would like to contribute it. Before opening the PR:

**On licensing.** I know OpenJDK code is not acceptable here. None was used —
no OpenJDK source was opened, copied or decompiled. I characterised the
reference implementation's observable behaviour by running it over a large
input set and recording inputs and outputs, then wrote the implementation
independently to reproduce that mapping. I can include the harness that does
the characterisation so the claim is checkable rather than something you have
to take on trust.

**On verification.** Every result is compared against the reference
implementation: an exhaustive sweep of greys and single channels, 200,000
random RGBA colours, and repeated application of both methods (where per-step
rounding would diverge). 402,584 comparisons, no mismatches.

**On scope.** Two methods and one test class. `TColor` is changed additively —
no existing line is modified. `./gradlew build -x test -x javadoc` passes.

Happy to adjust the approach if you would rather it were done differently, or
if you would prefer a wider `TColor` fill-in (`getRGB`, `equals`/`hashCode`,
`decode`, the `HSB` conversions) in one go rather than these two alone.
