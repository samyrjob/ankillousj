package security;

import java.math.BigInteger;

/**
 * Ed25519 signature verification, per RFC 8032.
 *
 * <h3>Why this exists</h3>
 *
 * The browser's own signature primitive, WebCrypto, is asynchronous, and
 * {@code Signature.verify()} is not. Rather than force every caller to become
 * async — or worse, argue that the check should be dropped — the arithmetic is
 * implemented here. It is pure computation, so it compiles and runs like any
 * other code, synchronously, with no platform dependency.
 *
 * <h3>Approach</h3>
 *
 * Field arithmetic uses {@link BigInteger} rather than packed limbs. That is
 * slower — milliseconds rather than microseconds — but signature verification
 * happens once per session, and the simpler code is far less likely to be
 * subtly wrong. Wrong crypto is worse than slow crypto.
 *
 * <h3>Not constant time</h3>
 *
 * BigInteger operations branch on data. That matters when handling a secret;
 * it does not here, because verification touches only public values: the
 * public key, the signature and the message. There is no secret to leak.
 *
 * <p>This class verifies only. Signing needs constant-time arithmetic to be
 * safe and is deliberately absent.
 */
public final class Ed25519 {

    private Ed25519() { }

    /** p = 2^255 - 19 */
    private static final BigInteger P =
        BigInteger.TWO.pow(255).subtract(BigInteger.valueOf(19));

    /** L = 2^252 + 27742317777372353535851937790883648493, the group order */
    private static final BigInteger L =
        BigInteger.TWO.pow(252).add(new BigInteger("27742317777372353535851937790883648493"));

    /** d = -121665 / 121666 mod p */
    private static final BigInteger D =
        BigInteger.valueOf(-121665)
            .multiply(BigInteger.valueOf(121666).modInverse(P)).mod(P);

    /** (p - 1) / 4, the exponent that yields sqrt(-1) */
    private static final BigInteger P_MINUS_1_DIV_4 =
        P.subtract(BigInteger.ONE).divide(BigInteger.valueOf(4));

    /** (p - 5) / 8, used by the square-root candidate */
    private static final BigInteger P_MINUS_5_DIV_8 =
        P.subtract(BigInteger.valueOf(5)).divide(BigInteger.valueOf(8));

    /** sqrt(-1) mod p */
    private static final BigInteger SQRT_M1 =
        BigInteger.TWO.modPow(P_MINUS_1_DIV_4, P);

    /** Base point B */
    private static final BigInteger BY =
        BigInteger.valueOf(4).multiply(BigInteger.valueOf(5).modInverse(P)).mod(P);
    private static final BigInteger BX = recoverX(BY, 0);

    private static final Point B = Point.affine(BX, BY);

    /**
     * Verifies an Ed25519 signature.
     *
     * @param publicKey 32-byte raw public key
     * @param message   the signed message
     * @param signature 64-byte signature
     * @return true when the signature is valid for this key and message
     */
    public static boolean verify(byte[] publicKey, byte[] message, byte[] signature) {
        if (publicKey == null || message == null || signature == null) return false;
        if (publicKey.length != 32 || signature.length != 64) return false;

        // S must be reduced; unreduced values would admit malleable signatures
        byte[] sBytes = new byte[32];
        System.arraycopy(signature, 32, sBytes, 0, 32);
        BigInteger s = littleEndian(sBytes);
        if (s.compareTo(L) >= 0) return false;

        byte[] rBytes = new byte[32];
        System.arraycopy(signature, 0, rBytes, 0, 32);

        Point a = decode(publicKey);
        if (a == null) return false;
        Point r = decode(rBytes);
        if (r == null) return false;

        // k = SHA512(R || A || M) reduced mod L
        byte[] buf = new byte[64 + message.length];
        System.arraycopy(rBytes, 0, buf, 0, 32);
        System.arraycopy(publicKey, 0, buf, 32, 32);
        System.arraycopy(message, 0, buf, 64, message.length);
        BigInteger k = littleEndian(Sha512.digest(buf)).mod(L);

        // [S]B == R + [k]A
        Point left = scalarMul(B, s);
        Point right = add(r, scalarMul(a, k));
        return left.equalsPoint(right);
    }

    // ── curve points, affine, with BigInteger coordinates ─────────────

    /** Extended coordinates: x = X/Z, y = Y/Z, x*y = T/Z. */
    private static final class Point {
        final BigInteger x;
        final BigInteger y;
        final BigInteger z;
        final BigInteger t;

        Point(BigInteger x, BigInteger y, BigInteger z, BigInteger t) {
            this.x = x; this.y = y; this.z = z; this.t = t;
        }

