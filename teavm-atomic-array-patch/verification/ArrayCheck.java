import org.teavm.classlib.java.util.concurrent.atomic.TAtomicIntegerArray;
import org.teavm.classlib.java.util.concurrent.atomic.TAtomicLongArray;

import java.util.Random;
import java.util.concurrent.atomic.AtomicIntegerArray;
import java.util.concurrent.atomic.AtomicLongArray;

/**
 * Compares every method against the reference implementation.
 *
 * The two arrays are driven through the same random sequence of operations and
 * checked after each one, so a divergence is caught at the operation that
 * caused it rather than at the end.
 */
public class ArrayCheck {

    static int checked;
    static int bad;

    static void expect(String what, Object got, Object want) {
        checked++;
        if (!String.valueOf(got).equals(String.valueOf(want))) {
            bad++;
            if (bad < 10) {
                System.out.println("  " + what + ": got " + got + " want " + want);
            }
        }
    }

    static void sameInt(String what, AtomicIntegerArray ref, TAtomicIntegerArray ours) {
        expect(what + " length", ours.length(), ref.length());
        for (int i = 0; i < ref.length(); i++) {
            expect(what + " [" + i + "]", ours.get(i), ref.get(i));
        }
        expect(what + " toString", ours.toString(), ref.toString());
    }

    static void sameLong(String what, AtomicLongArray ref, TAtomicLongArray ours) {
        expect(what + " length", ours.length(), ref.length());
        for (int i = 0; i < ref.length(); i++) {
            expect(what + " [" + i + "]", ours.get(i), ref.get(i));
        }
        expect(what + " toString", ours.toString(), ref.toString());
    }

    public static void main(String[] args) {
        ints();
        longs();
        edgeCases();
        System.out.println(checked + " comparisons, " + bad + " mismatches");
        System.exit(bad == 0 ? 0 : 1);
    }

    static void ints() {
        int[] seed = { 3, -1, 0, 7, Integer.MAX_VALUE, Integer.MIN_VALUE, 42, -99 };
        AtomicIntegerArray ref = new AtomicIntegerArray(seed);
        TAtomicIntegerArray ours = new TAtomicIntegerArray(seed);
        sameInt("constructed from array", ref, ours);

        // the array constructor must copy, not alias
        seed[0] = 12345;
        sameInt("constructor copied the source", ref, ours);

        Random rnd = new Random(99);
        for (int step = 0; step < 4000; step++) {
            int i = rnd.nextInt(ref.length());
            int v = rnd.nextInt(2001) - 1000;
            switch (step % 14) {
                case 0:  ref.set(i, v);            ours.set(i, v);            break;
                case 1:  ref.lazySet(i, v);        ours.lazySet(i, v);        break;
                case 2:  expect("getAndSet", ours.getAndSet(i, v), ref.getAndSet(i, v)); break;
                case 3: {
                    int expected = ref.get(i);     // a CAS that must succeed
                    expect("compareAndSet hit", ours.compareAndSet(i, expected, v),
                                                 ref.compareAndSet(i, expected, v));
                    break;
                }
                case 4:
                    // a CAS that must fail, and must leave the value alone
                    expect("compareAndSet miss", ours.compareAndSet(i, ref.get(i) + 1, v),
                                                  ref.compareAndSet(i, ref.get(i) + 1, v));
                    break;
                case 5:
                    expect("weakCompareAndSet", ours.weakCompareAndSet(i, ref.get(i), v),
                                                 ref.weakCompareAndSet(i, ref.get(i), v));
                    break;
                case 6:  expect("getAndIncrement", ours.getAndIncrement(i), ref.getAndIncrement(i)); break;
                case 7:  expect("getAndDecrement", ours.getAndDecrement(i), ref.getAndDecrement(i)); break;
                case 8:  expect("getAndAdd", ours.getAndAdd(i, v), ref.getAndAdd(i, v)); break;
                case 9:  expect("incrementAndGet", ours.incrementAndGet(i), ref.incrementAndGet(i)); break;
                case 10: expect("decrementAndGet", ours.decrementAndGet(i), ref.decrementAndGet(i)); break;
                case 11: expect("addAndGet", ours.addAndGet(i, v), ref.addAndGet(i, v)); break;
                case 12:
                    expect("getAndUpdate", ours.getAndUpdate(i, x -> x * 2 + 1),
                                            ref.getAndUpdate(i, x -> x * 2 + 1));
                    expect("updateAndGet", ours.updateAndGet(i, x -> x - 3),
                                            ref.updateAndGet(i, x -> x - 3));
                    break;
                default:
                    expect("getAndAccumulate", ours.getAndAccumulate(i, v, Math::max),
                                                ref.getAndAccumulate(i, v, Math::max));
                    expect("accumulateAndGet", ours.accumulateAndGet(i, v, (a, b) -> a ^ b),
                                                ref.accumulateAndGet(i, v, (a, b) -> a ^ b));
                    break;
            }
            sameInt("after step " + step, ref, ours);
        }
    }

