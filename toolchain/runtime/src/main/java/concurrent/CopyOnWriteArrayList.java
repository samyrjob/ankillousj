package concurrent;

import java.util.AbstractList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.RandomAccess;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;

/**
 * java.util.concurrent.CopyOnWriteArrayList, whole.
 *
 * <p>TeaVM ships one, but only in part: its iterators cannot remove (right,
 * the JDK's cannot either) and the bulk operations that the JDK rewrote for
 * that reason — {@code removeIf}, {@code removeAll}, {@code retainAll} — were
 * left to the inherited ones, which go through the iterator and so throw
 * "Unsupported operation remove". The port sends the class here.
 *
 * <p>Every change makes a new array; a walk in progress keeps the one it
 * started on. So the list may be changed while it is walked — by the walker
 * itself or by another thread — without a ConcurrentModificationException,
 * which is what the class is asked for.
 */
public class CopyOnWriteArrayList<E> extends AbstractList<E> implements RandomAccess {

    private static final Object[] EMPTY = new Object[0];

    private Object[] array = EMPTY;

    public CopyOnWriteArrayList() { }

    public CopyOnWriteArrayList(Collection<? extends E> c) {
        array = c.toArray();
        if (array.getClass() != Object[].class) array = Arrays.copyOf(array, array.length, Object[].class);
    }

    public CopyOnWriteArrayList(E[] toCopyIn) {
        array = Arrays.copyOf(toCopyIn, toCopyIn.length, Object[].class);
    }

    // ── Reading ───────────────────────────────────────────────────────

    @Override public int size() { return array.length; }

    @Override public boolean isEmpty() { return array.length == 0; }

    @SuppressWarnings("unchecked")
    @Override public E get(int index) { return (E) array[index]; }

    @Override public int indexOf(Object o) {
        Object[] a = array;
        for (int i = 0; i < a.length; i++) if (Objects.equals(o, a[i])) return i;
        return -1;
    }

    @Override public int lastIndexOf(Object o) {
        Object[] a = array;
        for (int i = a.length - 1; i >= 0; i--) if (Objects.equals(o, a[i])) return i;
        return -1;
    }

    @Override public boolean contains(Object o) { return indexOf(o) >= 0; }

    @Override public Object[] toArray() { return array.clone(); }

    @SuppressWarnings("unchecked")
    @Override public <T> T[] toArray(T[] into) {
        Object[] a = array;
        if (into.length < a.length) return (T[]) Arrays.copyOf(a, a.length, into.getClass());
        System.arraycopy(a, 0, into, 0, a.length);
        if (into.length > a.length) into[a.length] = null;
        return into;
    }

    @SuppressWarnings("unchecked")
    @Override public void forEach(Consumer<? super E> action) {
        for (Object o : array) action.accept((E) o);
    }

    // ── Changing: each makes a new array ──────────────────────────────

    @SuppressWarnings("unchecked")
    @Override public E set(int index, E element) {
        Object[] a = array.clone();
        E old = (E) a[index];
        a[index] = element;
        array = a;
        return old;
    }

    @Override public boolean add(E e) {
        Object[] a = Arrays.copyOf(array, array.length + 1);
        a[a.length - 1] = e;
        array = a;
        return true;
    }

    @Override public void add(int index, E element) {
        Object[] old = array;
        if (index < 0 || index > old.length) throw new IndexOutOfBoundsException("Index: " + index);
        Object[] a = new Object[old.length + 1];
        System.arraycopy(old, 0, a, 0, index);
        a[index] = element;
        System.arraycopy(old, index, a, index + 1, old.length - index);
        array = a;
    }

    @SuppressWarnings("unchecked")
    @Override public E remove(int index) {
        Object[] old = array;
        E gone = (E) old[index];
        Object[] a = new Object[old.length - 1];
        System.arraycopy(old, 0, a, 0, index);
        System.arraycopy(old, index + 1, a, index, old.length - index - 1);
        array = a;
        return gone;
    }

    @Override public boolean remove(Object o) {
        int at = indexOf(o);
        if (at < 0) return false;
        remove(at);
        return true;
    }

    /** Adds the element unless the list holds one equal to it. */
    public boolean addIfAbsent(E e) {
        return !contains(e) && add(e);
    }

