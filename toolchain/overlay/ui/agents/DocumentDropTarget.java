package ui.agents;

import awt.Component;

/**
 * Browser stand-in for the desktop class of the same name.
 *
 * <p>On the desktop this listens for files dragged from the file manager onto
 * the game and hands them to the agent exchange window. It is written against
 * {@code java.awt.dnd} and {@code java.io.File}: a drop target of the
 * operating system, and files read from its disk. A page has neither. It has
 * its own drop events, and a dropped file arrives as bytes, not as a path.
 *
 * <p>Until that is wired to the exchange window, attaching does nothing: the
 * game runs, and a file dropped on the tab is ignored.
 */
public final class DocumentDropTarget {

    private DocumentDropTarget() { }

    /** Same signature as the desktop class, so its one caller does not change. */
    public static void attach(Component canvas, AgentExchangeWindow window) { }
}
