package nethttp;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * java.net.http.HttpRequest.
 *
 * Requests are issued with fetch(), so this only records what to send.
 */
public class HttpRequest {

    private final URI uri;
    private final String method;
    private final List<String[]> headers;
    private final String body;
    private final long timeoutMillis;

    private HttpRequest(Builder b) {
        this.uri = b.uri;
        this.method = b.method;
        this.headers = b.headers;
        this.body = b.body;
        this.timeoutMillis = b.timeoutMillis;
    }

    public URI uri()             { return uri; }
    public String method()       { return method; }
    List<String[]> headerList()  { return headers; }
    String body()                { return body; }
    long timeoutMillis()         { return timeoutMillis; }

    public static Builder newBuilder()          { return new Builder(); }
    public static Builder newBuilder(URI uri)   { return new Builder().uri(uri); }

    public static class Builder {
        private URI uri;
        private String method = "GET";
        private final List<String[]> headers = new ArrayList<>();
        private String body;
        private long timeoutMillis;

        public Builder uri(URI uri)                        { this.uri = uri; return this; }
        public Builder header(String name, String value)   { headers.add(new String[]{name, value}); return this; }
        public Builder timeout(time.Duration d)            { timeoutMillis = d.toMillis(); return this; }
        public Builder timeout(java.time.Duration d)       { timeoutMillis = d.toMillis(); return this; }
        public Builder GET()                               { method = "GET"; return this; }

        public Builder POST(BodyPublisher publisher) {
            method = "POST";
            body = publisher.content();
            return this;
        }

        public Builder PUT(BodyPublisher publisher) {
            method = "PUT";
            body = publisher.content();
            return this;
        }

        public Builder DELETE() { method = "DELETE"; return this; }

        public HttpRequest build() { return new HttpRequest(this); }
    }

    /** java.net.http.HttpRequest.BodyPublisher — text bodies only. */
    public interface BodyPublisher {
        String content();
    }

    public static final class BodyPublishers {
        private BodyPublishers() { }

        public static BodyPublisher ofString(String s) { return () -> s; }
        public static BodyPublisher noBody()           { return () -> null; }
    }
}
