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

uniform vec4 uInColor;
uniform float uSpeed;
uniform float uScale;
uniform float uSizeF;
uniform float uSizeRange;
uniform float uSpreading;
uniform float uStepsPerColor;
uniform float uColorsCount;
uniform vec4 uC1;
uniform vec4 uC2;
uniform vec4 uC3;
uniform vec4 uC4;
uniform vec4 uC5;
uniform vec4 uC6;
uniform vec4 uC7;
uniform vec4 uC8;
uniform vec4 uC9;
uniform vec4 uC10;
uniform vec4 uColorBack;

//
//  SWDotOrbit.metal
//  ShipSwift
//
//  Stitchable SwiftUI colorEffect that renders animated multi-color dots,
//  each orbiting around its own Voronoi-cell center, mapped onto a 1–10
//  color step-discretized gradient.
//
//  The per-cell randomizers (`randomR` / `randomGB`) use pure hash
//  functions so no auxiliary texture has to be bound through SwiftUI's
//  `ShaderLibrary`.
//
//  Paired with: SWDotOrbit.swift
//  Entry point: `swDotOrbit` — invoked via SwiftUI `.colorEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - hash helpers (avoid binding an auxiliary noise texture)
// =============================================================================

// Single-channel hash for the orbit-rotation seed (`randomR`).
 float swDO_hash11(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// 2-channel hash for the orbit-phase + palette mixer (`randomGB`).
 vec2 swDO_hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

// 2D rotation by `theta` radians.
 vec2 swDO_rotate(vec2 uv, float th) {
    float c = cos(th), s = sin(th);
    return vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
}

// voronoiShape — 3×3 neighbour scan to find the closest orbiting
// cell-center. Returns `(minDist, randomizer.x, randomizer.y)`.
 vec3 swDO_voronoi(vec2 uv, float time, float spreading) {
    const float TWO_PI = 6.28318530718;
    vec2 iuv = floor(uv);
    vec2 fuv = fract(uv);

    float s = 0.25 * clamp_01(spreading);

    float minDist = 1.0;
    vec2 randomizer = vec2(0.0);
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 tileOffset = vec2(float(x), float(y));
            vec2 rnd = swDO_hash22(iuv + tileOffset);
            vec2 center = vec2(0.5 + 1e-4);
            center += s * cos(time + TWO_PI * rnd);
            center -= 0.5;
            center = swDO_rotate(center,
                                 swDO_hash11(vec2(rnd.x, rnd.y)) + 0.1 * time);
            center += 0.5;
            float d = length(tileOffset + center - fuv);
            if (d < minDist) {
                minDist = d;
                randomizer = rnd;
            }
        }
    }
    return vec3(minDist, randomizer);
}

// =============================================================================
// MARK: - swDotOrbit
// =============================================================================

vec4 swDotOrbit(vec2 position, vec4 inColor, vec4 boundingRect, float time, float speed, float scale, float size, float sizeRange, float spreading, float stepsPerColor, float colorsCount, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8, vec4 c9, vec4 c10, vec4 colorBack) {

    vec2 sz = boundingRect.zw;
    float minDim = max(min(sz.x, sz.y), 1.0);
    vec2 uv = (position - 0.5 * sz) / minDim;
    uv *= max(scale, 1e-4);

    const float firstFrameOffset = -10.0;
    float t = time * speed + firstFrameOffset;

    vec3 voro = swDO_voronoi(uv, t, spreading) + 1e-4;

    float radius = 0.25 * clamp_01(size) - 0.5 * clamp_01(sizeRange) * voro.z;
    float dist = voro.x;
    float edgeWidth = fwidth(dist);
    float dots = 1.0 - smoothstep(radius - edgeWidth, radius + edgeWidth, dist);

    float shape = voro.y;
    int countI = clamp(int(colorsCount + 0.5), 1, 10);
    float countF = float(countI);
    float steps = max(1.0, stepsPerColor);

    // Two-step mixer — the second assignment is the one that actually
    // drives the gradient (the first is unused; kept for clarity).
    float mixerA = shape * (countF - 1.0);
    (void)mixerA;
    float mixer = (shape - 0.5 / countF) * countF;

    vec4 colors[10] = { c1, c2, c3, c4, c5, c6, c7, c8, c9, c10 };

    vec4 gradient = colors[0];
    vec3 g_rgb = vec3(gradient.rgb) * gradient.a;
    gradient = vec4(g_rgb, gradient.a);

    for (int i = 1; i < 10; i++) {
        if (i >= countI) break;
        float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
        localT = round(localT * steps) / steps;
        vec4 cc = colors[i];
        cc = vec4(vec3(cc.rgb) * cc.a, cc.a);
        gradient = mix(gradient, cc, float(localT));
    }

    // Wrap-around mix — handle the edge case where mixer is outside
    // [0, count-1] by interpolating between last and first.
    if (mixer < 0.0 || mixer > (countF - 1.0)) {
        float localT = mixer + 1.0;
        if (mixer > (countF - 1.0)) {
            localT = mixer - (countF - 1.0);
        }
        localT = round(localT * steps) / steps;
        vec4 cFst = colors[0];
        cFst = vec4(vec3(cFst.rgb) * cFst.a, cFst.a);
        vec4 cLast = colors[countI - 1];
        cLast = vec4(vec3(cLast.rgb) * cLast.a, cLast.a);
        gradient = mix(cLast, cFst, float(localT));
    }

    vec3 col = vec3(gradient.rgb) * dots;
    float opacity = float(gradient.a) * dots;

    vec3 bgRGB = vec3(colorBack.rgb) * float(colorBack.a);
    col = col + bgRGB * (1.0 - opacity);

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swDotOrbit(position, uInColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uScale, uSizeF, uSizeRange, uSpreading, uStepsPerColor, uColorsCount, uC1, uC2, uC3, uC4, uC5, uC6, uC7, uC8, uC9, uC10, uColorBack);
}
