package awt;

import awt.geom.AffineTransform;
import awt.geom.PathSink;
import awt.image.BufferedImage;

import org.teavm.jso.JSBody;
import org.teavm.jso.canvas.CanvasGradient;
import org.teavm.jso.canvas.CanvasImageSource;
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
 *    A restore() also takes back the colour, font, stroke and transform set
 *    since the save, which AWT's setClip never does: the shadow state is
 *    pushed again after each unwinding.
 *  - AWT can read its transform back (getTransform) and put it back
 *    (setTransform). The transform is shadowed here, and the canvas matrix is
 *    always the device matrix (the pixel ratio) times it.
 *  - AWT text is drawn from the baseline, same as fillText, so drawString maps
 *    directly with no y adjustment.
 */
public class Graphics2D extends Graphics {

    private final CanvasRenderingContext2D ctx;

    // Shadow state — AWT getters must work, and Canvas2D exposes little back
    private Color currentColor = Color.BLACK;
    private Paint currentPaint = null;
    private Font currentFont = new Font("SansSerif", Font.PLAIN, 12);
    private Composite currentComposite = AlphaComposite.SrcOver;
    private Stroke currentStroke = new BasicStroke(1f);
    private Shape currentClip = null;
    private int clipDepth = 0;
    /** True when this instance came from create() and owes the context a restore(). */
    private boolean ownsSave = false;

    /** The device matrix: what the canvas applies before anything the caller asks (the pixel ratio). */
    private double d00 = 1, d10 = 0, d01 = 0, d11 = 1, d02 = 0, d12 = 0;
    /** The caller's transform, as getTransform() reports it. */
    private final AffineTransform user = new AffineTransform();

    private final RenderingHints hints = new RenderingHints();
    /** KEY_INTERPOLATION: Java2D's default is nearest neighbour, so it is here too. */
    private boolean smooth = false;
    /** AlphaComposite.CLEAR is active: whatever is drawn erases. */
    private boolean clearing = false;
    /** AlphaComposite.SRC is active: what is drawn replaces what was there. */
    private boolean replacing = false;

    public Graphics2D(CanvasRenderingContext2D ctx) {
        this.ctx = ctx;
        // A context keeps what its last user left in it; AWT hands out a fresh state.
        applyAll();
    }

    /** The child of create(): the same context, the parent's state. */
    private Graphics2D(Graphics2D parent) {
        this.ctx = parent.ctx;
        this.ownsSave = true;
        this.currentColor     = parent.currentColor;
        this.currentPaint     = parent.currentPaint;
        this.currentFont      = parent.currentFont;
        this.currentComposite = parent.currentComposite;
        this.currentStroke    = parent.currentStroke;
        this.currentClip      = parent.currentClip;
        this.d00 = parent.d00; this.d10 = parent.d10; this.d01 = parent.d01;
        this.d11 = parent.d11; this.d02 = parent.d02; this.d12 = parent.d12;
        this.user.setTransform(parent.user);
        this.hints.add(parent.hints);
        this.smooth    = parent.smooth;
        this.clearing  = parent.clearing;
        this.replacing = parent.replacing;
    }

    /** Debug aid: how many unbalanced save() calls this instance is holding. */
    public int saveDepth() { return clipDepth + (ownsSave ? 1 : 0); }

    CanvasRenderingContext2D ctx() { return ctx; }

    // ── Shadow state -> canvas ────────────────────────────────────────

    /** Pushes the whole shadow state to the canvas: after a restore(), a resize, or at creation. */
    private void applyAll() {
        pushTransform();
        applyComposite();
        applyPaint();
        ctx.setFont(currentFont.toCss());
        ctx.setTextBaseline("alphabetic");
        applyStroke();
        smoothing(ctx, smooth);
    }

    /** The canvas matrix is the device matrix times the caller's. */
    private void pushTransform() {
        double[] u = new double[6];
        user.getMatrix(u);
        ctx.setTransform(
                d00 * u[0] + d01 * u[1],
                d10 * u[0] + d11 * u[1],
                d00 * u[2] + d01 * u[3],
                d10 * u[2] + d11 * u[3],
                d00 * u[4] + d01 * u[5] + d02,
                d10 * u[4] + d11 * u[5] + d12);
    }

