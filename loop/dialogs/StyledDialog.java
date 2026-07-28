package view.room;

import ankillousj.ui.Overlay;

import awt.Component;

import java.util.Optional;

import org.teavm.jso.JSObject;

/**
 * The game's styled dialogs, as HTML overlays.
 *
 * <p>Same public API as the Swing original, so every call site is unchanged.
 * What differs is that these do not block: Swing's modal dialogs stop the
 * calling thread until dismissed, and a browser cannot do that without
 * freezing the event loop the dialog needs in order to be dismissed.
 *
 * <p>So {@link #showError} and {@link #showWarning} return immediately —
 * which is what their callers already expect, since they ignore the return.
 * {@link #showConfirm} returns empty and takes a callback instead; the
 * blocking form has no browser equivalent.
 */
public final class StyledDialog {

    private StyledDialog() { }

    public static void showError(Component parent, String title, String message) {
        show(title, message, "#ff8a8a");
    }

    public static void showWarning(Component parent, String title, String message) {
        show(title, message, "#e6c878");
    }

    public static void showInfo(Component parent, String title, String message) {
        show(title, message, "#a0c8f0");
    }

    private static void show(String title, String message, String accent) {
        JSObject[] box = new JSObject[1];
        box[0] = Overlay.dialog(
            "<span style=\"color:" + accent + "\">" + Overlay.escape(title) + "</span>",
            Overlay.escape(message),
            "<button class=\"ank-btn ank-btn-primary\" data-ok>OK</button>");
        Overlay.onClick(box[0], "[data-ok]", () -> Overlay.dismiss(box[0]));
        Overlay.focus(box[0], "[data-ok]");
    }

    /**
     * The confirm form.
     *
     * <p>Swing blocks here and returns the answer. A browser cannot, so the
     * answer arrives through {@code onConfirm} and this returns empty. Callers
     * written as {@code showConfirm(...).ifPresent(...)} keep compiling and
     * simply do nothing on the empty path — the work moves into the callback.
     */
    public static Optional<String> showConfirm(Component parent, String title,
                                               String message, String confirmLabel,
                                               boolean destructive) {
        return showConfirm(parent, title, message, confirmLabel, destructive, null);
    }

    public static Optional<String> showConfirm(Component parent, String title,
                                               String message, String confirmLabel,
                                               boolean destructive, Runnable onConfirm) {
        JSObject[] box = new JSObject[1];
        String primary = destructive
            ? "<button class=\"ank-btn\" style=\"background:#7a1f1f;border-color:#a03030\" data-yes>"
            : "<button class=\"ank-btn ank-btn-primary\" data-yes>";
        box[0] = Overlay.dialog(
            Overlay.escape(title),
            Overlay.escape(message),
            "<button class=\"ank-btn\" data-no>Cancel</button>"
                + primary + Overlay.escape(confirmLabel) + "</button>");

        Overlay.onClick(box[0], "[data-no]", () -> Overlay.dismiss(box[0]));
        Overlay.onClick(box[0], "[data-yes]", () -> {
            Overlay.dismiss(box[0]);
            if (onConfirm != null) onConfirm.run();
        });
        return Optional.empty();
    }

    /** A list of choices. The selection arrives through the callback. */
    public static void showRoomSettings(Object parent, String roomName,
                                        String[] options,
                                        java.util.function.Consumer<String> onSelect) {
        StringBuilder list = new StringBuilder("<div class=\"ank-list\">");
        for (int i = 0; i < options.length; i++) {
            list.append("<button class=\"ank-item\" data-i=\"").append(i).append("\">")
                .append(Overlay.escape(options[i])).append("</button>");
        }
        list.append("</div>");

        JSObject[] box = new JSObject[1];
        box[0] = Overlay.dialog(
            "Room Settings — " + Overlay.escape(roomName),
            list.toString(),
            "<button class=\"ank-btn\" data-close>Close</button>");

        Overlay.onClick(box[0], "[data-close]", () -> Overlay.dismiss(box[0]));
        for (int i = 0; i < options.length; i++) {
            final String choice = options[i];
            Overlay.onClick(box[0], "[data-i=\"" + i + "\"]", () -> {
                Overlay.dismiss(box[0]);
                if (onSelect != null) onSelect.accept(choice);
            });
        }
    }

    /**
     * A text prompt.
     *
     * <p>Swing blocks and returns what the user typed. A browser cannot, so
     * this returns empty and delivers the value to {@code onValue}. Call sites
     * written as {@code promptInput(...).ifPresent(...)} still compile; the
     * work moves into the callback.
     */
    public static Optional<String> showInput(Component parent, String title,
                                             String message, String defaultValue) {
        return showInput(parent, title, message, defaultValue, null);
    }

    public static Optional<String> showInput(Component parent, String title, String message,
                                             String defaultValue,
                                             java.util.function.Consumer<String> onValue) {
        JSObject[] box = new JSObject[1];
        box[0] = Overlay.dialog(
            Overlay.escape(title),
            "<label class=\"ank-label\">" + Overlay.escape(message) + "</label>"
                + "<input class=\"ank-field\" data-input value=\""
                + Overlay.escape(defaultValue == null ? "" : defaultValue) + "\">",
            "<button class=\"ank-btn\" data-no>Cancel</button>"
                + "<button class=\"ank-btn ank-btn-primary\" data-yes>OK</button>");

        Overlay.onClick(box[0], "[data-no]", () -> Overlay.dismiss(box[0]));
        Overlay.onClick(box[0], "[data-yes]", () -> {
            String value = Overlay.valueOf(box[0], "[data-input]");
            Overlay.dismiss(box[0]);
            if (onValue != null && value != null && !value.isEmpty()) onValue.accept(value);
        });
        Overlay.focus(box[0], "[data-input]");
        return Optional.empty();
    }

    /** A pick-one list. Same non-blocking contract as {@link #showInput}. */
    public static Optional<String> showChoice(Component parent, String title, String message,
                                              String[] options, String defaultOption) {
        return showChoice(parent, title, message, options, defaultOption, null);
    }

    public static Optional<String> showChoice(Component parent, String title, String message,
                                              String[] options, String defaultOption,
                                              java.util.function.Consumer<String> onChoice) {
        StringBuilder body = new StringBuilder();
        if (message != null && !message.isEmpty()) {
            body.append("<div style=\"margin-bottom:6px\">").append(Overlay.escape(message)).append("</div>");
        }
        body.append("<div class=\"ank-list\" style=\"padding:0\">");
        for (int i = 0; i < options.length; i++) {
            body.append("<button class=\"ank-item\" data-i=\"").append(i).append("\">")
                .append(Overlay.escape(options[i])).append("</button>");
        }
        body.append("</div>");

        JSObject[] box = new JSObject[1];
        box[0] = Overlay.dialog(Overlay.escape(title), body.toString(),
            "<button class=\"ank-btn\" data-close>Cancel</button>");

        Overlay.onClick(box[0], "[data-close]", () -> Overlay.dismiss(box[0]));
        for (int i = 0; i < options.length; i++) {
            final String choice = options[i];
            Overlay.onClick(box[0], "[data-i=\"" + i + "\"]", () -> {
                Overlay.dismiss(box[0]);
                if (onChoice != null) onChoice.accept(choice);
            });
        }
        return Optional.empty();
    }
}
