#version 300 es
precision highp float;
uniform vec2 uSize;
uniform float uTime;
uniform sampler2D uLayer;
out vec4 fragColor;

float clamp_01(float x) { return clamp(x, 0.0, 1.0); }
vec2 clamp_01(vec2 x) { return clamp(x, 0.0, 1.0); }
vec3 clamp_01(vec3 x) { return clamp(x, 0.0, 1.0); }
vec4 clamp_01(vec4 x) { return clamp(x, 0.0, 1.0); }

vec4 layerSample(vec2 p) {
  vec2 uv = vec2(p.x / max(uSize.x, 1.0), 1.0 - p.y / max(uSize.y, 1.0));
  return texture(uLayer, uv);
}

uniform vec4 uCurrentColor;
uniform float uScale;
uniform float uColorsCountF;
uniform float uDensity;
uniform float uAngle1;
uniform float uAngle2;
uniform float uPanelLength;
uniform float uEdgesF;
uniform float uBlur;
uniform float uFadeIn;
uniform float uFadeOut;
uniform float uGradient;
uniform vec4 uColorBack;
uniform vec4 uC0;
uniform vec4 uC1;
uniform vec4 uC2;
uniform vec4 uC3;
uniform vec4 uC4;
uniform vec4 uC5;
uniform vec4 uC6;

//
//  SWColorPanels.metal
//  ShipSwift
//
//  Color-panels procedural background as a SwiftUI Metal `colorEffect`.
//
//  Algorithm: pseudo-3D semi-transparent panels rotating around a
//  central vertical axis. Each panel is rendered analytically via a
//  perspective-projection trick: given a panel angle, derive z-depth
//  per pixel and decide which side of the panel we're on. Panels
//  spawn in two interleaved sets (forward / reverse) so the wheel
//  appears continuous. Panel count is colors-count-dependent (12 / 16 /
//  20 / 14) so the cycle stays visually coherent.
//





     float zLimit = 0.5;
     float TWO_PI = 6.28318530718;
     float PI     = 3.14159265358979;

    // Analytic perspective projection of one panel.
    // Returns (panelMask, panelMap) where:
    //   panelMask : how strongly this pixel belongs to the panel
    //   panelMap  : 0 at the far edge, 1 at the near edge
     vec2 getPanel(float angle,
                           vec2 uv,
                           float invLength,
                           float aa,
                           float a1,
                           float a2,
                           float blur,
                           float scale,
                           bool  edges)
    {
        float sinA = sin(angle);
        float cosA = cos(angle);

        float denom = sinA - uv.y * cosA;
        if (abs(denom) < 0.01) return vec2(0.0);

        float z = uv.y / denom;
        if (z <= 0.0 || z > zLimit) return vec2(0.0);

        float zRatio   = z / zLimit;
        float panelMap = 1.0 - zRatio;
        float x        = uv.x * (cosA * z + 1.0) * invLength;

        float zOffset = zRatio - 0.5;
        float left    = -0.5 + zOffset * a1;
        float right   =  0.5 - zOffset * a2;
        float blurX   = aa + 2.0 * panelMap * blur;

        float leftEdge1  = left  - blurX;
        float leftEdge2  = left  + 0.25 * blurX;
        float rightEdge1 = right - 0.25 * blurX;
        float rightEdge2 = right + blurX;

        float panel = smoothstep(leftEdge1, leftEdge2, x) *
                      (1.0 - smoothstep(rightEdge1, rightEdge2, x));
        panel *= mix(0.0, panel,
                     smoothstep(0.0, 0.01 / max(scale, 1e-6), panelMap));

        float midScreen = abs(sinA);
        if (edges) {
            panelMap = mix(0.99, panelMap,
                           panel * clamp(panelMap / (0.15 * (1.0 - pow(midScreen, 0.1))),
                                         0.0, 1.0));
        } else if (midScreen < 0.07) {
            panel *= (midScreen * 15.0);
        }

        return vec2(panel, panelMap);
    }

    // Composite one panel's color onto the running buffer.
     vec4 blendColor(vec4 colorA,
                             float  panelMask,
                             float  panelMap,
                             float  fadeIn,
                             float  fadeOut)
    {
        float fade = 1.0 - smoothstep(0.97 - 0.97 * fadeIn, 1.0, panelMap);
        fade *= smoothstep(-0.2 * (1.0 - fadeOut), fadeOut, panelMap);

        vec3 blendedRGB = mix(vec3(0.0), colorA.rgb, fade);
        float  blendedA   = mix(0.0, colorA.a, fade);
        return vec4(blendedRGB, blendedA) * panelMask;
    }


