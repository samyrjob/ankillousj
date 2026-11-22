package awt;

import awt.event.*;

import java.util.ArrayList;
import java.util.List;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;
import org.teavm.jso.dom.events.EventListener;
import org.teavm.jso.dom.events.KeyboardEvent;
import org.teavm.jso.dom.events.WheelEvent;
import org.teavm.jso.dom.html.HTMLCanvasElement;
import org.teavm.jso.dom.html.HTMLDocument;
import org.teavm.jso.canvas.CanvasRenderingContext2D;

/**
 * The bridge between a canvas element and AWT's listener model.
 *
 * A game panel extends this, registers the same listeners it always did, and
 * overrides paint(Graphics2D). Everything else — DOM wiring, coordinate
 * conversion, the repaint loop — happens here.
 *
 * Two details that are easy to get wrong:
 *
 *  - Coordinates. AWT gives component-local pixels. The browser gives viewport
 *    pixels, and the canvas may be scaled by CSS and again by devicePixelRatio.
 *    Both scalings have to be undone or every click lands in the wrong place.
 *
 *  - The repaint loop. Swing repaints on demand from the EDT; the browser wants
 *    requestAnimationFrame. repaint() sets a dirty flag that the next frame
 *    picks up, which collapses a burst of repaint() calls into one draw — the
 *    same coalescing Swing does.
 */
public class Component {

    private HTMLCanvasElement canvas;
    private CanvasRenderingContext2D ctx;
    private Graphics2D graphics;

    private final List<MouseListener> mouseListeners = new ArrayList<>();
    private final List<MouseMotionListener> motionListeners = new ArrayList<>();
    private final List<MouseWheelListener> wheelListeners = new ArrayList<>();
    private final List<KeyListener> keyListeners = new ArrayList<>();
    private final List<ComponentListener> componentListeners = new ArrayList<>();
    private final List<FocusListener> focusListeners = new ArrayList<>();

    private int width, height;
    private boolean dirty = true;
    private boolean pressed = false;

    /** Only the first component constructed claims the page's canvas. */
    private static boolean rootClaimed = false;

    /**
     * Matches java.awt.Component's protected no-arg constructor, so a game
     * panel extends this exactly as it extends the real thing.
     *
     * On a desktop a component becomes live when it is added to a container.
     * There is no container here, so the first one constructed binds itself to
     * the page's canvas — `globalThis.__ankCanvas` if the host set one, else
     * the first &lt;canvas&gt; in the document. That keeps game code free of
     * any AnkillousJ-specific call: `new MyPanel()` is the whole bootstrap.
     */
    protected Component() {
        if (!rootClaimed) {
            HTMLCanvasElement el = defaultCanvas();
            if (el != null) {
                rootClaimed = true;
                attach(el);
                // Deferred, not immediate. A subclass constructor has not run
                // yet at this point — `super()` completes before its own field
                // initialisers — so painting now would see half-built state.
                // A zero-delay timeout lets the whole constructor chain finish
                // first, which is also when Swing would first paint.
                deferStart(this::start);
            }
        }
    }

    @JSBody(params = "cb", script = "setTimeout(function() { cb(); }, 0);")
    private static native void deferStart(Callback cb);

    /** Binds this component to a canvas element. */
    public void attach(HTMLCanvasElement canvas) {
        this.canvas = canvas;
        this.ctx = (CanvasRenderingContext2D) canvas.getContext("2d");
        this.graphics = new Graphics2D(ctx);
        applyScaling();
        bindMouse();
        bindKeyboard();
        bindResize();
        repaint();
    }

    // ── Sizing ────────────────────────────────────────────────────────

