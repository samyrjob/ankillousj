# The Swing files, as HTML

The ten `javax.swing` files were the last of the port. Four of them mattered;
these are the replacements.

| | Swing | HTML |
|---|---|---|
| `StyledDialog` | 455 lines | 150 |
| `RoomCreationDialog` | 651 | 100 |
| `LoadingDialog` | 107 | 35 |
| `FrozenOverlay` | — | 60 |

## Why HTML rather than canvas

A canvas can draw a rectangle that looks like a dialog. It cannot give you a
text field. A real one needs focus, a caret, selection, clipboard, IME for
non-Latin input, and a screen reader that knows it is a text field. Drawing all
that is months of work and the result is still worse than the one the browser
ships.

So the dialogs are HTML elements positioned above the canvas. The palette is
read from the same Deep Indigo and gold values the canvas draws with, so they
match.

## The one real behavioural change

**Swing dialogs block. Browser dialogs cannot.**

`JOptionPane.showInputDialog` stops the calling thread until the user answers.
A browser cannot do that — suspending would freeze the event loop the dialog
needs in order to be dismissed. Waiting would deadlock, not delay.

So the prompts return `Optional.empty()` and deliver the answer to a callback:

```java
// compiles unchanged, and does nothing on the empty path
dialogs.promptInput("Rename Room", "New name:", current)
       .ifPresent(name -> controller.updateRoomName(id, name));

// the work moves into the callback
StyledDialog.showInput(null, "Rename Room", "New name:", current,
    name -> controller.updateRoomName(id, name));
```

Every call site still compiles. The ones that read the return value need their
body moved into the callback — there are not many, and the compiler does not
flag them, so they are worth grepping for: `promptInput`, `promptChoice`,
`showConfirm`.

## Tests

```bash
cd ../../awt/render && node ui.test.mjs
```

Nine assertions against the DOM the dialogs actually produce — a dialog that
rendered nothing would still "work" from Java's side, so the checks are about
what reaches the page: the stylesheet is injected once, each dialog appends,
the error message is present, the choice list has its options, the room form
has its name field and templates, the progress bar exists, the resume button
exists, and the markup is escaped rather than interpolated raw.

## Seeing them

```
web/index.html?uidemo
```

opens every dialog at once instead of starting the game.