// Pseudo-3D rotating Color-Panels background.
//
// Parameters:
//   - position       : pixel position (`int`-relative).
//   - currentColor   : source color from `.colorEffect` (unused).
//   - boundingRect   : `(x, y, w, h)` of the view's bounding rect.
//   - time           : seconds since the renderer started.
//   - scale          : overall zoom (used for anti-aliasing scaling).
//   - colorsCountF   : number of active palette entries, 1...7.
//   - density        : angle between consecutive panels, 0.25...7.
//   - angle1         : top-edge skew, -1...1.
//   - angle2         : bottom-edge skew, -1...1.
//   - panelLength    : panel length relative to height, 0.05...3.
//   - edgesF         : 0 or 1 — edge highlight on/off.
//   - blur           : side blur (0 = sharp), 0...0.5.
//   - fadeIn         : transparency near the central axis, 0...1.
//   - fadeOut        : transparency near the viewer, 0...1.
//   - gradient       : intra-panel color mixing (0 = solid, 1 = gradient), 0...1.
//   - colorBack      : background color (premultiplied alpha respected).
//   - c0...c6        : up to 7 panel palette colors.

vec4 swColorPanels(vec2 position, vec4 currentColor, vec4 boundingRect, float time, float scale, float colorsCountF, float density, float angle1, float angle2, float panelLength, float edgesF, float blur, float fadeIn, float fadeOut, float gradient, vec4 colorBack, vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6) {

    

    vec2 size   = boundingRect.zw;
    float  maxDim = max(max(size.x, size.y), 1.0);

    // Object UV: centered, normalized so the wheel fills the longest
    // edge of the view (so a tall iPhone shows a full-screen fan, not
    // a strip in the middle).
    vec2 uv = (position - 0.5 * size) / (0.5 * maxDim);
    uv /= max(scale, 0.001);
    uv *= 1.25;

    float t = 0.02 * time;
    t = fract(t);
    bool reverseTime = (t < 0.5);

    vec3 color   = vec3(0.0);
    float  opacity = 0.0;

    float aa = 0.005 / max(scale, 0.001);
    int colorsCount = clamp(int(colorsCountF), 1, 7);

    // Local premultiplied palette.
    vec4 cs[7];
    cs[0] = c0; cs[1] = c1; cs[2] = c2; cs[3] = c3;
    cs[4] = c4; cs[5] = c5; cs[6] = c6;
    for (int i = 0; i < 7; i++) {
        if (i >= colorsCount) break;
        vec4 c = cs[i];
        c.rgb *= c.a;
        cs[i] = c;
    }

    float invLength = 1.5 / max(panelLength, 0.001);

    int   panelsNumber      = 12;
    float densityNormalizer = 1.0;
    if      (colorsCount == 4) { panelsNumber = 16; densityNormalizer = 1.34; }
    else if (colorsCount == 5) { panelsNumber = 20; densityNormalizer = 1.67; }
    else if (colorsCount == 7) { panelsNumber = 14; densityNormalizer = 1.17; }

    float fPanelsNumber = float(panelsNumber);
    float panelGrad     = 1.0 - clamp(gradient, 0.0, 1.0);
    bool  edges         = (edgesF > 0.5);

    for (int set = 0; set < 2; set++) {
        bool isForward = (set == 0 && !reverseTime) || (set == 1 && reverseTime);
        if (!isForward) continue;

        // Forward-rotating panels.
        for (int i = 0; i <= 20; i++) {
            if (i >= panelsNumber) break;
            int   idx    = panelsNumber - 1 - i;
            float offset = float(idx) / fPanelsNumber;
            if (set == 1) offset += 0.5;

            float densityFract = densityNormalizer * fract(t + offset);
            float angleNorm    = densityFract / max(density, 0.001);
            if (densityFract >= 0.5 || angleNorm >= 0.3) continue;

            float smoothDensity = clamp((0.5 - densityFract) / 0.1, 0.0, 1.0) *
                                  clamp(densityFract / 0.01, 0.0, 1.0);
            float smoothAngle   = clamp((0.3 - angleNorm) / 0.05, 0.0, 1.0);
            if (smoothDensity * smoothAngle < 0.001) continue;

            if (angleNorm > 0.5) angleNorm = 0.5;

            vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv,
                                    invLength, aa, angle1, angle2,
                                    blur, scale, edges);
            if (panel.x <= 0.001) continue;

            float panelMask = panel.x * smoothDensity * smoothAngle;
            float panelMap  = panel.y;

            int colorIdx     = idx % colorsCount;
            int nextColorIdx = (idx + 1) % colorsCount;
            vec4 colorA = vec4(cs[colorIdx]);
            vec4 colorB = vec4(cs[nextColorIdx]);

            colorA = mix(colorA, colorB,
                         max(0.0, smoothstep(0.0, 0.45, panelMap) - panelGrad));
            vec4 blended = blendColor(colorA, panelMask, panelMap, fadeIn, fadeOut);
            color   = blended.rgb + color * (1.0 - blended.a);
            opacity = blended.a   + opacity * (1.0 - blended.a);
        }

        // Reverse-rotating panels (mirrored across the axis).
        for (int i = 0; i <= 20; i++) {
            if (i >= panelsNumber) break;
            int   idx    = panelsNumber - 1 - i;
            float offset = float(idx) / fPanelsNumber;
            if (set == 0) offset += 0.5;

            float densityFract = densityNormalizer * fract(-t + offset);
            float angleNorm    = -densityFract / max(density, 0.001);
            if (densityFract >= 0.5 || angleNorm < -0.3) continue;

            float smoothDensity = clamp((0.5 - densityFract) / 0.1, 0.0, 1.0) *
                                  clamp(densityFract / 0.01, 0.0, 1.0);
            float smoothAngle   = clamp((angleNorm + 0.3) / 0.05, 0.0, 1.0);
            if (smoothDensity * smoothAngle < 0.001) continue;

            vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv,
                                    invLength, aa, angle1, angle2,
                                    blur, scale, edges);
            float panelMask = panel.x * smoothDensity * smoothAngle;
            if (panelMask <= 0.001) continue;
            float panelMap = panel.y;

            int colorIdx     = (colorsCount - (idx % colorsCount)) % colorsCount;
            if (colorIdx < 0) colorIdx += colorsCount;
            int nextColorIdx = (colorIdx + 1) % colorsCount;

            vec4 colorA = vec4(cs[colorIdx]);
            vec4 colorB = vec4(cs[nextColorIdx]);
            colorA = mix(colorA, colorB,
                         max(0.0, smoothstep(0.0, 0.45, panelMap) - panelGrad));
            vec4 blended = blendColor(colorA, panelMask, panelMap, fadeIn, fadeOut);
            color   = blended.rgb + color * (1.0 - blended.a);
            opacity = blended.a   + opacity * (1.0 - blended.a);
        }
    }

    // Composite onto background.
    vec3 bgRGB = vec3(colorBack.rgb) * float(colorBack.a);
    color   = color + bgRGB * (1.0 - opacity);
    opacity = opacity + float(colorBack.a) * (1.0 - opacity);

    // Sub-pixel dither against banding.
    float dither = fract(sin(dot(0.014 * position,
                                 vec2(12.9898, 78.233))) * 43758.5453123) - 0.5;
    color += vec3(dither / 256.0);

    return vec4(vec3(color), float(opacity));

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swColorPanels(position, uCurrentColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uScale, uColorsCountF, uDensity, uAngle1, uAngle2, uPanelLength, uEdgesF, uBlur, uFadeIn, uFadeOut, uGradient, uColorBack, uC0, uC1, uC2, uC3, uC4, uC5, uC6);
}