    /**
     * Size the backing store to the CSS box times devicePixelRatio, then scale
     * the context so all drawing still happens in CSS pixels. Without this the
     * browser upscales a low-res bitmap and everything looks soft.
     */
    private void applyScaling() {
        double dpr = devicePixelRatio();
        double cssW = cssWidth(canvas);
        double cssH = cssHeight(canvas);
        if (cssW <= 0) cssW = canvas.getWidth();
        if (cssH <= 0) cssH = canvas.getHeight();

        this.width = (int) Math.round(cssW);
        this.height = (int) Math.round(cssH);

        canvas.setWidth((int) Math.round(cssW * dpr));
        canvas.setHeight((int) Math.round(cssH * dpr));
        setCssSize(canvas, cssW, cssH);
        // Sizing a canvas wipes its whole state: the graphics pushes its own
        // again, on top of the pixel ratio.
        graphics.setDeviceScale(dpr);
    }

    public int getWidth()  { return width; }
    public int getHeight() { return height; }

    // ── the JPanel surface a game panel actually uses ─────────────────
    //
    // A canvas-based panel needs very little of Swing: a size, a background,
    // focus, and a repaint. These are here so `extends JPanel` can become
    // `extends Component` without touching anything else in the class.

    private Color background = Color.BLACK;
    private Dimension preferredSize;
    private boolean focusable = true;
    private Cursor cursor = Cursor.getDefaultCursor();

    public void setPreferredSize(Dimension d) { preferredSize = d; }

    public Dimension getPreferredSize() {
        return preferredSize != null ? preferredSize : new Dimension(width, height);
    }

    public void setBackground(Color c) { background = c; }
    public Color getBackground()       { return background; }

    /** The canvas is always focusable in practice; this records the intent. */
    public void setFocusable(boolean b) { focusable = b; }
    public boolean isFocusable()        { return focusable; }

    public void requestFocus()             { focusCanvas(); }
    public boolean requestFocusInWindow()  { focusCanvas(); return true; }
    public boolean isFocusOwner()          { return true; }

    /** Canvas draws to a backbuffer already, so this is inherently true. */
    public void setDoubleBuffered(boolean b) { }
    public boolean isDoubleBuffered()        { return true; }

    public void setCursor(Cursor c) {
        cursor = c;
        if (canvas != null) setCssCursor(canvas, c.toCss());
    }

    public Cursor getCursor() { return cursor; }

    /**
     * AWT hands out a Graphics for drawing outside paint(). Returning the same
     * context is right here — there is one canvas and one context, and code
     * that draws through it lands on the same surface.
     */
    public Graphics2D getGraphics() { return graphics; }

    /** Text measured in {@code font}, without drawing and whatever font the graphics is set to. */
    public FontMetrics getFontMetrics(Font font) {
        return graphics != null ? graphics.getFontMetrics(font) : null;
    }

    // ── container methods ─────────────────────────────────────────────
    //
    // A Swing panel doubles as a container: overlays get added to it and
    // z-ordered. A canvas has no children — everything is drawn, not nested.
    // These are accepted and ignored so a panel that does both still compiles;
    // an overlay added this way simply never appears, which is the same
    // outcome as the dialog rewrite being outstanding.

    public void add(Object component)                       { }
    public void add(Object component, Object constraints)   { }
    public void remove(Object component)                    { }
    public void removeAll()                                 { }
    public void setLayout(Object layout)                    { }
    public void setComponentZOrder(Object component, int z) { }
    public int getComponentCount()                          { return 0; }

    public void setBounds(int x, int y, int w, int h) {
        this.width = w;
        this.height = h;
    }

    public Rectangle getBounds() { return new Rectangle(0, 0, width, height); }

    public void setSize(int w, int h) { setBounds(0, 0, w, h); }

    public Dimension getSize() { return new Dimension(width, height); }

    public void setVisible(boolean b) { }
    public boolean isVisible()        { return true; }
    public void revalidate()          { repaint(); }
    public void validate()            { }

    // ── Listener registration (same names as AWT) ─────────────────────