    /**
     * A new frame of a component, as Swing begins one: the graphics is as new
     * (no clip, no transform, plain stroke and composite, no hints, black), and
     * the panel is filled with its background. Swing hands paint() a fresh
     * Graphics each time and an opaque panel clears itself first; one canvas
     * context serves every frame here, so both are done by hand. Without it
     * whatever a frame left set would leak into the next, and what moved would
     * leave a trail.
     */
    void beginFrame(Color background, int width, int height) {
        while (clipDepth > 0) { ctx.restore(); clipDepth--; }
        currentClip = null;
        user.setToIdentity();
        currentComposite = AlphaComposite.SrcOver;
        currentStroke = new BasicStroke(1f);
        currentPaint = null;
        currentColor = background != null ? background : Color.BLACK;
        hints.clear();
        smooth = false;
        applyAll();
        ctx.fillRect(0, 0, width, height);
        currentColor = Color.BLACK;
        applyPaint();
    }

    /**
     * The canvas was sized for a pixel ratio (and so lost all its state, saved
     * levels included): {@code scale} is how many device pixels one unit is.
     */
    void setDeviceScale(double scale) {
        d00 = scale; d10 = 0; d01 = 0; d11 = scale; d02 = 0; d12 = 0;
        clipDepth = 0;
        currentClip = null;
        applyAll();
    }

    // ── Paint / colour ────────────────────────────────────────────────

    public void setColor(Color c) {
        if (c == null) return;
        currentColor = c;
        currentPaint = null;
        applyPaint();
    }

    public Color getColor() { return currentColor; }

    public void setPaint(Paint p) {
        if (p == null) return;
        if (p instanceof Color) {
            setColor((Color) p);
            return;
        }
        currentPaint = p;
        applyPaint();
    }

    public Paint getPaint() { return currentPaint != null ? currentPaint : currentColor; }

    private void applyPaint() {
        if (clearing) {
            // CLEAR ignores the paint: an opaque source erases wholly.
            ctx.setFillStyle("#000");
            ctx.setStrokeStyle("#000");
            return;
        }
        Paint p = currentPaint;
        if (p instanceof GradientPaint) {
            GradientPaint gp = (GradientPaint) p;
            CanvasGradient grad = ctx.createLinearGradient(gp.x1, gp.y1, gp.x2, gp.y2);
            grad.addColorStop(0, gp.c1.toCss());
            grad.addColorStop(1, gp.c2.toCss());
            ctx.setFillStyle(grad);
            ctx.setStrokeStyle(grad);
        } else if (p instanceof RadialGradientPaint) {
            RadialGradientPaint rp = (RadialGradientPaint) p;
            CanvasGradient grad = ctx.createRadialGradient(rp.fx, rp.fy, 0, rp.cx, rp.cy, rp.radius);
            for (int i = 0; i < rp.stops(); i++) {
                grad.addColorStop(Math.max(0f, Math.min(1f, rp.fraction(i))), rp.color(i).toCss());
            }
            ctx.setFillStyle(grad);
            ctx.setStrokeStyle(grad);
        } else if (p instanceof TexturePaint) {
            TexturePaint tp = (TexturePaint) p;
            BufferedImage img = tp.getImage();
            int w = img == null ? 0 : img.getWidth(), h = img == null ? 0 : img.getHeight();
            if (w > 0 && h > 0) {
                pattern(ctx, img.source(), tp.anchorX(), tp.anchorY(),
                        tp.anchorWidth() / w, tp.anchorHeight() / h);
            }
        } else {
            String css = currentColor.toCss();
            ctx.setFillStyle(css);
            ctx.setStrokeStyle(css);
        }
    }

    // ── Stroke ────────────────────────────────────────────────────────

    public void setStroke(Stroke s) {
        if (s == null) return;
        currentStroke = s;
        applyStroke();
    }

    public Stroke getStroke() { return currentStroke; }

    private void applyStroke() {
        if (currentStroke instanceof BasicStroke) {
            BasicStroke bs = (BasicStroke) currentStroke;
            ctx.setLineWidth(bs.getLineWidth());
            ctx.setLineCap(bs.capCss());
            ctx.setLineJoin(bs.joinCss());
            lineDetails(ctx, bs.getMiterLimit(), bs.getDashArray(), bs.getDashPhase());
        }
    }

    // ── Composite (alpha) ─────────────────────────────────────────────

    public void setComposite(Composite c) {
        if (c == null) return;
        boolean wasClearing = clearing;
        currentComposite = c;
        applyComposite();
        if (wasClearing != clearing) applyPaint();
    }

    public Composite getComposite() { return currentComposite; }

