package main;

import entity.player.Player;
import ui.hud.ToolbarHUD;
import view.chat.CanvasInputFocus;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * The game window, in a browser tab.
 *
 * <p>On the desktop this class is a JFrame holding the game panel, with the
 * chat bar — a Swing text field and its send button — laid over the panel's
 * bottom edge. In a tab the page is the window and the panel is the canvas;
 * what is left to build is the chat bar, as an HTML input over the canvas.
 *
 * <p>Everything the bar DOES is the desktop class's own logic, kept line for
 * line: the bottom row's layout (the toolbar sits on the chat bar's line), the
 * placeholder, the 150 character limit, the typing flag, whisper mode with
 * its chip, the commands that are run and not said. Only the widget differs.
 * When the desktop class changes, this one needs the same change.
 */
public class GameWindow {

    private static final int CHAT_HEIGHT = 40;
    private static final int CHAT_FIELD_WIDTH = 350;
    private static final int SEND_WIDTH = 80;
    private static final int GAP_TOOLBAR_CHAT = 16;
    private static final int GAP_CHAT_SEND = 8;
    private static final int CHAT_BOTTOM_MARGIN = 12;
    private static final String PLACEHOLDER = "type here to write a message";
    private static final int MAX_CHAT_LEN = 150;

    public final GamePanel gamePanel;
    private final String refreshToken;
    private final FullscreenToggle fullscreen;
    /** The chat bar's elements; null where there is no page (a headless run). */
    private JSObject bar;

    /** Backwards-compatible 4-arg constructor. */
    public GameWindow(String username, String gender, String gameToken, int lookId) {
        this(username, gender, gameToken, lookId, null);
    }

    /** Without a figure: the look number says what we look like (the old looks). */
    public GameWindow(String username, String gender, String gameToken, int lookId, String refreshToken) {
        this(username, gender, gameToken, lookId, refreshToken,
                avatar.LegacyLookFigures.figureFor(lookId).toString());
    }

    public GameWindow(String username, String gender, String gameToken, int lookId, String refreshToken,
                      String figure) {
        this.refreshToken = refreshToken;
        this.gamePanel = new GamePanel(username, gender, gameToken, lookId, refreshToken, figure);
        this.fullscreen = new FullscreenToggle();
        gamePanel.setFullscreenToggle(fullscreen);
        initializeChatUI();
        // Leaving the page is closing the window: the game lets go of what it holds.
        onPageLeft(() -> gamePanel.cleanup());
        gamePanel.setOnFriendsBadgeChanged(() -> gamePanel.repaint());
    }

    // ══════════════════════════════════════════════════════════════
    // CHAT BAR
    // ══════════════════════════════════════════════════════════════

    private void initializeChatUI() {
        bar = createBar(PLACEHOLDER, MAX_CHAT_LEN,
                view.shared.Theme.GOLD_LIGHT.toCss(), view.shared.Theme.GOLD_DARK.toCss(),
                this::sendChatMessage,
                this::onTextChanged,
                this::onChatFocused,
                this::onChatFieldLostFocus,
                this::onEscape,
                () -> gamePanel.stopWhisper());

        // "Whisper" on a person's card puts the chat bar in whisper mode.
        gamePanel.onWhisperChanged = this::showWhisperMode;

        gamePanel.addComponentListener(new awt.event.ComponentAdapter() {
            @Override public void componentResized(awt.event.ComponentEvent e) { positionBottomRow(); }
        });
    }

    /** The chat bar took the keyboard: no canvas search box keeps drawing itself as the focused one. */
    private void onChatFocused() {
        CanvasInputFocus.clear();
        gamePanel.repaint();
    }

    /** Reset the chat bar when it loses the keyboard. */
    private void onChatFieldLostFocus() {
        if (gamePanel.player != null) gamePanel.player.setTyping(false);
        gamePanel.repaint();
    }