    public void addMouseListener(MouseListener l)             { mouseListeners.add(l); }
    public void addMouseMotionListener(MouseMotionListener l) { motionListeners.add(l); }
    public void addMouseWheelListener(MouseWheelListener l)   { wheelListeners.add(l); }
    public void addKeyListener(KeyListener l)                 { keyListeners.add(l); }
    public void addComponentListener(ComponentListener l)     { componentListeners.add(l); }
    public void addFocusListener(FocusListener l)             { focusListeners.add(l); }

    public void removeMouseListener(MouseListener l)          { mouseListeners.remove(l); }
    public void removeKeyListener(KeyListener l)              { keyListeners.remove(l); }

    // ── Painting ──────────────────────────────────────────────────────

    /**
     * Override this, exactly as with java.awt.Component. The argument is a
     * Graphics2D, so the usual `Graphics2D g2d = (Graphics2D) g;` cast works.
     */
    public void paint(Graphics g) { }

    /** Marks the component dirty; the next frame redraws. Coalesces like Swing. */
    public void repaint() { dirty = true; }

    /** Starts the requestAnimationFrame loop. */
    public void start() { requestFrame(this::frame); }

    /**
     * Whether components paint. A program that builds its panel long before showing it (a
     * loading screen first, as a desktop window stays hidden until it is ready) turns this
     * off before constructing and on when it reveals: no frame is drawn from a panel that is
     * still being built.
     */
    public static void setPaintingEnabled(boolean enabled) { paintingEnabled = enabled; }
    public static boolean isPaintingEnabled()             { return paintingEnabled; }
    private static boolean paintingEnabled = true;

    /**
     * The browser's frame: it only ASKS for a paint. The paint itself runs on
     * the event dispatch thread, as Swing's does, where it may wait (a picture
     * read on first use) and where it never overlaps a listener. One paint is
     * asked for at a time: a frame that finds the last one still queued or
     * running lets it be.
     */
    private void frame() {
        if (paintingEnabled && dirty && graphics != null && !paintQueued) {
            paintQueued = true;
            EventQueue.invokeLater(this::paintNow);
        }
        requestFrame(this::frame);
    }

    private boolean paintQueued;

    private void paintNow() {
        paintQueued = false;
        if (!paintingEnabled || !dirty || graphics == null) return;
        dirty = false;
        try {
            graphics.beginFrame(background, width, height);
            paint(graphics);
        } catch (RuntimeException | Error e) {
            // A failed paint must not end painting: it is reported and the next
            // frame tries again. The first failure is logged; the rest would be
            // the same one sixty times a second.
            if (!paintFailed) {
                paintFailed = true;
                reportPaintFailure(String.valueOf(e));
            }
        }
    }

    private boolean paintFailed;

    @JSBody(params = "m", script =
            "if (globalThis.__ankLog) globalThis.__ankLog('paint failed: ' + m);"
          + "else if (typeof console !== 'undefined') console.error('paint failed:', m);")
    private static native void reportPaintFailure(String message);


    // ── DOM -> AWT ────────────────────────────────────────────────────

    /**
     * Viewport coordinates to component-local ones. getBoundingClientRect
     * reflects any CSS scaling, so dividing by its size gives a 0..1 fraction
     * that maps cleanly onto the logical width.
     */
    private int localX(org.teavm.jso.dom.events.MouseEvent e) {
        double left = rectLeft(canvas), w = rectWidth(canvas);
        if (w <= 0) return (int) e.getClientX();
        return (int) Math.round((e.getClientX() - left) / w * width);
    }

    private int localY(org.teavm.jso.dom.events.MouseEvent e) {
        double top = rectTop(canvas), h = rectHeight(canvas);
        if (h <= 0) return (int) e.getClientY();
        return (int) Math.round((e.getClientY() - top) / h * height);
    }

    /** DOM buttons are 0/1/2; AWT is 1/2/3. */
    private static int awtButton(short domButton) {
        switch (domButton) {
            case 0: return awt.event.MouseEvent.BUTTON1;
            case 1: return awt.event.MouseEvent.BUTTON2;
            case 2: return awt.event.MouseEvent.BUTTON3;
            default: return awt.event.MouseEvent.NOBUTTON;
        }
    }