    private void applyComposite() {
        String operation = "source-over";
        clearing = false;
        replacing = false;
        if (currentComposite instanceof AlphaComposite) {
            AlphaComposite ac = (AlphaComposite) currentComposite;
            operation = ac.cssOperation();
            clearing = ac.getRule() == AlphaComposite.CLEAR;
            replacing = ac.getRule() == AlphaComposite.SRC;
        }
        ctx.setGlobalAlpha(clearing ? 1.0 : currentComposite.getAlpha());
        ctx.setGlobalCompositeOperation(operation);
    }

    // ── Font & text ───────────────────────────────────────────────────

    public void setFont(Font f) {
        if (f == null) return;
        currentFont = f;
        ctx.setFont(f.toCss());
    }

    public Font getFont() { return currentFont; }

    public FontMetrics getFontMetrics() { return new FontMetrics(this, currentFont); }

    public FontMetrics getFontMetrics(Font f) { return new FontMetrics(this, f != null ? f : currentFont); }

    double measureTextWidth(String s) { return ctx.measureText(s).getWidth(); }

    /** The width of {@code s} in {@code f}, whatever font is current. */
    double measureTextWidth(String s, Font f) {
        if (f == null || f == currentFont) return measureTextWidth(s);
        ctx.setFont(f.toCss());
        double width = ctx.measureText(s).getWidth();
        ctx.setFont(currentFont.toCss());
        return width;
    }

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

