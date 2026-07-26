package awt;

/** Constants only — canvas antialiases by default, so the hints are no-ops. */
public class RenderingHints {
    public static final Object KEY_ANTIALIASING      = "antialiasing";
    public static final Object VALUE_ANTIALIAS_ON    = "on";
    public static final Object VALUE_ANTIALIAS_OFF   = "off";
    public static final Object KEY_STROKE_CONTROL    = "strokeControl";
    public static final Object VALUE_STROKE_PURE     = "pure";
    public static final Object KEY_RENDERING         = "rendering";
    public static final Object VALUE_RENDER_QUALITY  = "quality";
    public static final Object KEY_TEXT_ANTIALIASING = "textAntialiasing";
    public static final Object VALUE_TEXT_ANTIALIAS_ON = "on";
    public static final Object KEY_INTERPOLATION     = "interpolation";
    public static final Object VALUE_INTERPOLATION_BILINEAR = "bilinear";
}
