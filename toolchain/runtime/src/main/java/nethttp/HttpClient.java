package nethttp;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * java.net.http.HttpClient — only the WebSocket half.
 *
 * Plain HTTP requests are not routed through here: TeaVM already ships
 * java.net.HttpURLConnection, which is what most client code uses anyway.
 */
public class HttpClient {

    public static HttpClient newHttpClient() { return new HttpClient(); }

    public static Builder newBuilder() { return new Builder(); }

    public WebSocket.Builder newWebSocketBuilder() {
        return new BrowserWebSocket.BuilderImpl();
    }

    /**
     * Issues the request and waits. See the class docs: this blocks the page.
     */
    public <T> HttpResponse<T> send(HttpRequest request, HttpResponse.BodyHandler<T> handler) {
        JSObject result = Native.sendSync(
                request.method(),
                request.uri().toString(),
                headerJson(request),
                request.body());
        @SuppressWarnings("unchecked")
        HttpResponse<T> response = (HttpResponse<T>) new HttpResponse<>(
                Native.status(result), Native.text(result));
        return response;
    }

    /** The non-blocking form. Prefer this everywhere a callback is acceptable. */
    public concurrent.CompletableFuture<HttpResponse<String>> sendAsync(
            HttpRequest request, HttpResponse.BodyHandler<String> handler) {
        concurrent.CompletableFuture<HttpResponse<String>> future =
                new concurrent.CompletableFuture<>();
        Native.sendAsync(
                request.method(),
                request.uri().toString(),
                headerJson(request),
                request.body(),
                (status, text) -> future.complete(new HttpResponse<>(status, text)),
                () -> future.completeExceptionally(new RuntimeException("request failed")));
        return future;
    }

    private static String headerJson(HttpRequest request) {
        StringBuilder sb = new StringBuilder("{");
        java.util.List<String[]> hs = request.headerList();
        for (int i = 0; i < hs.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append('"').append(hs.get(i)[0]).append("\":\"").append(hs.get(i)[1]).append('"');
        }
        return sb.append('}').toString();
    }

    @JSFunctor
    interface ResponseHandler extends JSObject { void handle(int status, String text); }

    @JSFunctor
    interface ErrorHandler extends JSObject { void handle(); }

    static final class Native {
        private Native() { }

        @JSBody(params = { "method", "url", "headersJson", "body" }, script =
                "var x = new XMLHttpRequest();"
              + "x.open(method, url, false);"          // false = synchronous
              + "var h = JSON.parse(headersJson);"
              + "for (var k in h) x.setRequestHeader(k, h[k]);"
              + "try { x.send(body || null); } catch (e) { return { status: 0, text: '' }; }"
              + "return { status: x.status, text: x.responseText };")
        static native JSObject sendSync(String method, String url, String headersJson, String body);

        @JSBody(params = { "method", "url", "headersJson", "body", "ok", "err" }, script =
                "var h = JSON.parse(headersJson);"
              + "fetch(url, { method: method, headers: h, body: body || undefined })"
              + "  .then(function(r) { return r.text().then(function(t) { ok(r.status, t); }); })"
              + "  .catch(function() { err(); });")
        static native void sendAsync(String method, String url, String headersJson, String body,
                                     ResponseHandler ok, ErrorHandler err);

        @JSBody(params = "r", script = "return r.status;")
        static native int status(JSObject r);

        @JSBody(params = "r", script = "return r.text;")
        static native String text(JSObject r);
    }

    /** Accepts and ignores the usual configuration; the browser owns the connection. */
    public static class Builder {
        public Builder connectTimeout(time.Duration timeout) { return this; }
        public Builder connectTimeout(java.time.Duration timeout) { return this; }
        public Builder followRedirects(Object policy)        { return this; }
        public Builder version(Object version)               { return this; }
        public HttpClient build()                            { return new HttpClient(); }
    }
}
