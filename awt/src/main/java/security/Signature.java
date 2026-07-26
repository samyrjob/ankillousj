package security;

import concurrent.CompletableFuture;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * java.security.Signature — and the one shim in this project that cannot be
 * made to work.
 *
 * <h3>Why</h3>
 *
 * {@code Signature.verify()} returns a boolean synchronously. The browser's
 * only signature primitive is WebCrypto's {@code subtle.verify()}, which
 * returns a Promise. There is no way to turn one into the other: waiting for
 * the promise means yielding to the event loop, and a synchronous method
 * cannot yield. This is not a missing feature, it is the shape of the
 * platform.
 *
 * <h3>What to do instead</h3>
 *
 * <b>Stop verifying on the client.</b> A JWT signature check protects the
 * party that trusts the token, and the client already holds it. An attacker
 * controlling the browser can edit the token, patch out the check, or skip it
 * entirely — so client-side verification stops nobody. The server has to
 * verify, and once it does, the client verifying again buys nothing beyond
 * catching accidental corruption.
 *
 * <p>If a client-side check is still wanted — to fail fast on an expired
 * token, say — {@link #verifyAsync} does it properly through WebCrypto and
 * hands back a future. That requires the call site to become asynchronous,
 * which is the honest cost.
 *
 * <p>Decoding a JWT's claims without checking the signature needs no crypto at
 * all: split on '.', Base64url-decode the payload. That covers expiry and
 * user-id checks, which is what most client code actually wants.
 */
public final class Signature {

    private Signature() { }

    /**
     * @throws UnsupportedOperationException always.
     */
    public static Signature getInstance(String algorithm) {
        throw new UnsupportedOperationException(
            "java.security.Signature cannot work in a browser: verify() is synchronous "
            + "and WebCrypto is asynchronous, and a synchronous method cannot await a "
            + "promise. Verify the token on the server — the client holding it cannot "
            + "meaningfully verify it anyway. If a client-side check is still needed, "
            + "use security.Signature.verifyAsync(...), which returns a future.");
    }

    /**
     * Verifies an Ed25519 signature through WebCrypto.
     *
     * @param publicKeyRaw the 32-byte raw Ed25519 public key
     * @param message      the signed bytes
     * @param signature    the 64-byte signature
     */
    public static CompletableFuture<Boolean> verifyAsync(byte[] publicKeyRaw,
                                                         byte[] message,
                                                         byte[] signature) {
        CompletableFuture<Boolean> result = new CompletableFuture<>();
        Native.verifyEd25519(toJs(publicKeyRaw), toJs(message), toJs(signature),
                result::complete,
                () -> result.completeExceptionally(
                        new RuntimeException("WebCrypto rejected the Ed25519 verification; "
                                + "Ed25519 support varies by browser and requires a secure context")));
        return result;
    }

    @JSFunctor
    interface BoolCallback extends JSObject { void call(boolean ok); }

    @JSFunctor
    interface ErrCallback extends JSObject { void call(); }

    @JSBody(params = "a", script = "return new Uint8Array(a);")
    private static native JSObject toJs(byte[] a);

    static final class Native {
        private Native() { }

        @JSBody(params = { "key", "msg", "sig", "ok", "err" }, script =
                "if (!globalThis.crypto || !globalThis.crypto.subtle) { err(); return; }"
              + "globalThis.crypto.subtle.importKey('raw', key, {name:'Ed25519'}, false, ['verify'])"
              + "  .then(function(k) {"
              + "    return globalThis.crypto.subtle.verify({name:'Ed25519'}, k, sig, msg);"
              + "  })"
              + "  .then(function(r) { ok(!!r); })"
              + "  .catch(function() { err(); });")
        static native void verifyEd25519(JSObject key, JSObject msg, JSObject sig,
                                         BoolCallback ok, ErrCallback err);
    }
}
