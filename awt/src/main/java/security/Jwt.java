package security;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Reading a JWT's claims without verifying it.
 *
 * This is what most client code actually needs. Expiry checks and "which user
 * am I" do not require a signature check — the server does that, and it is the
 * only check that means anything. Splitting on '.' and Base64url-decoding the
 * payload needs no crypto and works everywhere.
 */
public final class Jwt {

    private Jwt() { }

    /** @return the raw JSON payload, or null if the token is malformed. */
    public static String decodePayload(String compactJwt) {
        if (compactJwt == null) return null;
        int first = compactJwt.indexOf('.');
        if (first < 0) return null;
        int second = compactJwt.indexOf('.', first + 1);
        if (second < 0) return null;
        try {
            byte[] raw = Base64.getUrlDecoder().decode(compactJwt.substring(first + 1, second));
            return new String(raw, StandardCharsets.UTF_8);
        } catch (RuntimeException e) {
            return null;
        }
    }

    public static String decodeHeader(String compactJwt) {
        if (compactJwt == null) return null;
        int first = compactJwt.indexOf('.');
        if (first < 0) return null;
        try {
            byte[] raw = Base64.getUrlDecoder().decode(compactJwt.substring(0, first));
            return new String(raw, StandardCharsets.UTF_8);
        } catch (RuntimeException e) {
            return null;
        }
    }

    /**
     * Reads a numeric claim such as {@code exp} or {@code iat} straight out of
     * the payload, without a JSON parser.
     *
     * @return the value, or -1 if absent or unparseable
     */
    public static long numericClaim(String compactJwt, String claim) {
        String payload = decodePayload(compactJwt);
        if (payload == null) return -1;
        String needle = "\"" + claim + "\"";
        int i = payload.indexOf(needle);
        if (i < 0) return -1;
        i = payload.indexOf(':', i + needle.length());
        if (i < 0) return -1;
        int j = i + 1;
        while (j < payload.length() && payload.charAt(j) == ' ') j++;
        int start = j;
        while (j < payload.length() && Character.isDigit(payload.charAt(j))) j++;
        if (j == start) return -1;
        try {
            return Long.parseLong(payload.substring(start, j));
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    /** True when {@code exp} is in the past. Unsigned, so advisory only. */
    public static boolean isExpired(String compactJwt, long nowEpochSeconds) {
        long exp = numericClaim(compactJwt, "exp");
        return exp >= 0 && exp < nowEpochSeconds;
    }
}
