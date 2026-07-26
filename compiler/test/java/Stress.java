public class Stress {

    // ---- shift edge cases: Java masks the shift count ----
    public static int ishlMask(int x, int s)  { return x << s; }
    public static int ishrMask(int x, int s)  { return x >> s; }
    public static int iushrMask(int x, int s) { return x >>> s; }
    public static long lshlMask(long x, int s)  { return x << s; }
    public static long lushrMask(long x, int s) { return x >>> s; }
    public static long lshrMask(long x, int s)  { return x >> s; }

    // ---- overflow must wrap, not trap ----
    public static int intOverflow()  { return Integer.MAX_VALUE + 1; }
    public static int intMulOverflow() { return 65536 * 65536; }
    public static long longOverflow() { return Long.MAX_VALUE + 1L; }

    // ---- narrowing conversions ----
    public static int narrowByte(int x)  { return (byte) x; }
    public static int narrowChar(int x)  { return (char) x; }
    public static int narrowShort(int x) { return (short) x; }

    // ---- float/double truncation, incl. NaN and out-of-range ----
    public static int d2iNaN()      { return (int) (0.0 / 0.0); }
    public static int d2iHuge()     { return (int) 1e30; }
    public static int d2iNegHuge()  { return (int) -1e30; }
    public static long d2lHuge()    { return (long) 1e30; }
    public static int f2iNaN()      { return (int) (0.0f / 0.0f); }

    // ---- NaN comparison semantics: dcmpl vs dcmpg ----
    public static int nanLess(double a, double b) {
        // javac emits dcmpg for `<`
        if (a < b) return -1;
        return 0;
    }
    public static int nanGreater(double a, double b) {
        // javac emits dcmpl for `>`
        if (a > b) return 1;
        return 0;
    }

    // ---- do-while (back-edge at the bottom) ----
    public static int doWhile(int n) {
        int c = 0;
        do { c++; n--; } while (n > 0);
        return c;
    }

    // ---- nested ternary: non-empty stack at merge points ----
    public static int nested(int a, int b, int c) {
        return a > b ? (b > c ? b : c) : (a > c ? a : c);
    }

    // ---- compound assignment chain (can emit dup forms) ----
    public static int chainAssign(int x) {
        int a, b, c;
        a = b = c = x + 1;
        return a + b + c;
    }

    // ---- long chain assignment (category-2 dup) ----
    public static long chainAssignLong(long x) {
        long a, b;
        a = b = x * 2L;
        return a + b;
    }

    // ---- deeply nested loops ----
    public static int triple(int n) {
        int s = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                for (int k = 0; k < n; k++)
                    s += i * j * k;
        return s;
    }

    // ---- continue / break ----
    public static int skipEvens(int n) {
        int s = 0;
        for (int i = 0; i < n; i++) {
            if (i % 2 == 0) continue;
            if (i > 50) break;
            s += i;
        }
        return s;
    }

    // ---- sparse switch -> lookupswitch ----
    public static int sparse(int x) {
        switch (x) {
            case 1:    return 10;
            case 100:  return 20;
            case 5000: return 30;
            default:   return 0;
        }
    }

    // ---- switch fallthrough ----
    public static int fallthrough(int x) {
        int r = 0;
        switch (x) {
            case 0: r += 1;
            case 1: r += 2;
            case 2: r += 4; break;
            case 3: r += 8;
        }
        return r;
    }

    // ---- mutual recursion ----
    public static boolean isEven(int n) { return n == 0 ? true : isOdd(n - 1); }
    public static boolean isOdd(int n)  { return n == 0 ? false : isEven(n - 1); }

    // ---- slot reuse with different types ----
    public static double slotReuse(int n) {
        double acc = 0.0;
        for (int i = 0; i < n; i++) {
            acc += i;
        }
        {
            long tmp = (long) acc;
            acc = tmp * 2;
        }
        {
            float f = (float) acc;
            acc = f + 0.5;
        }
        return acc;
    }

    // ---- unary negation on all types ----
    public static int    negI(int x)    { return -x; }
    public static long   negL(long x)   { return -x; }
    public static float  negF(float x)  { return -x; }
    public static double negD(double x) { return -x; }

    // ---- void method with side-effect-free body ----
    public static void nothing() { }

    // ---- deep expression, exercises stack depth ----
    public static int deep(int a) {
        return ((((a + 1) * 2 - 3) / 2 + 7) * 3 - a) % 1000;
    }
}
