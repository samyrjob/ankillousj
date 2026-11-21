package awt.datatransfer;

/** java.awt.datatransfer.UnsupportedFlavorException: checked, as in the JDK. */
public class UnsupportedFlavorException extends Exception {
    public UnsupportedFlavorException(DataFlavor flavor) {
        super(flavor == null ? "null flavor" : flavor.getHumanPresentableName());
    }
}
