package awt;

import java.util.HashMap;
import java.util.Map;

/**
 * java.awt.RenderingHints: the constants, and a set of hints as Graphics2D hands it out.
 *
 * A canvas antialiases shapes and text whatever is asked, so most hints are
 * only remembered. One is acted on: {@code KEY_INTERPOLATION}, which is
 * Canvas2D's {@code imageSmoothingEnabled} — nearest neighbour or smooth.
 */
public class RenderingHints {
    public static final Object KEY_ANTIALIASING      = "antialiasing";
    public static final Object VALUE_ANTIALIAS_ON    = "on";
    public static final Object VALUE_ANTIALIAS_OFF   = "off";
    public static final Object VALUE_ANTIALIAS_DEFAULT = "default";
    public static final Object KEY_STROKE_CONTROL    = "strokeControl";
    public static final Object VALUE_STROKE_PURE     = "pure";
    public static final Object VALUE_STROKE_NORMALIZE = "normalize";
    public static final Object VALUE_STROKE_DEFAULT  = "default";
    public static final Object KEY_RENDERING         = "rendering";
    public static final Object VALUE_RENDER_QUALITY  = "quality";
    public static final Object VALUE_RENDER_SPEED    = "speed";
    public static final Object VALUE_RENDER_DEFAULT  = "default";
    public static final Object KEY_TEXT_ANTIALIASING = "textAntialiasing";
    public static final Object VALUE_TEXT_ANTIALIAS_ON        = "on";
    public static final Object VALUE_TEXT_ANTIALIAS_OFF       = "off";
    public static final Object VALUE_TEXT_ANTIALIAS_DEFAULT   = "default";
    public static final Object VALUE_TEXT_ANTIALIAS_LCD_HRGB  = "lcd-hrgb";
    public static final Object VALUE_TEXT_ANTIALIAS_LCD_VRGB  = "lcd-vrgb";
    public static final Object VALUE_TEXT_ANTIALIAS_GASP      = "gasp";
    public static final Object KEY_ALPHA_INTERPOLATION        = "alphaInterpolation";
    public static final Object VALUE_ALPHA_INTERPOLATION_QUALITY = "quality";
    public static final Object VALUE_ALPHA_INTERPOLATION_SPEED   = "speed";
    public static final Object VALUE_ALPHA_INTERPOLATION_DEFAULT = "default";
    public static final Object KEY_COLOR_RENDERING            = "colorRendering";
    public static final Object VALUE_COLOR_RENDER_QUALITY     = "quality";
    public static final Object VALUE_COLOR_RENDER_SPEED       = "speed";
    public static final Object VALUE_COLOR_RENDER_DEFAULT     = "default";
    public static final Object KEY_DITHERING                  = "dithering";
    public static final Object VALUE_DITHER_ENABLE            = "enable";
    public static final Object VALUE_DITHER_DISABLE           = "disable";
    public static final Object VALUE_DITHER_DEFAULT           = "default";
    public static final Object KEY_FRACTIONALMETRICS          = "fractionalMetrics";
    public static final Object VALUE_FRACTIONALMETRICS_ON     = "on";
    public static final Object VALUE_FRACTIONALMETRICS_OFF    = "off";
    public static final Object VALUE_FRACTIONALMETRICS_DEFAULT = "default";
    public static final Object KEY_INTERPOLATION     = "interpolation";
    public static final Object VALUE_INTERPOLATION_NEAREST_NEIGHBOR = "nearest";
    public static final Object VALUE_INTERPOLATION_BILINEAR = "bilinear";
    public static final Object VALUE_INTERPOLATION_BICUBIC  = "bicubic";

    private final Map<Object, Object> hints = new HashMap<>();

    public RenderingHints() { }

    public RenderingHints(Object key, Object value) { hints.put(key, value); }

    public RenderingHints(Map<?, ?> init) {
        if (init != null) hints.putAll(init);
    }

    /** A copy of another set. */
    public RenderingHints(RenderingHints other) {
        if (other != null) hints.putAll(other.hints);
    }

    public Object get(Object key)               { return hints.get(key); }
    public Object put(Object key, Object value) { return hints.put(key, value); }
    public Object remove(Object key)            { return hints.remove(key); }
    public boolean containsKey(Object key)      { return hints.containsKey(key); }
    public boolean isEmpty()                    { return hints.isEmpty(); }
    public int size()                           { return hints.size(); }
    public void clear()                         { hints.clear(); }
    public void add(RenderingHints other)       { if (other != null) hints.putAll(other.hints); }

    /** The hints as a plain map, for a caller that walks them. */
    public Map<Object, Object> asMap() { return hints; }
}