    private void onTextChanged(String text) {
        boolean typing = text != null && !text.trim().isEmpty();
        if (gamePanel.player != null) gamePanel.player.setTyping(typing);
    }

    /** Esc ends whisper mode; with no whisper it hands the keyboard back to the game. */
    private void onEscape() {
        if (gamePanel.whisperTo != null) gamePanel.stopWhisper();
        else gamePanel.requestFocusInWindow();
    }

    /** The chip's words: who the whisper goes to, and how to stop. */
    private static String whisperChip(String name) {
        return "Whisper to " + name + "  ×";
    }

    /** The chat bar whispers to this person (null: talks to the room): its text starts after the chip. */
    private void showWhisperMode(String name) {
        if (bar == null) return;
        setChip(bar, name == null ? null : whisperChip(name));
        if (name != null) focusField(bar);
    }

    /**
     * The bottom row: toolbar, chat field, send button, centred together. The
     * toolbar is drawn by the game; its place is decided here, as on the
     * desktop, so the row reads as one band.
     */
    private void positionBottomRow() {
        int panelWidth = gamePanel.getWidth();
        int panelHeight = gamePanel.getHeight();

        ToolbarHUD toolbar = gamePanel.ui == null ? null : gamePanel.ui.getToolbarHUD();
        if (toolbar == null) return;

        int toolbarWidth = toolbar.getBarWidth();
        int totalRowWidth = toolbarWidth + GAP_TOOLBAR_CHAT
                          + CHAT_FIELD_WIDTH + GAP_CHAT_SEND + SEND_WIDTH;
        int rowStartX = (panelWidth - totalRowWidth) / 2;
        toolbar.setBarX(rowStartX);

        int chatX = rowStartX + toolbarWidth + GAP_TOOLBAR_CHAT;
        int rowY = Math.max(0, panelHeight - CHAT_HEIGHT - CHAT_BOTTOM_MARGIN);
        int rowCenterY = rowY + CHAT_HEIGHT / 2;
        toolbar.setBarY(rowCenterY - toolbar.getBarHeight() / 2);

        int sendX = chatX + CHAT_FIELD_WIDTH + GAP_CHAT_SEND;
        if (bar != null) {
            placeBar(bar, panelWidth, chatX, rowY, CHAT_FIELD_WIDTH, CHAT_HEIGHT, sendX, SEND_WIDTH);
        }
        gamePanel.repaint();
    }

    private void sendChatMessage() {
        if (bar == null) return;
        String text = fieldText(bar).trim();
        if (text.isEmpty()) return;

        // Hard cap — mirror server-side ChatCommand.MAX_MESSAGE_LENGTH so we
        // fail fast before the round-trip. Server still re-validates.
        if (text.length() > MAX_CHAT_LEN) {
            text = text.substring(0, MAX_CHAT_LEN);
        }

        gamePanel.player.setTyping(false);

        // :sea (a dev build only): the sea and beach preview past this room's back edges, on this
        // screen alone. Nothing is sent, nothing is stored.
        if (!config.AppConfig.isProduction() && ":sea".equalsIgnoreCase(text)) {
            String room = gamePanel.roomController != null ? gamePanel.roomController.getCurrentRoomId() : null;
            boolean on = tile.SeaPreview.toggle(room);
            System.out.println("[SEA] preview " + (on ? "on" : "off") + " in " + room);
            setFieldText(bar, "");
            focusField(bar);
            gamePanel.repaint();
            return;
        }

        // :boat (a dev build only): the boat test on the sea, on this screen alone.
        if (!config.AppConfig.isProduction() && ":boat".equalsIgnoreCase(text)) {
            System.out.println("[BOAT] " + gamePanel.sailing.toggleTest());
            setFieldText(bar, "");
            gamePanel.requestFocusInWindow();
            gamePanel.repaint();
            return;
        }

        // Whisper mode: for that person alone. The server sends it back to us
        // to draw, so a whisper that was refused (muted, gone) shows nothing.
        String whisperTo = gamePanel.whisperTo;
        if (whisperTo != null && !chat.ChatCommandLine.isCommand(text)) {
            if (gamePanel.networkManager != null) gamePanel.networkManager.sendWhisper(whisperTo, text);
            setFieldText(bar, "");
            focusField(bar);
            gamePanel.repaint();
            return;
        }

        // A command (":follow Bob") is run, not said: no bubble over our own head.
        // Its answer comes back from the server as a [SYSTEM] line.
        if (!chat.ChatCommandLine.isCommand(text)) {
            int bubbleStartY = gamePanel.player.spriteY + 50;
            gamePanel.player.messages.add(
                new Player.Message(gamePanel.player.name + ": " + text,
                        gamePanel.toWorldX(gamePanel.player.spriteX), gamePanel.toWorldY(bubbleStartY))
            );
        }

        if (gamePanel.networkManager != null) {
            gamePanel.networkManager.sendChatMessage(text);
        }

        setFieldText(bar, "");
        focusField(bar);   // keep the keyboard for the next line
        gamePanel.repaint();
    }