    public void fillRect(int x, int y, int w, int h) {
        if (replacing) ctx.clearRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);
    }

    public void clearRect(int x, int y, int w, int h) { ctx.clearRect(x, y, w, h); }
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
    public void fillPolygon(Polygon p) { fill(p); }
    public void drawPolygon(Polygon p) { draw(p); }
    public void drawPolyline(int[] xs, int[] ys, int n){ polyPath(xs, ys, n, false); ctx.stroke(); }

    public void fillArc(int x, int y, int w, int h, int startDeg, int extentDeg) {
        double rx = w / 2.0, ry = h / 2.0;
        double start = -Math.toRadians(startDeg), end = -Math.toRadians(startDeg + extentDeg);
        ctx.beginPath();
        ctx.moveTo(x + rx, y + ry);
        ctx.ellipse(x + rx, y + ry, rx, ry, 0, Math.min(start, end), Math.max(start, end));
        ctx.closePath();
        ctx.fill();
    }

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
        ctx.beginPath();
        s.trace(this);
        ctx.clip();
        currentClip = s;
    }

    public Shape getClip() { return currentClip; }

    /** The box around the clip, or null when nothing is clipped. */
    public Rectangle getClipBounds() { return currentClip == null ? null : currentClip.getBounds(); }

    /** Takes every clip of this instance off the canvas, and puts back the state the restores took with them. */
    private void unwindClips() {
        if (clipDepth == 0) return;
        while (clipDepth > 0) { ctx.restore(); clipDepth--; }
        applyAll();
    }

    /**
     * AWT restores a clip by value. Canvas2D can only pop it, so restoring the
     * clip that was captured before ours means unwinding our saves.
     */
    public void setClip(Shape s) {
        unwindClips();
        currentClip = null;
        if (s != null) clip(s);
    }

    /** The int overload of setClip, which resets rather than intersects. */
    public void setClip(int x, int y, int w, int h) {
        unwindClips();
        currentClip = null;
        clipRect(x, y, w, h);
    }

    public void clipRect(int x, int y, int w, int h) {
        ctx.save();
        clipDepth++;
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        currentClip = new Rectangle(x, y, w, h);
    }

    // ── Transform ─────────────────────────────────────────────────────

    public void translate(int x, int y)       { user.translate(x, y);  ctx.translate(x, y); }
    public void translate(double x, double y) { user.translate(x, y);  ctx.translate(x, y); }
    public void scale(double sx, double sy)   { user.scale(sx, sy);    ctx.scale(sx, sy); }
    public void rotate(double theta)          { user.rotate(theta);    ctx.rotate(theta); }
    public void shear(double shx, double shy) { user.shear(shx, shy);  ctx.transform(1, shy, shx, 1, 0, 0); }

    /** A rotation about the point (x, y). */
    public void rotate(double theta, double x, double y) {
        translate(x, y);
        rotate(theta);
        translate(-x, -y);
    }

    /** Appends {@code t}: it is applied to what is drawn before the transform already there. */
    public void transform(AffineTransform t) {
        if (t == null) return;
        user.concatenate(t);
        double[] m = new double[6];
        t.getMatrix(m);
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }

    /** Replaces the transform: with what getTransform() returned, puts it back as it was. */
    public void setTransform(AffineTransform t) {
        if (t == null) user.setToIdentity();
        else user.setTransform(t);
        pushTransform();
    }

    /** A copy of the current transform. */
    public AffineTransform getTransform() { return new AffineTransform(user); }

    /** The screen drawn on: its default transform is the device pixel ratio. */
    public GraphicsConfiguration getDeviceConfiguration() { return new GraphicsConfiguration(d00); }

    // ── Rendering hints ───────────────────────────────────────────────
    //
    // A canvas antialiases shapes and text whatever is asked. The hint that
    // changes something is KEY_INTERPOLATION: how a scaled picture is sampled.

    public void setRenderingHint(Object key, Object value) {
        if (key == null) return;
        if (value == null) hints.remove(key); else hints.put(key, value);
        if (RenderingHints.KEY_INTERPOLATION.equals(key)) {
            smooth = value != null && !RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR.equals(value);
            smoothing(ctx, smooth);
        }
    }

    public Object getRenderingHint(Object key) { return hints.get(key); }

    /** A copy of the hints set on this graphics. */
    public RenderingHints getRenderingHints() { return new RenderingHints(hints); }

    /** Replaces every hint. */
    public void setRenderingHints(RenderingHints all) {
        hints.clear();
        setRenderingHint(RenderingHints.KEY_INTERPOLATION, null);
        addRenderingHints(all);
    }

    public void setRenderingHints(java.util.Map<?, ?> all) { setRenderingHints(new RenderingHints(all)); }

    public void addRenderingHints(RenderingHints more) {
        if (more == null) return;
        for (java.util.Map.Entry<Object, Object> e : more.asMap().entrySet()) {
            setRenderingHint(e.getKey(), e.getValue());
        }
    }

    public void addRenderingHints(java.util.Map<?, ?> more) { addRenderingHints(new RenderingHints(more)); }

    // ── Scratch contexts ──────────────────────────────────────────────

    /**
     * AWT create() returns an independent copy that dispose() throws away.
     * save()/restore() models that — but the restore has to happen even when
     * the child never touched the clip, or the transform set on the child
     * leaks into every later frame.
     */
    @Override
    public Graphics2D create() {
        ctx.save();
        return new Graphics2D(this);
    }

    public void dispose() {
        while (clipDepth > 0) { ctx.restore(); clipDepth--; }
        if (ownsSave) { ctx.restore(); ownsSave = false; }
    }

    // ── Shape rendering ───────────────────────────────────────────────

    /** A PathSink that writes straight into the canvas's current path. */
    private final PathSink canvasSink = new PathSink() {
        @Override public void moveTo(double x, double y) { ctx.moveTo(x, y); }
        @Override public void lineTo(double x, double y) { ctx.lineTo(x, y); }
        @Override public void quadTo(double cx, double cy, double x, double y) {
            ctx.quadraticCurveTo(cx, cy, x, y);
        }
        @Override public void curveTo(double a, double b, double c, double d, double x, double y) {
            ctx.bezierCurveTo(a, b, c, d, x, y);
        }
        @Override public void closePath() { ctx.closePath(); }
    };

    public PathSink sink() { return canvasSink; }

    public void fill(Shape s) {
        if (s == null) return;
        ctx.beginPath();
        s.emit(canvasSink);
        ctx.fill();   // nonzero winding: Area unions merge, reversed subpaths punch holes
    }

    /**
     * Stroke a shape.
     *
     * For an Area this strokes the combined path, seams and all. That sounds
     * wrong — AWT computes real boolean geometry and has no seam — but it was
     * measured against AWT on this codebase's own icons and wins:
     *
     *   stroke combined path            PSNR 29.1 dB   96.3% within 16/255
     *   clip to complement of union     PSNR 16.6 dB   87.3%
     *   clip to complement, 2x width    PSNR 15.5 dB   69.7%
     *
     * The complement-clip approach removes the seam but pushes the whole
     * outline outside the true contour, and that distortion costs more than
     * the seam does. In the outline-fill idiom this codebase uses — stroke
     * thick, fill, stroke thin — the thick stroke's seam is painted over by
     * the fill and only a hairline remains.
     *
     * Exact parity needs a polygon clipper (Vatti/Martinez) to compute the
     * real union contour. Bounded work, and now measurably low priority.
     */
    public void draw(Shape s) {
        if (s == null) return;
        ctx.beginPath();
        s.emit(canvasSink);
        ctx.stroke();
    }

    // ── Images ────────────────────────────────────────────────────────
    //
    // Through helpers that never throw: a picture that failed to load makes a
    // canvas throw where AWT simply draws nothing, and an exception here would
    // cost the rest of the frame, every frame.

    public boolean drawImage(BufferedImage img, int x, int y, Object observer) {
        if (img == null) return false;
        if (replacing) ctx.clearRect(x, y, img.getWidth(), img.getHeight());
        image(ctx, img.source(), x, y);
        return true;
    }

    public boolean drawImage(BufferedImage img, int x, int y, int w, int h, Object observer) {
        if (img == null) return false;
        if (replacing) ctx.clearRect(x, y, w, h);
        imageScaled(ctx, img.source(), x, y, w, h);
        return true;
    }

    /**
     * The transform overload. AWT applies the transform to this draw only, so
     * the canvas state is saved and restored around it.
     */
    public boolean drawImage(BufferedImage img, AffineTransform xform, Object observer) {
        if (img == null) return false;
        double[] m = new double[6];
        if (xform != null) {
            xform.getMatrix(m);
            ctx.save();
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        image(ctx, img.source(), 0, 0);
        if (xform != null) ctx.restore();
        return true;
    }

    public boolean drawImage(BufferedImage img,
                             int dx1, int dy1, int dx2, int dy2,
                             int sx1, int sy1, int sx2, int sy2, Object observer) {
        if (img == null) return false;
        if (replacing) ctx.clearRect(dx1, dy1, dx2 - dx1, dy2 - dy1);
        imagePart(ctx, img.source(), sx1, sy1, sx2 - sx1, sy2 - sy1,
                                     dx1, dy1, dx2 - dx1, dy2 - dy1);
        return true;
    }

    // ── JS interop ────────────────────────────────────────────────────

    @JSBody(params = { "ctx", "img", "x", "y" }, script =
            "try { ctx.drawImage(img, x, y); } catch (e) { }")
    private static native void image(CanvasRenderingContext2D ctx, CanvasImageSource img, double x, double y);

    @JSBody(params = { "ctx", "img", "x", "y", "w", "h" }, script =
            "try { ctx.drawImage(img, x, y, w, h); } catch (e) { }")
    private static native void imageScaled(CanvasRenderingContext2D ctx, CanvasImageSource img,
                                           double x, double y, double w, double h);

    @JSBody(params = { "ctx", "img", "sx", "sy", "sw", "sh", "dx", "dy", "dw", "dh" }, script =
            "try { ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); } catch (e) { }")
    private static native void imagePart(CanvasRenderingContext2D ctx, CanvasImageSource img,
                                         double sx, double sy, double sw, double sh,
                                         double dx, double dy, double dw, double dh);

    @JSBody(params = { "ctx", "on" }, script = "ctx.imageSmoothingEnabled = on;")
    private static native void smoothing(CanvasRenderingContext2D ctx, boolean on);

    @JSBody(params = { "ctx", "miter", "dash", "phase" }, script =
            "ctx.miterLimit = miter;"
          + "if (ctx.setLineDash) {"
          + "  ctx.setLineDash(dash ? Array.prototype.slice.call(dash) : []);"
          + "  ctx.lineDashOffset = phase;"
          + "}")
    private static native void lineDetails(CanvasRenderingContext2D ctx, double miter, float[] dash, double phase);

    /**
     * A repeating picture as the fill and stroke style. One copy sits at
     * (x, y) scaled by (sx, sy): the anchor rectangle of a TexturePaint.
     */
    @JSBody(params = { "ctx", "img", "x", "y", "sx", "sy" }, script =
            "try {"
          + "  var p = ctx.createPattern(img, 'repeat');"
          + "  if (!p) return;"
          + "  if (p.setTransform && typeof DOMMatrix !== 'undefined') {"
          + "    p.setTransform(new DOMMatrix([sx, 0, 0, sy, x, y]));"
          + "  }"
          + "  ctx.fillStyle = p;"
          + "  ctx.strokeStyle = p;"
          + "} catch (e) { }")
    private static native void pattern(CanvasRenderingContext2D ctx, CanvasImageSource img,
                                       double x, double y, double sx, double sy);
}