    private awt.event.MouseEvent toAwt(org.teavm.jso.dom.events.MouseEvent e, int clickCount, int id) {
        return new awt.event.MouseEvent(this, localX(e), localY(e),
                awtButton(e.getButton()), clickCount,
                e.getShiftKey(), e.getCtrlKey(), e.getAltKey(), e.getMetaKey())
                .with(id, buttonsDown(domButtons(e)));
    }

    /** DOM `buttons` is a bit per button held: 1 left, 2 right, 4 middle. AWT's extended masks say the same. */
    private static int buttonsDown(int domButtons) {
        return ((domButtons & 1) != 0 ? awt.event.InputEvent.BUTTON1_DOWN_MASK : 0)
             | ((domButtons & 4) != 0 ? awt.event.InputEvent.BUTTON2_DOWN_MASK : 0)
             | ((domButtons & 2) != 0 ? awt.event.InputEvent.BUTTON3_DOWN_MASK : 0);
    }

    // Every listener runs on the event dispatch thread (see EventQueue): the
    // browser's callback reads what the event says, while it is there to read,
    // and queues the delivery. A listener may then wait, as on a desktop; a
    // browser's own call may not. The lists are walked as copies: a listener
    // may add or remove one while it is being called.

    /** The latest mouse move not delivered yet. Moves come faster than they are worth: only the last counts. */
    private awt.event.MouseEvent pendingMove;

