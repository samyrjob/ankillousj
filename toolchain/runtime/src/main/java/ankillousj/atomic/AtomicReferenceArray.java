package ankillousj.atomic;

import java.io.Serializable;
import java.util.function.BinaryOperator;
import java.util.function.UnaryOperator;

/**
 * java.util.concurrent.atomic.AtomicReferenceArray, which TeaVM's class
 * library does not ship (as the two atomic arrays beside this file).
 *
 * In a browser the threads of a program take turns: one runs until it waits.
 * No other can come between two lines here, so plain reads and writes are
 * already atomic.
 */
public class AtomicReferenceArray<E> implements Serializable {

    private final Object[] array;

    public AtomicReferenceArray(int length) {
        array = new Object[length];
    }

    public AtomicReferenceArray(E[] array) {
        this.array = array.clone();
    }

    public final int length() { return array.length; }

    @SuppressWarnings("unchecked")
    public final E get(int i) { return (E) array[i]; }

    public final void set(int i, E newValue) { array[i] = newValue; }

    public final void lazySet(int i, E newValue) { array[i] = newValue; }

    public final E getAndSet(int i, E newValue) {
        E old = get(i);
        array[i] = newValue;
        return old;
    }

    /** Sets the element when it is the very object expected (compared by identity, as the JDK). */
    public final boolean compareAndSet(int i, E expectedValue, E newValue) {
        if (array[i] != expectedValue) return false;
        array[i] = newValue;
        return true;
    }

    public final boolean weakCompareAndSet(int i, E expectedValue, E newValue) {
        return compareAndSet(i, expectedValue, newValue);
    }

    public final E getAndUpdate(int i, UnaryOperator<E> updateFunction) {
        E old = get(i);
        array[i] = updateFunction.apply(old);
        return old;
    }

    public final E updateAndGet(int i, UnaryOperator<E> updateFunction) {
        E next = updateFunction.apply(get(i));
        array[i] = next;
        return next;
    }

    public final E getAndAccumulate(int i, E x, BinaryOperator<E> accumulatorFunction) {
        E old = get(i);
        array[i] = accumulatorFunction.apply(old, x);
        return old;
    }

    public final E accumulateAndGet(int i, E x, BinaryOperator<E> accumulatorFunction) {
        E next = accumulatorFunction.apply(get(i), x);
        array[i] = next;
        return next;
    }

    @Override public String toString() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < array.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(array[i]);
        }
        return sb.append(']').toString();
    }
}