    @Override public boolean addAll(Collection<? extends E> c) {
        Object[] more = c.toArray();
        if (more.length == 0) return false;
        Object[] old = array;
        Object[] a = Arrays.copyOf(old, old.length + more.length);
        System.arraycopy(more, 0, a, old.length, more.length);
        array = a;
        return true;
    }

    @Override public boolean addAll(int index, Collection<? extends E> c) {
        Object[] more = c.toArray();
        Object[] old = array;
        if (index < 0 || index > old.length) throw new IndexOutOfBoundsException("Index: " + index);
        if (more.length == 0) return false;
        Object[] a = new Object[old.length + more.length];
        System.arraycopy(old, 0, a, 0, index);
        System.arraycopy(more, 0, a, index, more.length);
        System.arraycopy(old, index, a, index + more.length, old.length - index);
        array = a;
        return true;
    }

    @Override public void clear() { array = EMPTY; }

    @SuppressWarnings("unchecked")
    @Override public boolean removeIf(Predicate<? super E> filter) {
        Objects.requireNonNull(filter);
        Object[] old = array;
        Object[] kept = new Object[old.length];
        int n = 0;
        for (Object o : old) {
            if (!filter.test((E) o)) kept[n++] = o;
        }
        if (n == old.length) return false;
        array = n == 0 ? EMPTY : Arrays.copyOf(kept, n);
        return true;
    }

    @Override public boolean removeAll(Collection<?> c) {
        Objects.requireNonNull(c);
        return removeIf(c::contains);
    }

    @Override public boolean retainAll(Collection<?> c) {
        Objects.requireNonNull(c);
        return removeIf(e -> !c.contains(e));
    }

    @SuppressWarnings("unchecked")
    @Override public void replaceAll(UnaryOperator<E> operator) {
        Object[] a = array.clone();
        for (int i = 0; i < a.length; i++) a[i] = operator.apply((E) a[i]);
        array = a;
    }

    @SuppressWarnings("unchecked")
    @Override public void sort(Comparator<? super E> c) {
        Object[] a = array.clone();
        Arrays.sort((E[]) a, c);
        array = a;
    }

    // ── Walking: over the array as it was when the walk began ─────────

    @Override public Iterator<E> iterator() { return new Snapshot<>(array, 0); }

    @Override public ListIterator<E> listIterator() { return new Snapshot<>(array, 0); }

    @Override public ListIterator<E> listIterator(int index) {
        Object[] a = array;
        if (index < 0 || index > a.length) throw new IndexOutOfBoundsException("Index: " + index);
        return new Snapshot<>(a, index);
    }

    @Override public List<E> subList(int from, int to) {
        // A copy: a view over an array that is replaced at every change would go stale.
        Object[] a = array;
        if (from < 0 || to > a.length || from > to) throw new IndexOutOfBoundsException();
        CopyOnWriteArrayList<E> part = new CopyOnWriteArrayList<>();
        part.array = Arrays.copyOfRange(a, from, to);
        return part;
    }

    private static final class Snapshot<E> implements ListIterator<E> {
        private final Object[] snapshot;
        private int cursor;

        Snapshot(Object[] snapshot, int start) {
            this.snapshot = snapshot;
            this.cursor = start;
        }

        @Override public boolean hasNext()     { return cursor < snapshot.length; }
        @Override public boolean hasPrevious() { return cursor > 0; }
        @Override public int nextIndex()       { return cursor; }
        @Override public int previousIndex()   { return cursor - 1; }

        @SuppressWarnings("unchecked")
        @Override public E next() {
            if (!hasNext()) throw new NoSuchElementException();
            return (E) snapshot[cursor++];
        }

        @SuppressWarnings("unchecked")
        @Override public E previous() {
            if (!hasPrevious()) throw new NoSuchElementException();
            return (E) snapshot[--cursor];
        }

        // As the JDK: a walk over a snapshot cannot change the list.
        @Override public void remove()  { throw new UnsupportedOperationException(); }
        @Override public void set(E e)  { throw new UnsupportedOperationException(); }
        @Override public void add(E e)  { throw new UnsupportedOperationException(); }
    }
}