    // ══════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ══════════════════════════════════════════════════════════════

    /**
     * Starts the game once everything is loaded, as the desktop window does
     * when it becomes visible, and shows the chat bar.
     */
    public void reveal() {
        gamePanel.startGameThread();
        gamePanel.setupGame();
        gamePanel.notifyFriendsBadgeChanged();
        positionBottomRow();
        if (bar != null) showBar(bar);
        gamePanel.requestFocusInWindow();
    }

    public GamePanel getGamePanel() { return gamePanel; }

    public String getRefreshToken() { return refreshToken; }

    /** The page stands for the window: it has the keyboard when the tab does. */
    public awt.Window getWindow() { return new awt.Window(); }

    public void setFullscreen(boolean on) { fullscreen.setFullscreen(on); }
    public boolean isFullscreen()         { return fullscreen.isFullscreen(); }

    // ══════════════════════════════════════════════════════════════
    // THE PAGE
    // ══════════════════════════════════════════════════════════════

    @JSFunctor
    public interface Action extends JSObject { void run(); }

    @JSFunctor
    public interface TextAction extends JSObject { void run(String text); }

    /**
     * Builds the chat bar: a white field with a place for the whisper chip,
     * and the gold send button. Hidden until {@link #showBar}. Returns null
     * where there is no page to put it in.
     */
    @JSBody(params = { "placeholder", "maxLen", "goldLight", "goldDark",
                       "onSend", "onText", "onFocus", "onBlur", "onEscape", "onChip" }, script =
            "if (typeof document === 'undefined' || !document.body || !document.createElement) return null;"
          + "var style = document.createElement('style');"
          + "style.textContent = '.futura-chat::placeholder{color:rgb(160,155,180);opacity:1}'"
          + "  + '.futura-send:hover{filter:brightness(1.08)}.futura-send:active{filter:brightness(0.92)}';"
          + "(document.head || document.body).appendChild(style);"
          + "var root = document.createElement('div');"
          + "root.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:20;display:none';"
          + "var box = document.createElement('div');"
          + "box.style.cssText = 'position:absolute;box-sizing:border-box;display:flex;align-items:center;'"
          + "  + 'background:#fff;border-radius:10px;overflow:hidden;border:1px solid rgba(20,15,5,0.35)';"
          + "var chip = document.createElement('span');"
          + "chip.style.cssText = 'display:none;flex:none;margin-left:6px;padding:3px 8px;border-radius:9px;'"
          + "  + 'background:rgb(120,124,150);color:rgb(238,240,248);font:italic 12px sans-serif;'"
          + "  + 'cursor:pointer;white-space:nowrap;user-select:none';"
          + "var input = document.createElement('input');"
          + "input.type = 'text'; input.className = 'futura-chat'; input.maxLength = maxLen;"
          + "input.placeholder = placeholder; input.autocomplete = 'off'; input.spellcheck = false;"
          + "input.style.cssText = 'flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;'"
          + "  + 'color:#000;font:14px sans-serif;padding:4px 14px;box-sizing:border-box';"
          + "var send = document.createElement('button');"
          + "send.type = 'button'; send.className = 'futura-send'; send.textContent = '\\u2191';"
          + "send.style.cssText = 'position:absolute;box-sizing:border-box;border:1px solid rgba(20,15,5,0.35);'"
          + "  + 'border-radius:10px;cursor:pointer;font:bold 22px sans-serif;color:rgb(20,15,5);'"
          + "  + 'background:linear-gradient(180deg,' + goldLight + ',' + goldDark + ')';"
          + "box.appendChild(chip); box.appendChild(input);"
          + "root.appendChild(box); root.appendChild(send);"
          + "document.body.appendChild(root);"
          + "input.addEventListener('keydown', function(e) {"
          + "  if (e.key === 'Enter') { e.preventDefault(); onSend(); }"
          + "  else if (e.key === 'Escape') { e.preventDefault(); onEscape(); }"
          + "});"
          + "input.addEventListener('input', function() { onText(input.value); });"
          + "input.addEventListener('focus', function() { onFocus(); });"
          + "input.addEventListener('blur', function() { onBlur(); });"
          + "chip.addEventListener('mousedown', function(e) { e.preventDefault(); onChip(); });"
          + "send.addEventListener('click', function() { onSend(); });"
          + "return { root: root, box: box, chip: chip, input: input, send: send };")
    private static native JSObject createBar(String placeholder, int maxLen, String goldLight, String goldDark,
                                             Action onSend, TextAction onText, Action onFocus, Action onBlur,
                                             Action onEscape, Action onChip);

