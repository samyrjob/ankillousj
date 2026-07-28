package nethttp;

/**
 * java.net.http.HttpResponse.
 *
 * The generic parameter is carried for source compatibility; only String
 * bodies are supported, because that is what fetch() gives synchronously
 * through the shim.
 */
public class HttpResponse<T> {

    private final int status;
    private final T body;

    HttpResponse(int status, T body) {
        this.status = status;
        this.body = body;
    }

    public int statusCode() { return status; }
    public T body()         { return body; }

    /** java.net.http.HttpResponse.BodyHandler */
    public interface BodyHandler<T> { }

    public static final class BodyHandlers {
        private BodyHandlers() { }

        public static BodyHandler<String> ofString() { return new BodyHandler<String>() { }; }
    }
}