    static void longs() {
        long[] seed = { 3L, -1L, 0L, Long.MAX_VALUE, Long.MIN_VALUE, 1L << 40, -(1L << 40) };
        AtomicLongArray ref = new AtomicLongArray(seed);
        TAtomicLongArray ours = new TAtomicLongArray(seed);
        sameLong("constructed from array", ref, ours);

        seed[0] = 999L;
        sameLong("constructor copied the source", ref, ours);

        Random rnd = new Random(1234);
        for (int step = 0; step < 4000; step++) {
            int i = rnd.nextInt(ref.length());
            long v = rnd.nextLong() % 1_000_000L;
            switch (step % 14) {
                case 0:  ref.set(i, v);      ours.set(i, v);      break;
                case 1:  ref.lazySet(i, v);  ours.lazySet(i, v);  break;
                case 2:  expect("getAndSet", ours.getAndSet(i, v), ref.getAndSet(i, v)); break;
                case 3: {
                    long expected = ref.get(i);
                    expect("compareAndSet hit", ours.compareAndSet(i, expected, v),
                                                 ref.compareAndSet(i, expected, v));
                    break;
                }
                case 4:
                    expect("compareAndSet miss", ours.compareAndSet(i, ref.get(i) + 1, v),
                                                  ref.compareAndSet(i, ref.get(i) + 1, v));
                    break;
                case 5:
                    expect("weakCompareAndSet", ours.weakCompareAndSet(i, ref.get(i), v),
                                                 ref.weakCompareAndSet(i, ref.get(i), v));
                    break;
                case 6:  expect("getAndIncrement", ours.getAndIncrement(i), ref.getAndIncrement(i)); break;
                case 7:  expect("getAndDecrement", ours.getAndDecrement(i), ref.getAndDecrement(i)); break;
                case 8:  expect("getAndAdd", ours.getAndAdd(i, v), ref.getAndAdd(i, v)); break;
                case 9:  expect("incrementAndGet", ours.incrementAndGet(i), ref.incrementAndGet(i)); break;
                case 10: expect("decrementAndGet", ours.decrementAndGet(i), ref.decrementAndGet(i)); break;
                case 11: expect("addAndGet", ours.addAndGet(i, v), ref.addAndGet(i, v)); break;
                case 12:
                    expect("getAndUpdate", ours.getAndUpdate(i, x -> x * 2 + 1),
                                            ref.getAndUpdate(i, x -> x * 2 + 1));
                    expect("updateAndGet", ours.updateAndGet(i, x -> x - 3),
                                            ref.updateAndGet(i, x -> x - 3));
                    break;
                default:
                    expect("getAndAccumulate", ours.getAndAccumulate(i, v, Math::max),
                                                ref.getAndAccumulate(i, v, Math::max));
                    expect("accumulateAndGet", ours.accumulateAndGet(i, v, (a, b) -> a ^ b),
                                                ref.accumulateAndGet(i, v, (a, b) -> a ^ b));
                    break;
            }
            sameLong("after step " + step, ref, ours);
        }
    }

    static void edgeCases() {
        // an empty array — toString has a separate branch for it
        expect("empty int toString", new TAtomicIntegerArray(0).toString(),
                                      new AtomicIntegerArray(0).toString());
        expect("empty long toString", new TAtomicLongArray(0).toString(),
                                       new AtomicLongArray(0).toString());

        // length constructor zero-fills
        expect("length ctor int", new TAtomicIntegerArray(4).toString(),
                                   new AtomicIntegerArray(4).toString());
        expect("length ctor long", new TAtomicLongArray(4).toString(),
                                    new AtomicLongArray(4).toString());

        // overflow must wrap, not saturate
        TAtomicIntegerArray oursInt = new TAtomicIntegerArray(new int[] { Integer.MAX_VALUE });
        AtomicIntegerArray refInt = new AtomicIntegerArray(new int[] { Integer.MAX_VALUE });
        expect("int overflow", oursInt.incrementAndGet(0), refInt.incrementAndGet(0));

        TAtomicLongArray oursLong = new TAtomicLongArray(new long[] { Long.MAX_VALUE });
        AtomicLongArray refLong = new AtomicLongArray(new long[] { Long.MAX_VALUE });
        expect("long overflow", oursLong.incrementAndGet(0), refLong.incrementAndGet(0));

        // out of range must throw, like the reference does
        expect("int get out of range", throwsAIOOBE(() -> new TAtomicIntegerArray(2).get(5)), true);
        expect("int set out of range", throwsAIOOBE(() -> new TAtomicIntegerArray(2).set(-1, 0)), true);
        expect("long get out of range", throwsAIOOBE(() -> new TAtomicLongArray(2).get(5)), true);
    }

    static boolean throwsAIOOBE(Runnable r) {
        try {
            r.run();
            return false;
        } catch (ArrayIndexOutOfBoundsException e) {
            return true;
        }
    }
}
