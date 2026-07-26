package awt;

import org.teavm.jso.canvas.CanvasGradient;
import org.teavm.jso.canvas.CanvasRenderingContext2D;

/**
 * awt.Graphics2D implemented over the HTML5 Canvas 2D context.
 *
 * This is the AnkillousJ AWT backend in miniature: every Graphics2D call the
 * game makes is translated to Canvas2D. AWT is a *stateful* API (setColor,
 * setFont, setStroke persist until changed) and so is Canvas2D, so the mapping
 * is mostly direct. The parts that need care:
 *
 *  - AWT has one "current paint"; Canvas2D has separate fillStyle and
 *    strokeStyle. We keep a shadow copy and push it to both.
 *  - AWT clipping is set/restored by value (getClip / setClip); Canvas2D only
 *    has save()/restore(). We keep a depth counter and unwind on setClip(null).
 *  - AWT text is drawn from the baseline, same as fillText, so drawString maps
 *    directly with no y adjustment.
 */
public class Graphics2D {

    private final CanvasRenderingContext2D ctx;

    // Shadow state — AWT getters must work, and Canvas2D exposes little back
    private Color currentColor = Color.BLACK;
    private Paint currentPaint = null;
    private Font currentFont = new Font("SansSerif", Font.PLAIN, 12);
    private Composite currentComposite = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1f);
    private Stroke currentStroke = new BasicStroke(1f);
    private Shape currentClip = null;
    private int clipDepth = 0;

    public Graphics2D(CanvasRenderingContext2D ctx) {
        this.ctx = ctx;
        ctx.setTextBaseline("alphabetic");
        ctx.setFont(currentFont.toCss());
    }

    CanvasRenderingContext2D ctx() { return ctx; }

    // ── Paint / colour ────────────────────────────────────────────────

    public void setColor(Color c) {
        if (c == null) return;
        currentColor = c;
        currentPaint = null;
        String css = c.toCss();
        ctx.setFillStyle(css);
        ctx.setStrokeStyle(css);
    }

    public Color getColor() { return currentColor; }

    public void setPaint(Paint p) {
        if (p == null) return;
        currentPaint = p;
        if (p instanceof Color) {
            setColor((Color) p);
            return;
        }
        if (p instanceof GradientPaint) {
            GradientPaint gp = (GradientPaint) p;
            CanvasGradient grad = ctx.createLinearGradient(gp.x1, gp.y1, gp.x2, gp.y2);
            grad.addColorStop(0, gp.c1.toCss());
            grad.addColorStop(1, gp.c2.toCss());
            ctx.setFillStyle(grad);
            ctx.setStrokeStyle(grad);
        }
    }

    public Paint getPaint() { return currentPaint != null ? currentPaint : currentColor; }

    // ── Stroke ────────────────────────────────────────────────────────

    public void setStroke(Stroke s) {
        currentStroke = s;
        if (s instanceof BasicStroke) {
            BasicStroke bs = (BasicStroke) s;
            ctx.setLineWidth(bs.getLineWidth());
            ctx.setLineCap(bs.capCss());
            ctx.setLineJoin(bs.joinCss());
        }
    }

    public Stroke getStroke() { return currentStroke; }

    // ── Composite (alpha) ─────────────────────────────────────────────

    public void setComposite(Composite c) {
        if (c == null) return;
        currentComposite = c;
        ctx.setGlobalAlpha(c.getAlpha());
    }

    public Composite getComposite() { return currentComposite; }

    // ── Font & text ───────────────────────────────────────────────────

    public void setFont(Font f) {
        if (f == null) return;
        currentFont = f;
        ctx.setFont(f.toCss());
    }

    public Font getFont() { return currentFont; }

    public FontMetrics getFontMetrics() { return new FontMetrics(this, currentFont); }

    public FontMetrics getFontMetrics(Font f) { return new FontMetrics(this, f); }

    double measureTextWidth(String s) { return ctx.measureText(s).getWidth(); }

    /** AWT draws from the baseline; so does fillText with textBaseline=alphabetic. */
    public void drawString(String s, int x, int y) {
        if (s == null) return;
        ctx.fillText(s, x, y);
    }

    public void drawString(String s, float x, float y) {
        if (s == null) return;
        ctx.fillText(s, x, y);
    }

    // ── Rectangles ────────────────────────────────────────────────────

    public void fillRect(int x, int y, int w, int h) { ctx.fillRect(x, y, w, h); }
    public void drawRect(int x, int y, int w, int h) { ctx.strokeRect(x, y, w, h); }

    public void fillRoundRect(int x, int y, int w, int h, int aw, int ah) {
        roundRectPath(x, y, w, h, aw / 2.0, ah / 2.0);
        ctx.fill();
    }

    public void drawRoundRect(int x, int y, int w, int h, int aw, int ah) {
        roundRectPath(x, y, w, h, aw / 2.0, ah / 2.0);
        ctx.stroke();
    }

    /**
     * AWT's arcWidth/arcHeight are the full width/height of the corner arc,
     * so the CSS corner radius is half of each.
     */
    public void roundRectPath(double x, double y, double w, double h, double rx, double ry) {
        double r = Math.min(Math.min(rx, ry), Math.min(w / 2, h / 2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ── Ovals, lines, polygons ────────────────────────────────────────

    private void ovalPath(int x, int y, int w, int h) {
        ctx.beginPath();
        ctx.ellipse(x + w / 2.0, y + h / 2.0, w / 2.0, h / 2.0, 0, 0, Math.PI * 2);
    }

    public void fillOval(int x, int y, int w, int h) { ovalPath(x, y, w, h); ctx.fill(); }
    public void drawOval(int x, int y, int w, int h) { ovalPath(x, y, w, h); ctx.stroke(); }

    public void drawLine(int x1, int y1, int x2, int y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    private void polyPath(int[] xs, int[] ys, int n, boolean close) {
        if (n <= 0) return;
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (int i = 1; i < n; i++) ctx.lineTo(xs[i], ys[i]);
        if (close) ctx.closePath();
    }

    public void fillPolygon(int[] xs, int[] ys, int n) { polyPath(xs, ys, n, true);  ctx.fill(); }
    public void drawPolygon(int[] xs, int[] ys, int n) { polyPath(xs, ys, n, true);  ctx.stroke(); }
    public void drawPolyline(int[] xs, int[] ys, int n){ polyPath(xs, ys, n, false); ctx.stroke(); }

    public void drawArc(int x, int y, int w, int h, int startDeg, int extentDeg) {
        // AWT angles: degrees, counter-clockwise, 0 = 3 o'clock. Canvas: radians, clockwise.
        double start = -Math.toRadians(startDeg);
        double end   = -Math.toRadians(startDeg + extentDeg);
        ctx.beginPath();
        // Canvas sweeps clockwise from start to end; AWT sweeps counter-clockwise,
        // so the negated angles above already put them in the right order.
        ctx.ellipse(x + w / 2.0, y + h / 2.0, w / 2.0, h / 2.0, 0, Math.min(start, end), Math.max(start, end));
        ctx.stroke();
    }

    // ── Clipping ──────────────────────────────────────────────────────

    public void clip(Shape s) {
        if (s == null) return;
        ctx.save();
        clipDepth++;
        s.trace(this);
        ctx.clip();
        currentClip = s;
    }

    public Shape getClip() { return currentClip; }

    /**
     * AWT restores a clip by value. Canvas2D can only pop it, so restoring the
     * clip that was captured before ours means unwinding our saves.
     */
    public void setClip(Shape s) {
        while (clipDepth > 0) { ctx.restore(); clipDepth--; }
        currentClip = null;
        if (s != null) clip(s);
    }

    public void clipRect(int x, int y, int w, int h) {
        ctx.save();
        clipDepth++;
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
    }

    // ── Transform ─────────────────────────────────────────────────────

    public void translate(int x, int y)       { ctx.translate(x, y); }
    public void translate(double x, double y) { ctx.translate(x, y); }
    public void scale(double sx, double sy)   { ctx.scale(sx, sy); }
    public void rotate(double theta)          { ctx.rotate(theta); }
    public void shear(double shx, double shy) { ctx.transform(1, shy, shx, 1, 0, 0); }

    // ── Rendering hints (no-ops on canvas; antialiasing is always on) ──

    public void setRenderingHint(Object key, Object value) { }
    public Object getRenderingHint(Object key) { return null; }

    // ── Scratch contexts ──────────────────────────────────────────────

    /** AWT create() returns an independent copy; save()/restore() models it. */
    public Graphics2D create() {
        ctx.save();
        Graphics2D child = new Graphics2D(ctx);
        child.currentColor     = currentColor;
        child.currentPaint     = currentPaint;
        child.currentFont      = currentFont;
        child.currentComposite = currentComposite;
        child.currentStroke    = currentStroke;
        return child;
    }

    public void dispose() {
        while (clipDepth > 0) { ctx.restore(); clipDepth--; }
    }
}
