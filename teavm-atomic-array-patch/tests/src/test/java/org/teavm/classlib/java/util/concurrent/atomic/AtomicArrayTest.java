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
package org.teavm.classlib.java.util.concurrent.atomic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import java.util.concurrent.atomic.AtomicIntegerArray;
import java.util.concurrent.atomic.AtomicLongArray;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.teavm.junit.TeaVMTestRunner;

@RunWith(TeaVMTestRunner.class)
public class AtomicArrayTest {

    @Test
    public void createsFromLength() {
        AtomicIntegerArray ints = new AtomicIntegerArray(3);
        assertEquals(3, ints.length());
        assertEquals(0, ints.get(0));
        assertEquals(0, ints.get(2));

        AtomicLongArray longs = new AtomicLongArray(3);
        assertEquals(3, longs.length());
        assertEquals(0L, longs.get(0));
    }

    @Test
    public void createsFromArray() {
        AtomicIntegerArray ints = new AtomicIntegerArray(new int[] { 1, 2, 3 });
        assertEquals(3, ints.length());
        assertEquals(2, ints.get(1));

        AtomicLongArray longs = new AtomicLongArray(new long[] { 10L, 20L });
        assertEquals(20L, longs.get(1));
    }

    @Test
    public void constructorCopiesSource() {
        int[] source = { 1, 2, 3 };
        AtomicIntegerArray ints = new AtomicIntegerArray(source);
        source[0] = 99;
        assertEquals("must not alias the source array", 1, ints.get(0));

        long[] longSource = { 1L, 2L };
        AtomicLongArray longs = new AtomicLongArray(longSource);
        longSource[0] = 99L;
        assertEquals(1L, longs.get(0));
    }

    @Test
    public void setsAndGets() {
        AtomicIntegerArray ints = new AtomicIntegerArray(2);
        ints.set(0, 42);
        assertEquals(42, ints.get(0));
        ints.lazySet(1, 7);
        assertEquals(7, ints.get(1));
        assertEquals(42, ints.getAndSet(0, 100));
        assertEquals(100, ints.get(0));

        AtomicLongArray longs = new AtomicLongArray(2);
        longs.set(0, 42L);
        assertEquals(42L, longs.getAndSet(0, 100L));
        assertEquals(100L, longs.get(0));
    }

    @Test
    public void comparesAndSets() {
        AtomicIntegerArray ints = new AtomicIntegerArray(new int[] { 5 });
        assertFalse("must not swap on a mismatch", ints.compareAndSet(0, 4, 9));
        assertEquals("value must be untouched after a failed CAS", 5, ints.get(0));
        assertTrue(ints.compareAndSet(0, 5, 9));
        assertEquals(9, ints.get(0));
        assertTrue(ints.weakCompareAndSet(0, 9, 11));
        assertEquals(11, ints.get(0));

        AtomicLongArray longs = new AtomicLongArray(new long[] { 5L });
        assertFalse(longs.compareAndSet(0, 4L, 9L));
        assertTrue(longs.compareAndSet(0, 5L, 9L));
        assertEquals(9L, longs.get(0));
    }

    @Test
    public void addsAndSubtracts() {
        AtomicIntegerArray ints = new AtomicIntegerArray(new int[] { 10 });
        assertEquals(10, ints.getAndIncrement(0));
        assertEquals(11, ints.get(0));
        assertEquals(12, ints.incrementAndGet(0));
        assertEquals(12, ints.getAndDecrement(0));
        assertEquals(10, ints.decrementAndGet(0));
        assertEquals(10, ints.getAndAdd(0, 5));
        assertEquals(20, ints.addAndGet(0, 5));

        AtomicLongArray longs = new AtomicLongArray(new long[] { 10L });
        assertEquals(10L, longs.getAndIncrement(0));
        assertEquals(12L, longs.incrementAndGet(0));
        assertEquals(17L, longs.addAndGet(0, 5L));
    }

    @Test
    public void appliesFunctions() {
        AtomicIntegerArray ints = new AtomicIntegerArray(new int[] { 4 });
        assertEquals(4, ints.getAndUpdate(0, x -> x * 3));
        assertEquals(12, ints.get(0));
        assertEquals(24, ints.updateAndGet(0, x -> x * 2));
        assertEquals(24, ints.getAndAccumulate(0, 30, Math::max));
        assertEquals(30, ints.get(0));
        assertEquals(5, ints.accumulateAndGet(0, 5, Math::min));

        AtomicLongArray longs = new AtomicLongArray(new long[] { 4L });
        assertEquals(4L, longs.getAndUpdate(0, x -> x * 3L));
        assertEquals(24L, longs.updateAndGet(0, x -> x * 2L));
        assertEquals(5L, longs.accumulateAndGet(0, 5L, Math::min));
    }

    @Test
    public void wrapsOnOverflow() {
        AtomicIntegerArray ints = new AtomicIntegerArray(new int[] { Integer.MAX_VALUE });
        assertEquals(Integer.MIN_VALUE, ints.incrementAndGet(0));

        AtomicLongArray longs = new AtomicLongArray(new long[] { Long.MAX_VALUE });
        assertEquals(Long.MIN_VALUE, longs.incrementAndGet(0));
    }

    @Test
    public void formatsAsList() {
        assertEquals("[]", new AtomicIntegerArray(0).toString());
        assertEquals("[1, 2, 3]", new AtomicIntegerArray(new int[] { 1, 2, 3 }).toString());
        assertEquals("[0, 0]", new AtomicIntegerArray(2).toString());

        assertEquals("[]", new AtomicLongArray(0).toString());
        assertEquals("[1, 2]", new AtomicLongArray(new long[] { 1L, 2L }).toString());
    }

    @Test
    public void keepsElementsIndependent() {
        AtomicIntegerArray ints = new AtomicIntegerArray(3);
        ints.incrementAndGet(1);
        assertEquals(0, ints.get(0));
        assertEquals(1, ints.get(1));
        assertEquals(0, ints.get(2));
    }
}
