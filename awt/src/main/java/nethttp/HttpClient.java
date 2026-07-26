package nethttp;

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

    /** Accepts and ignores the usual configuration; the browser owns the connection. */
    public static class Builder {
        public Builder connectTimeout(time.Duration timeout) { return this; }
        public Builder followRedirects(Object policy)        { return this; }
        public Builder version(Object version)               { return this; }
        public HttpClient build()                            { return new HttpClient(); }
    }
}