    /**
     * Puts the field and the button where the game's own units say, over the
     * canvas wherever the page shows it and at whatever size.
     */
    @JSBody(params = { "bar", "panelWidth", "x", "y", "w", "h", "sendX", "sendW" }, script =
            "var c = globalThis.__ankCanvas || document.querySelector('canvas');"
          + "var r = c ? c.getBoundingClientRect() : { left: 0, top: 0, width: panelWidth };"
          + "var s = (panelWidth > 0 && r.width > 0) ? r.width / panelWidth : 1;"
          + "var put = function(el, ex, ew) {"
          + "  el.style.left = (r.left + ex * s) + 'px'; el.style.top = (r.top + y * s) + 'px';"
          + "  el.style.width = (ew * s) + 'px'; el.style.height = (h * s) + 'px';"
          + "};"
          + "put(bar.box, x, w); put(bar.send, sendX, sendW);")
    private static native void placeBar(JSObject bar, int panelWidth, int x, int y, int w, int h,
                                        int sendX, int sendW);

    @JSBody(params = "bar", script = "bar.root.style.display = 'block';")
    private static native void showBar(JSObject bar);

    @JSBody(params = "bar", script = "return bar.input.value || '';")
    private static native String fieldText(JSObject bar);

    @JSBody(params = { "bar", "text" }, script = "bar.input.value = text;")
    private static native void setFieldText(JSObject bar, String text);

    @JSBody(params = "bar", script = "bar.input.focus();")
    private static native void focusField(JSObject bar);

    /** The whisper chip's words, or null to take it away. */
    @JSBody(params = { "bar", "text" }, script =
            "if (text) { bar.chip.textContent = text; bar.chip.style.display = 'inline-block'; }"
          + "else { bar.chip.style.display = 'none'; }")
    private static native void setChip(JSObject bar, String text);

    /** The page is being left (closed, reloaded, gone to another address). */
    @JSBody(params = "left", script =
            "if (typeof window !== 'undefined' && window.addEventListener) {"
          + "  window.addEventListener('pagehide', function() { left(); });"
          + "}")
    private static native void onPageLeft(Action left);
}
