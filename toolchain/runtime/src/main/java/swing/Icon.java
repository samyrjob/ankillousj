package swing;

/**
 * swing.Icon.
 *
 * Present so the icon classes' {@code swingIcon()} helpers still compile.
 * Nothing consumes it — the same icons reach the screen through their own
 * {@code draw(Graphics2D, ...)}, which is the path the game actually uses.
 */
public interface Icon {
    int getIconWidth();
    int getIconHeight();
}