        static Point affine(BigInteger x, BigInteger y) {
            return new Point(x, y, BigInteger.ONE, x.multiply(y).mod(P));
        }

        /** Cross-multiplies, so no inversion is needed to compare. */
        boolean equalsPoint(Point o) {
            return x.multiply(o.z).mod(P).equals(o.x.multiply(z).mod(P))
                && y.multiply(o.z).mod(P).equals(o.y.multiply(z).mod(P));
        }
    }

    /** Neutral element (0, 1). */
    private static final Point ZERO =
        new Point(BigInteger.ZERO, BigInteger.ONE, BigInteger.ONE, BigInteger.ZERO);

    private static final BigInteger D2 = D.add(D).mod(P);

    /**
     * Twisted Edwards addition in extended coordinates, a = -1.
     *
     * The formula is complete: correct for every pair of points on the curve,
     * including doubling and the neutral element, so there are no special
     * cases to get wrong.
     */
    private static Point add(Point p1, Point p2) {
        BigInteger a = p1.y.subtract(p1.x).multiply(p2.y.subtract(p2.x)).mod(P);
        BigInteger b = p1.y.add(p1.x).multiply(p2.y.add(p2.x)).mod(P);
        BigInteger c = p1.t.multiply(D2).multiply(p2.t).mod(P);
        BigInteger d = p1.z.multiply(BigInteger.TWO).multiply(p2.z).mod(P);

        BigInteger e = b.subtract(a).mod(P);
        BigInteger f = d.subtract(c).mod(P);
        BigInteger g = d.add(c).mod(P);
        BigInteger h = b.add(a).mod(P);

        return new Point(e.multiply(f).mod(P), g.multiply(h).mod(P),
                         f.multiply(g).mod(P), e.multiply(h).mod(P));
    }

    /** Double-and-add. Not constant time — every input here is public. */
    private static Point scalarMul(Point p, BigInteger n) {
        Point result = ZERO;
        Point addend = p;
        BigInteger k = n;
        while (k.signum() > 0) {
            if (k.testBit(0)) result = add(result, addend);
            addend = add(addend, addend);
            k = k.shiftRight(1);
        }
        return result;
    }

    // ── encoding ──────────────────────────────────────────────────────

    /** Point decompression, RFC 8032 §5.1.3. Returns null when invalid. */
    private static Point decode(byte[] encoded) {
        byte[] yBytes = encoded.clone();
        int sign = (yBytes[31] & 0x80) >>> 7;
        yBytes[31] &= 0x7f;
        BigInteger y = littleEndian(yBytes);
        if (y.compareTo(P) >= 0) return null;   // non-canonical encoding

        BigInteger x = recoverX(y, sign);
        if (x == null) return null;
        return Point.affine(x, y);
    }

    /**
     * Solves x from y and the sign bit: x² = (y²-1) / (d·y²+1).
     *
     * @return null when no square root exists, i.e. the point is not on the curve
     */
    private static BigInteger recoverX(BigInteger y, int sign) {
        BigInteger y2 = y.multiply(y).mod(P);
        BigInteger u = y2.subtract(BigInteger.ONE).mod(P);
        BigInteger v = D.multiply(y2).add(BigInteger.ONE).mod(P);
        if (v.signum() == 0) return null;

        // candidate = u·v³·(u·v⁷)^((p-5)/8)
        BigInteger v3 = v.multiply(v).mod(P).multiply(v).mod(P);
        BigInteger v7 = v3.multiply(v3).mod(P).multiply(v).mod(P);
        BigInteger x = u.multiply(v3).mod(P)
                .multiply(u.multiply(v7).mod(P).modPow(P_MINUS_5_DIV_8, P)).mod(P);

        BigInteger vx2 = v.multiply(x).mod(P).multiply(x).mod(P);
        if (!vx2.equals(u.mod(P))) {
            if (vx2.equals(u.negate().mod(P))) {
                x = x.multiply(SQRT_M1).mod(P);          // the other root
            } else {
                return null;                              // not on the curve
            }
        }

        if (x.signum() == 0 && sign == 1) return null;    // -0 is not a valid encoding
        if (x.testBit(0) != (sign == 1)) x = P.subtract(x);
        return x;
    }

    /** Little-endian unsigned, which is how Ed25519 encodes everything. */
    private static BigInteger littleEndian(byte[] bytes) {
        byte[] be = new byte[bytes.length + 1];   // leading zero keeps it positive
        for (int i = 0; i < bytes.length; i++) {
            be[bytes.length - i] = bytes[i];
        }
        return new BigInteger(be);
    }
}
