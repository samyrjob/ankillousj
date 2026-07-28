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
import java.util.function.IntBinaryOperator;
import java.util.function.IntUnaryOperator;

public class AtomicIntegerArray implements Serializable {
    private final int[] array;
    private volatile int version;

    public AtomicIntegerArray(int length) {
        array = new int[length];
    }

    public AtomicIntegerArray(int[] array) {
        this.array = array.clone();
    }

    public final int length() {
        return array.length;
    }

    public final int get(int i) {
        return array[i];
    }

    public final void set(int i, int newValue) {
        array[i] = newValue;
        version++;
    }

    public final void lazySet(int i, int newValue) {
        array[i] = newValue;
        version++;
    }

    public final int getAndSet(int i, int newValue) {
        int result = array[i];
        array[i] = newValue;
        version++;
        return result;
    }

    public final boolean compareAndSet(int i, int expect, int update) {
        if (array[i] != expect) {
            return false;
        }
        array[i] = update;
        version++;
        return true;
    }

    public final boolean weakCompareAndSet(int i, int expect, int update) {
        if (array[i] != expect) {
            return false;
        }
        array[i] = update;
        version++;
        return true;
    }

    public final int getAndIncrement(int i) {
        version++;
        return array[i]++;
    }

    public final int getAndDecrement(int i) {
        version++;
        return array[i]--;
    }

    public final int getAndAdd(int i, int delta) {
        version++;
        int result = array[i];
        array[i] += delta;
        return result;
    }

    public final int incrementAndGet(int i) {
        version++;
        return ++array[i];
    }

    public final int decrementAndGet(int i) {
        version++;
        return --array[i];
    }

    public final int addAndGet(int i, int delta) {
        version++;
        array[i] += delta;
        return array[i];
    }

    public final int getAndUpdate(int i, IntUnaryOperator updateFunction) {
        int expectedVersion;
        int result;
        int newValue;
        do {
            expectedVersion = version;
            result = array[i];
            newValue = updateFunction.applyAsInt(array[i]);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return result;
    }

    public final int updateAndGet(int i, IntUnaryOperator updateFunction) {
        int expectedVersion;
        int newValue;
        do {
            expectedVersion = version;
            newValue = updateFunction.applyAsInt(array[i]);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return newValue;
    }

    public final int getAndAccumulate(int i, int x, IntBinaryOperator accumulatorFunction) {
        int expectedVersion;
        int newValue;
        int result;
        do {
            expectedVersion = version;
            result = array[i];
            newValue = accumulatorFunction.applyAsInt(array[i], x);
        } while (expectedVersion != version);
        ++version;
        array[i] = newValue;
        return result;
    }

    public final int accumulateAndGet(int i, int x, IntBinaryOperator accumulatorFunction) {
        int expectedVersion;
        int newValue;
        do {
            expectedVersion = version;
            newValue = accumulatorFunction.applyAsInt(array[i], x);
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
