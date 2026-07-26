public class Kernel {

    public static int add(int a, int b) {
        return a + b;
    }

    public static int arith(int a, int b) {
        return (a * b) - (a / 2) + (b % 7);
    }

    public static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static int abs(int x) {
        if (x < 0) {
            return -x;
        }
        return x;
    }

    public static int sumTo(int n) {
        int total = 0;
        for (int i = 1; i <= n; i++) {
            total += i;
        }
        return total;
    }

    public static int fib(int n) {
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);
    }

    public static int gcd(int a, int b) {
        while (b != 0) {
            int t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    public static long factorial(int n) {
        long acc = 1L;
        for (int i = 2; i <= n; i++) {
            acc *= i;
        }
        return acc;
    }

    public static long longMath(long a, long b) {
        return (a * b) + (a >> 3) - (b & 0xFFL);
    }

    public static double dmath(double x, double y) {
        return (x * y) / (x + y + 1.0);
    }

    public static int compareDoubles(double a, double b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    public static int collatzSteps(int n) {
        int steps = 0;
        while (n != 1) {
            if (n % 2 == 0) {
                n = n / 2;
            } else {
                n = 3 * n + 1;
            }
            steps++;
        }
        return steps;
    }

    public static int classify(int x) {
        switch (x) {
            case 0: return 100;
            case 1: return 200;
            case 2: return 300;
            default: return -1;
        }
    }

    public static double mixed(int i, long l, float f, double d) {
        return i + l + f + d;
    }
}
