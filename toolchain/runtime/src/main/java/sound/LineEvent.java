package sound;

/** javax.sound.sampled.LineEvent. */
public class LineEvent {

    public static class Type {
        public static final Type OPEN  = new Type("Open");
        public static final Type CLOSE = new Type("Close");
        public static final Type START = new Type("Start");
        public static final Type STOP  = new Type("Stop");
        private final String name;
        private Type(String name) { this.name = name; }
        @Override public String toString() { return name; }
    }

    private final Object line;
    private final Type type;

    LineEvent(Object line, Type type) { this.line = line; this.type = type; }

    public Object getLine() { return line; }
    public Type getType()   { return type; }
}
