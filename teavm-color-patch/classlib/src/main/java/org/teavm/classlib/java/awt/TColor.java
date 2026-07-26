/*
 *  Copyright 2015 Alexey Andreev.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package org.teavm.classlib.java.awt;

public class TColor {

    private int r;
    private int g;
    private int b;
    private int a;

    public static final TColor BLACK = new TColor(0, 0, 0);
    public static final TColor WHITE = new TColor(255, 255, 255);

    /**
     * Scale applied per channel by {@link #brighter()} and {@link #darker()}.
     * Chosen to reproduce the values the reference implementation produces.
     */
    private static final double SCALE = 0.7;

    /**
     * Smallest channel value that survives being scaled up. Anything positive
     * below this would round back to itself, so it is lifted to this floor
     * first; that is what makes brighter() escape very dark colours.
     */
    private static final int MIN_SCALABLE = (int) (1.0 / (1.0 - SCALE));

    public TColor(int r, int g, int b) {
        this(r, g, b, 255);
    }

    public TColor(int r, int g, int b, int a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public TColor(float r, float g, float b) {
        this(r, g, b, 1f);
    }

    public TColor(float r, float g, float b, float a) {
        this(Math.round(r * 255f), Math.round(g * 255f), 
            Math.round(b * 255f), Math.round(a * 255f));
    }

    public TColor(int value) {
        this.r = (value >> 16) & 0xFF;
        this.g = (value >> 8) & 0xFF;
        this.b = value & 0xFF;
        this.a = (value >> 24) & 0xFF;
    }

    public int getRed() {
        return r;
    }

    public int getGreen() {
        return g;
    }

    public int getBlue() {
        return b;
    }

    public int getAlpha() {
        return a;
    }

    /**
     * Returns a brighter version of this colour, keeping the alpha channel.
     *
     * <p>A fully black colour has nothing to scale, so it is lifted to a small
     * grey instead. Otherwise each non-zero channel is scaled up, saturating
     * at 255.
     *
     * <p>brighter() and darker() are approximate inverses, but repeated
     * application of both will not return the original colour because each
     * step rounds.
     */
    public TColor brighter() {
        if (r == 0 && g == 0 && b == 0) {
            return new TColor(MIN_SCALABLE, MIN_SCALABLE, MIN_SCALABLE, a);
        }
        return new TColor(scaleUp(r), scaleUp(g), scaleUp(b), a);
    }

    /**
     * Returns a darker version of this colour, keeping the alpha channel.
     *
     * @see #brighter()
     */
    public TColor darker() {
        return new TColor(scaleDown(r), scaleDown(g), scaleDown(b), a);
    }

    private static int scaleUp(int channel) {
        if (channel == 0) {
            return 0;
        }
        int lifted = channel < MIN_SCALABLE ? MIN_SCALABLE : channel;
        int scaled = (int) (lifted / SCALE);
        return scaled > 255 ? 255 : scaled;
    }

    private static int scaleDown(int channel) {
        int scaled = (int) (channel * SCALE);
        return scaled < 0 ? 0 : scaled;
    }
}
