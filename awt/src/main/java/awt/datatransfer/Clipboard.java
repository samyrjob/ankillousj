package awt.datatransfer;

import org.teavm.jso.JSBody;

/**
 * java.awt.datatransfer.Clipboard, over the browser's.
 *
 * Writing text works: the browser allows it from a key press or a click,
 * which is when a game copies. Reading is another matter — the browser only
 * gives the clipboard back through a promise, after asking the user — so
 * {@link #getContents} returns what this page last put there itself.
 */
public class Clipboard {

    private final String name;
    private Transferable contents;

    public Clipboard(String name) { this.name = name; }

    public String getName() { return name; }

    public void setContents(Transferable contents, ClipboardOwner owner) {
        this.contents = contents;
        if (contents != null && contents.isDataFlavorSupported(DataFlavor.stringFlavor)) {
            try {
                Object text = contents.getTransferData(DataFlavor.stringFlavor);
                if (text != null) writeText(text.toString());
            } catch (Exception ignored) {
                // Not text after all: nothing a browser clipboard can take.
            }
        }
    }

    /** What this page last copied; null when it copied nothing. */
    public Transferable getContents(Object requestor) { return contents; }

    public boolean isDataFlavorAvailable(DataFlavor flavor) {
        return contents != null && contents.isDataFlavorSupported(flavor);
    }

    public Object getData(DataFlavor flavor) throws UnsupportedFlavorException, java.io.IOException {
        if (contents == null) throw new UnsupportedFlavorException(flavor);
        return contents.getTransferData(flavor);
    }

    @JSBody(params = "text", script =
            "try {"
          + "  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {"
          + "    navigator.clipboard.writeText(text).catch(function() { });"
          + "  }"
          + "} catch (e) { }")
    private static native void writeText(String text);
}
