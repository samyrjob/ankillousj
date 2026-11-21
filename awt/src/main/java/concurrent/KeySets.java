package concurrent;

import java.util.AbstractSet;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * {@code ConcurrentHashMap.newKeySet()}, which TeaVM's ConcurrentHashMap does
 * not have. The port rewrites the call to {@link #newKeySet()}.
 *
 * <p>The set is the keys of a ConcurrentHashMap, as the JDK's is, so it keeps
 * what makes it worth asking for: it can be changed while it is being walked,
 * without a ConcurrentModificationException.
 */
public final class KeySets {

    private KeySets() { }

    public static <T> Set<T> newKeySet() { return new KeySet<>(new ConcurrentHashMap<>()); }

    public static <T> Set<T> newKeySet(int initialCapacity) {
        return new KeySet<>(new ConcurrentHashMap<>(Math.max(1, initialCapacity)));
    }

    private static final class KeySet<T> extends AbstractSet<T> {
        private final ConcurrentHashMap<T, Boolean> map;

        KeySet(ConcurrentHashMap<T, Boolean> map) { this.map = map; }

        @Override public int size()                  { return map.size(); }
        @Override public boolean isEmpty()           { return map.isEmpty(); }
        @Override public boolean contains(Object o)  { return o != null && map.containsKey(o); }
        @Override public boolean add(T e)            { return map.put(e, Boolean.TRUE) == null; }
        @Override public boolean remove(Object o)    { return o != null && map.remove(o) != null; }
        @Override public void clear()                { map.clear(); }
        @Override public Iterator<T> iterator()      { return map.keySet().iterator(); }
    }
}
