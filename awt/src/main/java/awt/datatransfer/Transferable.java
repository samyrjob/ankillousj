package awt.datatransfer;

import java.io.IOException;

/** java.awt.datatransfer.Transferable: something that can go to the clipboard. */
public interface Transferable {
    DataFlavor[] getTransferDataFlavors();
    boolean isDataFlavorSupported(DataFlavor flavor);
    Object getTransferData(DataFlavor flavor) throws UnsupportedFlavorException, IOException;
}
