package awt.datatransfer;

/** java.awt.datatransfer.DataFlavor: the kinds of data a Transferable can give. */
public class DataFlavor {
    public static final DataFlavor stringFlavor       = new DataFlavor("text/plain", "Unicode String");
    public static final DataFlavor javaFileListFlavor = new DataFlavor("application/x-java-file-list", "File List");
    public static final DataFlavor imageFlavor        = new DataFlavor("image/x-java-image", "Image");

    private final String mimeType;
    private final String name;

    public DataFlavor(String mimeType, String humanPresentableName) {
        this.mimeType = mimeType;
        this.name = humanPresentableName;
    }

    public String getMimeType()              { return mimeType; }
    public String getHumanPresentableName()  { return name; }

    public boolean equals(DataFlavor other)  { return other != null && mimeType.equals(other.mimeType); }

    @Override public boolean equals(Object o) { return o instanceof DataFlavor && equals((DataFlavor) o); }
    @Override public int hashCode()           { return mimeType.hashCode(); }
    @Override public String toString()        { return "DataFlavor[" + mimeType + "]"; }
}
