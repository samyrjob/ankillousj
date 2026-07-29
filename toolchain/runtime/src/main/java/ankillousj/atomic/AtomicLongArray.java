/*
 *  Copyright 2026 Alexey Andreev.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package ankillousj.atomic;

import java.io.Serializable;
import java.util.function.LongBinaryOperator;
import java.util.function.LongUnaryOperator;

public class AtomicLongArray implements Serializable {
    private final long[] array;
    private volatile int version;

    public AtomicLongArray(int length) {
        array = new long[length];
    }

    public AtomicLongArray(long[] array) {
        this.array = array.clone();
    }

    public final int length() {
        return array.length;
    }

    public final long get(int i) {
        return array[i];
    }

    public final void set(int i, long newValue) {
        array[i] = newValue;
        version++;
    }

    public final void lazySet(int i, long newValue) {
        array[i] = newValue;
        version++;
    }

    public final long getAndSet(int i, long newValue) {
        long result = array[i];
        array[i] = newValue;
        version++;
        return result;
    }

    public final boolean compareAndSet(int i, long expect, long update) {
        if (array[i] != expect) {
            return false;
        }
        array[i] = update;
        version++;
        return true;
    }

    public final boolean weakCompareAndSet(int i, long expect, long update) {
        if (array[i] != expect) {
            return false;
        }
        array[i] = update;
        version++;
        return true;
    }

    public final long getAndIncrement(int i) {
        version++;
        return array[i]++;
    }

    public final long getAndDecrement(int i) {
        version++;
        return array[i]--;
    }

    public final long getAndAdd(int i, long delta) {
        version++;
        long result = array[i];
        array[i] += delta;
        return result;
    }

    public final long incrementAndGet(int i) {
        version++;
        return ++array[i];
    }

    public final long decrementAndGet(int i) {
        version++;
        return --array[i];
    }

    public final long addAndGet(int i, long delta) {
        version++;
        array[i] += delta;
        return array[i];
    }

    public final long getAndUpdate(int i, LongUnaryOperator updateFunction) {
        int expectedVersion;
        long result;
        long newValue;
        do {
            expectedVersion = version;
            result = array[i];
            newValue = updateFunction.applyAsLong(array[i]);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return result;
    }

    public final long updateAndGet(int i, LongUnaryOperator updateFunction) {
        int expectedVersion;
        long newValue;
        do {
            expectedVersion = version;
            newValue = updateFunction.applyAsLong(array[i]);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return newValue;
    }

    public final long getAndAccumulate(int i, long x, LongBinaryOperator accumulatorFunction) {
        int expectedVersion;
        long newValue;
        long result;
        do {
            expectedVersion = version;
            result = array[i];
            newValue = accumulatorFunction.applyAsLong(array[i], x);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return result;
    }

    public final long accumulateAndGet(int i, long x, LongBinaryOperator accumulatorFunction) {
        int expectedVersion;
        long newValue;
        do {
            expectedVersion = version;
            newValue = accumulatorFunction.applyAsLong(array[i], x);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return newValue;
    }

    @Override
    public String toString() {
        if (array.length == 0) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder();
        sb.append('[').append(array[0]);
        for (int i = 1; i < array.length; ++i) {
            sb.append(", ").append(array[i]);
        }
        return sb.append(']').toString();
    }
}
