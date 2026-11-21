package awt.datatransfer;

/** java.awt.datatransfer.StringSelection: a piece of text for the clipboard. */
public class StringSelection implements Transferable, ClipboardOwner {

    private final String data;

    public StringSelection(String data) { this.data = data; }

    @Override public DataFlavor[] getTransferDataFlavors() {
        return new DataFlavor[] { DataFlavor.stringFlavor };
    }

    @Override public boolean isDataFlavorSupported(DataFlavor flavor) {
        return DataFlavor.stringFlavor.equals(flavor);
    }

    @Override public Object getTransferData(DataFlavor flavor) throws UnsupportedFlavorException {
        if (!isDataFlavorSupported(flavor)) throw new UnsupportedFlavorException(flavor);
        return data;
    }

    @Override public void lostOwnership(Clipboard clipboard, Transferable contents) { }
}
