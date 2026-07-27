package awt.font;

/**
 * java.awt.font.TextAttribute.
 *
 * Canvas has no styled-text model, so these are identity keys only —
 * {@code Font.deriveFont(Map)} accepts them and returns the font unchanged.
 * The text renders; the decoration does not.
 */
public final class TextAttribute {

    public static final TextAttribute UNDERLINE     = new TextAttribute("underline");
    public static final TextAttribute STRIKETHROUGH = new TextAttribute("strikethrough");
    public static final TextAttribute WEIGHT        = new TextAttribute("weight");
    public static final TextAttribute SIZE          = new TextAttribute("size");

    public static final Integer UNDERLINE_ON      = 0;
    public static final Boolean STRIKETHROUGH_ON  = Boolean.TRUE;
    public static final Float   WEIGHT_BOLD       = 2.0f;

    private final String name;

    private TextAttribute(String name) { this.name = name; }

    @Override public String toString() { return name; }
}