    private void bindMouse() {
        canvas.addEventListener("mousedown", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            pressed = true;
            final awt.event.MouseEvent me = toAwt(e, 1, awt.event.MouseEvent.MOUSE_PRESSED);
            EventQueue.invokeLater(() -> {
                for (MouseListener l : new ArrayList<>(mouseListeners)) l.mousePressed(me);
            });
        });
        canvas.addEventListener("mouseup", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            pressed = domButtons(e) != 0;
            final awt.event.MouseEvent me = toAwt(e, 1, awt.event.MouseEvent.MOUSE_RELEASED);
            EventQueue.invokeLater(() -> {
                for (MouseListener l : new ArrayList<>(mouseListeners)) l.mouseReleased(me);
            });
        });
        canvas.addEventListener("click", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            int clicks = detailOf(e);
            final awt.event.MouseEvent me = toAwt(e, clicks > 0 ? clicks : 1, awt.event.MouseEvent.MOUSE_CLICKED);
            EventQueue.invokeLater(() -> {
                for (MouseListener l : new ArrayList<>(mouseListeners)) l.mouseClicked(me);
            });
        });
        // The DOM fires "click" for the left button only; AWT clicks with every button.
        canvas.addEventListener("auxclick", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            int clicks = detailOf(e);
            final awt.event.MouseEvent me = toAwt(e, clicks > 0 ? clicks : 1, awt.event.MouseEvent.MOUSE_CLICKED);
            EventQueue.invokeLater(() -> {
                for (MouseListener l : new ArrayList<>(mouseListeners)) l.mouseClicked(me);
            });
        });
        canvas.addEventListener("mouseenter", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            final awt.event.MouseEvent me = toAwt(e, 0, awt.event.MouseEvent.MOUSE_ENTERED);
            EventQueue.invokeLater(() -> {
                for (MouseListener l : new ArrayList<>(mouseListeners)) l.mouseEntered(me);
            });
        });
        canvas.addEventListener("mouseleave", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            final awt.event.MouseEvent me = toAwt(e, 0, awt.event.MouseEvent.MOUSE_EXITED);
            EventQueue.invokeLater(() -> {
                for (MouseListener l : new ArrayList<>(mouseListeners)) l.mouseExited(me);
            });
        });
        // AWT splits movement by button state; the DOM does not.
        canvas.addEventListener("mousemove", (EventListener<org.teavm.jso.dom.events.MouseEvent>) e -> {
            // A button let go outside the canvas never said so here: the DOM's own count is the truth.
            pressed = domButtons(e) != 0;
            boolean alreadyQueued = pendingMove != null;
            pendingMove = toAwt(e, 0, pressed ? awt.event.MouseEvent.MOUSE_DRAGGED
                                              : awt.event.MouseEvent.MOUSE_MOVED);
            if (alreadyQueued) return;      // the queued delivery will take this newer one
            EventQueue.invokeLater(() -> {
                awt.event.MouseEvent me = pendingMove;
                pendingMove = null;
                if (me == null) return;
                if (me.getID() == awt.event.MouseEvent.MOUSE_DRAGGED) {
                    for (MouseMotionListener l : new ArrayList<>(motionListeners)) l.mouseDragged(me);
                } else {
                    for (MouseMotionListener l : new ArrayList<>(motionListeners)) l.mouseMoved(me);
                }
            });
        });
        canvas.addEventListener("wheel", (EventListener<WheelEvent>) e -> {
            double dy = e.getDeltaY();
            final MouseWheelEvent we = new MouseWheelEvent(this,
                    localX(e), localY(e),
                    dy > 0 ? 1 : (dy < 0 ? -1 : 0), dy / 100.0,
                    e.getShiftKey(), e.getCtrlKey(), e.getAltKey(), e.getMetaKey());
            e.preventDefault();             // the wheel is the game's: the page behind does not scroll
            EventQueue.invokeLater(() -> {
                for (MouseWheelListener l : new ArrayList<>(wheelListeners)) l.mouseWheelMoved(we);
            });
        });
        // right-click should reach the game, not the browser menu
        canvas.addEventListener("contextmenu",
                (EventListener<org.teavm.jso.dom.events.Event>) e -> e.preventDefault());
    }

    private void bindKeyboard() {
        // The canvas needs to be focusable to receive key events at all.
        makeFocusable(canvas);

        // As AWT: each event goes to the KeyEventDispatchers first, and to the
        // listeners only when none of them kept it. A character key gives two
        // events, KEY_PRESSED then KEY_TYPED.
        canvas.addEventListener("keydown", (EventListener<KeyboardEvent>) e -> {
            final int code = awtKeyCode(domKeyCode(e));
            final char c = keyCharOf(e);
            final boolean shift = e.isShiftKey(), ctrl = e.isCtrlKey(), alt = e.isAltKey(), meta = e.isMetaKey();
            // AltGr is how many keyboards type @ # { [ and the like, and Windows reports it as
            // Ctrl+Alt. It is typing, not a shortcut.
            final boolean chord = (ctrl || meta) && !isAltGraph(e);
            // Whether the browser acts on the key too has to be said now, before the game has
            // seen it: the answer cannot wait for a listener that runs later.
            if (gameKeepsKey(code, chord)) e.preventDefault();
            EventQueue.invokeLater(() -> {
                KeyboardFocusManager focus = KeyboardFocusManager.getCurrentKeyboardFocusManager();
                KeyEvent pressedEvent = new KeyEvent(this, KeyEvent.KEY_PRESSED, code, c, shift, ctrl, alt, meta);
                if (!focus.dispatchToDispatchers(pressedEvent)) {
                    for (KeyListener l : new ArrayList<>(keyListeners)) l.keyPressed(pressedEvent);
                }
                // AWT fires keyTyped only for characters, and never for a Ctrl or Meta chord.
                if (c != KeyEvent.CHAR_UNDEFINED && !chord) {
                    KeyEvent typedEvent = new KeyEvent(this, KeyEvent.KEY_TYPED, KeyEvent.VK_UNDEFINED, c,
                            shift, ctrl, alt, meta);
                    if (!focus.dispatchToDispatchers(typedEvent)) {
                        for (KeyListener l : new ArrayList<>(keyListeners)) l.keyTyped(typedEvent);
                    }
                }
            });
        });
        canvas.addEventListener("keyup", (EventListener<KeyboardEvent>) e -> {
            final KeyEvent ke = new KeyEvent(this, KeyEvent.KEY_RELEASED, awtKeyCode(domKeyCode(e)), keyCharOf(e),
                    e.isShiftKey(), e.isCtrlKey(), e.isAltKey(), e.isMetaKey());
            EventQueue.invokeLater(() -> {
                if (!KeyboardFocusManager.getCurrentKeyboardFocusManager().dispatchToDispatchers(ke)) {
                    for (KeyListener l : new ArrayList<>(keyListeners)) l.keyReleased(ke);
                }
            });
        });
        canvas.addEventListener("focus", (EventListener<org.teavm.jso.dom.events.Event>) e -> {
            final FocusEvent fe = new FocusEvent(this);
            EventQueue.invokeLater(() -> {
                for (FocusListener l : new ArrayList<>(focusListeners)) l.focusGained(fe);
            });
        });
        canvas.addEventListener("blur", (EventListener<org.teavm.jso.dom.events.Event>) e -> {
            final FocusEvent fe = new FocusEvent(this);
            EventQueue.invokeLater(() -> {
                for (FocusListener l : new ArrayList<>(focusListeners)) l.focusLost(fe);
            });
        });
    }

    private void bindResize() {
        addWindowResize(() -> {
            applyScaling();
            final ComponentEvent ce = new ComponentEvent(this);
            EventQueue.invokeLater(() -> {
                for (ComponentListener l : new ArrayList<>(componentListeners)) l.componentResized(ce);
            });
            repaint();
        });
    }

    /**
     * DOM `key` maps to a character; `keyCode` is deprecated but still the
     * closest thing to AWT's virtual key codes. The values agree for letters,
     * digits, arrows, function keys, escape and space; {@link #awtKeyCode}
     * translates the ones that do not.
     */
    private static char keyCharOf(KeyboardEvent e) {
        String k = e.getKey();
        if (k != null && k.length() == 1) return k.charAt(0);
        if ("Enter".equals(k)) return '\n';
        if ("Tab".equals(k)) return '\t';
        if ("Backspace".equals(k)) return '\b';
        if ("Escape".equals(k)) return (char) 27;
        if ("Delete".equals(k)) return (char) 127;
        return KeyEvent.CHAR_UNDEFINED;
    }

    /** A DOM keyCode as the JDK's virtual key code: they differ for Enter, Delete, Insert and punctuation. */
    static int awtKeyCode(int dom) {
        switch (dom) {
            case 13:  return KeyEvent.VK_ENTER;
            case 46:  return KeyEvent.VK_DELETE;
            case 45:  return KeyEvent.VK_INSERT;
            case 44:  return KeyEvent.VK_PRINTSCREEN;
            case 91:  case 92: case 224: return KeyEvent.VK_META;   // the OS keys (93 is the menu key)
            case 93:  return KeyEvent.VK_CONTEXT_MENU;
            case 186: case 59:  return KeyEvent.VK_SEMICOLON;       // Firefox says 59
            case 187: case 61:  return KeyEvent.VK_EQUALS;          // Firefox says 61
            case 188: return KeyEvent.VK_COMMA;
            case 189: case 173: return KeyEvent.VK_MINUS;           // Firefox says 173
            case 190: return KeyEvent.VK_PERIOD;
            case 191: return KeyEvent.VK_SLASH;
            case 219: return KeyEvent.VK_OPEN_BRACKET;
            case 220: return KeyEvent.VK_BACK_SLASH;
            case 221: return KeyEvent.VK_CLOSE_BRACKET;
            default:  return dom;
        }
    }

    /**
     * Whether a key pressed while the game has the keyboard is the game's
     * alone. Nearly all are: left to itself a browser would scroll the page,
     * move the focus off the canvas, go back a page, open its quick search or
     * its own fullscreen. What stays the browser's: chords with Ctrl or Meta
     * (copy, paste, new tab), reload (F5) and its tools (F12).
     */
    private static boolean gameKeepsKey(int awtCode, boolean chord) {
        if (chord) return false;
        return awtCode != KeyEvent.VK_F5 && awtCode != KeyEvent.VK_F12;
    }

    @JSBody(params = "e", script = "return !!(e.getModifierState && e.getModifierState('AltGraph'));")
    private static native boolean isAltGraph(KeyboardEvent e);

    // ── JS interop ────────────────────────────────────────────────────

    @JSBody(script = "return window.devicePixelRatio || 1;")
    private static native double devicePixelRatio();

    @JSBody(params = "c", script = "return c.getBoundingClientRect().left;")
    private static native double rectLeft(HTMLCanvasElement c);

    @JSBody(params = "c", script = "return c.getBoundingClientRect().top;")
    private static native double rectTop(HTMLCanvasElement c);

    @JSBody(params = "c", script = "return c.getBoundingClientRect().width;")
    private static native double rectWidth(HTMLCanvasElement c);

    @JSBody(params = "c", script = "return c.getBoundingClientRect().height;")
    private static native double rectHeight(HTMLCanvasElement c);

    @JSBody(params = "c", script = "var r = c.getBoundingClientRect(); return r.width || c.clientWidth;")
    private static native double cssWidth(HTMLCanvasElement c);

    @JSBody(params = "c", script = "var r = c.getBoundingClientRect(); return r.height || c.clientHeight;")
    private static native double cssHeight(HTMLCanvasElement c);

    @JSBody(params = { "c", "w", "h" }, script = "c.style.width = w + 'px'; c.style.height = h + 'px';")
    private static native void setCssSize(HTMLCanvasElement c, double w, double h);

    @JSBody(params = "c", script =
            "if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex','0');" +
            "c.style.outline = 'none';" +
            "c.addEventListener('mousedown', function(){ c.focus(); });")
    private static native void makeFocusable(HTMLCanvasElement c);

    @JSBody(params = "e", script = "return e.keyCode || e.which || 0;")
    private static native int domKeyCode(KeyboardEvent e);

    /** DOM `buttons`: which mouse buttons are held, one bit each. JSO does not expose it. */
    @JSBody(params = "e", script = "return e.buttons || 0;")
    private static native int domButtons(org.teavm.jso.dom.events.MouseEvent e);

    /** DOM 'detail' carries the click count; JSO does not expose it. */
    @JSBody(params = "e", script = "return e.detail || 0;")
    private static native int detailOf(org.teavm.jso.dom.events.MouseEvent e);

    /**
     * TeaVM will not marshal a plain Runnable into a JS callback — a Java type
     * passed to JS has to be a @JSFunctor interface so the compiler knows to
     * emit a real function object.
     */
    @JSFunctor
    public interface Callback extends JSObject { void call(); }

    @JSBody(params = "cb", script = "requestAnimationFrame(function(){ cb(); });")
    private static native void requestFrame(Callback cb);

    @JSBody(params = "cb", script = "window.addEventListener('resize', function(){ cb(); });")
    private static native void addWindowResize(Callback cb);

    @JSBody(script =
            "if (typeof document === 'undefined') return null;" +
            "return globalThis.__ankCanvas || document.querySelector('canvas');")
    private static native HTMLCanvasElement defaultCanvas();

    @JSBody(params = { "c", "css" }, script = "c.style.cursor = css;")
    private static native void setCssCursor(HTMLCanvasElement c, String css);

    private void focusCanvas() {
        if (canvas != null) doFocus(canvas);
    }

    @JSBody(params = "c", script = "if (c.focus) c.focus();")
    private static native void doFocus(HTMLCanvasElement c);
}
