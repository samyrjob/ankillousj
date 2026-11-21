package awt.datatransfer;

/** java.awt.datatransfer.ClipboardOwner. */
public interface ClipboardOwner {
    void lostOwnership(Clipboard clipboard, Transferable contents);
}
