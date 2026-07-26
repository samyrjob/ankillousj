/*
 *  Copyright 2026 Alexey Andreev.
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

import static org.junit.Assert.assertEquals;
import java.awt.Color;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.teavm.junit.TeaVMTestRunner;

@RunWith(TeaVMTestRunner.class)
public class ColorTest {

    private static void assertColor(int r, int g, int b, int a, Color actual) {
        assertEquals("red", r, actual.getRed());
        assertEquals("green", g, actual.getGreen());
        assertEquals("blue", b, actual.getBlue());
        assertEquals("alpha", a, actual.getAlpha());
    }

    @Test
    public void brighterScalesChannels() {
        // 200 scales past the ceiling and clamps; 100 does not
        assertColor(142, 255, 142, 255, new Color(100, 200, 100).brighter());
    }

    @Test
    public void brighterSaturatesAt255() {
        assertColor(255, 255, 255, 255, new Color(255, 255, 255).brighter());
        assertColor(255, 255, 255, 255, new Color(200, 200, 200).brighter());
    }

    @Test
    public void brighterLiftsBlackOffZero() {
        // Nothing to scale, so black becomes a small grey rather than staying black.
        assertColor(3, 3, 3, 255, Color.BLACK.brighter());
    }

    @Test
    public void brighterLiftsVeryDarkChannels() {
        // Channels below the scaling floor would round back to themselves.
        assertColor(4, 4, 4, 255, new Color(1, 1, 1).brighter());
        assertColor(4, 4, 4, 255, new Color(2, 2, 2).brighter());
        assertColor(4, 4, 4, 255, new Color(3, 3, 3).brighter());
        assertColor(5, 5, 5, 255, new Color(4, 4, 4).brighter());
    }

    @Test
    public void brighterLeavesZeroChannelsAlone() {
        assertColor(142, 0, 0, 255, new Color(100, 0, 0).brighter());
    }

    @Test
    public void darkerScalesChannels() {
        assertColor(70, 140, 70, 255, new Color(100, 200, 100).darker());
        assertColor(178, 178, 178, 255, Color.WHITE.darker());
    }

    @Test
    public void darkerClampsAtZero() {
        assertColor(0, 0, 0, 255, Color.BLACK.darker());
        assertColor(0, 0, 0, 255, new Color(1, 1, 1).darker());
    }

    @Test
    public void alphaIsPreserved() {
        assertColor(142, 142, 142, 128, new Color(100, 100, 100, 128).brighter());
        assertColor(70, 70, 70, 128, new Color(100, 100, 100, 128).darker());
        assertColor(3, 3, 3, 0, new Color(0, 0, 0, 0).brighter());
    }

    @Test
    public void repeatedBrighterReachesWhite() {
        Color c = new Color(10, 20, 30);
        for (int i = 0; i < 20; i++) {
            c = c.brighter();
        }
        assertColor(255, 255, 255, 255, c);
    }

    @Test
    public void repeatedDarkerReachesBlack() {
        Color c = new Color(200, 200, 200);
        for (int i = 0; i < 30; i++) {
            c = c.darker();
        }
        assertColor(0, 0, 0, 255, c);
    }
}
