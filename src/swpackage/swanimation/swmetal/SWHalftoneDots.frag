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

uniform float uType;
uniform float uGrid;
uniform float uSizeF;
uniform float uRadius;
uniform float uContrast;
uniform float uInverted;
uniform float uOriginalColors;
uniform float uGrainMixer;
uniform float uGrainOverlay;
uniform float uGrainSize;
uniform vec4 uColorFront;
uniform vec4 uColorBack;

//
//  SWHalftone.metal
//  ShipSwift
//
//  Stitchable SwiftUI layerEffect rendering a halftone print family.
//  Two entry points:
//
//    • `swHalftoneDots` — 4 dot styles
//      (classic / gooey / holes / soft) × 2 grids (square / hex), with
//      optional originalColors mode and procedural grain.
//
//    • `swHalftoneCmyk` — simplified ink-only CMYK
//      variant. 4 channel plates (C / M / Y / K) at the classic 15° /
//      75° / 0° / 45° rotations, multiplicatively layered on a paper
//      background to produce a four-color printing look.
//
//  Both shaders treat the source layer as an image, quantize it into
//  rotated cell grids, and render dots whose size tracks the locally-
//  sampled luminance (or CMYK channel coverage). Anti-aliasing is via
//  `fwidth`-based smoothstep across cell edges.
//
//  Paired with: SWHalftone.swift
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - Shared helpers
// =============================================================================

// Linear smoothstep.
 float swHt_lst(float a, float b, float x) {
    return clamp((x - a) / max(b - a, 1e-6), 0.0, 1.0);
}

// 2D rotation by precomputed cos/sin.
 vec2 swHt_rot(vec2 p, float c, float s) {
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// Sigmoid — applied per-RGB-channel before luminance to give
// a smoother contrast curve than a hard linear stretch.
 float swHt_sigmoid(float x, float k) {
    return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

// Apply sigmoid contrast to an RGB triple.
 vec3 swHt_contrastRGB(vec3 c, float k) {
    return vec3(
        swHt_sigmoid(c.r, k),
        swHt_sigmoid(c.g, k),
        swHt_sigmoid(c.b, k)
    );
}

// Linear contrast — used in originalColors mode where keeping
// natural saturation matters more than a smooth midtone curve.
 vec3 swHt_contrastLinear(vec3 c, float k) {
    return clamp((c - 0.5) * k + 0.5, 0.0, 1.0);
}

// Cheap 2D hash for procedural noise — approximated with a hash so we
// don't have to bind a noise texture through SwiftUI.
 float swHt_hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

 float swHt_valueNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = swHt_hash21(i);
    float b = swHt_hash21(i + vec2(1.0, 0.0));
    float c = swHt_hash21(i + vec2(0.0, 1.0));
    float d = swHt_hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Smooth box that fades a `uv ∈ [0, 1]` rectangle's edges over `pad`.
// Crops dots that try to reach beyond the source image rectangle.
 float swHt_uvFrame(vec2 uv, vec2 pad) {
    const float aa = 0.0001;
    float left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
    float right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
    float bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
    float top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);
    return left * right * bottom * top;
}

// =============================================================================
// MARK: - Dot shape functions (classic / gooey / holes / soft)
// =============================================================================

// Classic crisp circle. `lum=0` → big dot, `lum=1` → none.
 float swHt_getClassic(vec2 uv, float lum, float baseR) {
    float r = mix(0.25 * baseR, 0.0, lum);
    float d = length(uv - 0.5);
    float aa = fwidth(d);
    return 1.0 - smoothstep(r - aa, r + aa, d);
}

// Gooey soft falloff blob. Hex grid uses 0.42 base radius vs 0.3 for
// square.
 float swHt_getGooey(vec2 uv, float lum, float baseR, bool hex) {
    float d = length(uv - 0.5);
    float sizeR = hex ? (0.42 * baseR) : (0.3 * baseR);
    sizeR = mix(sizeR, 0.0, lum);
    d = 1.0 - smoothstep(0.0, sizeR, d);
    d = pow(d, 2.0 + baseR);
    return d;
}

// Circle with optional hole. Big `lum` produces a ring (cell minus inner
// circle).
 float swHt_getHoles(vec2 uv, float lum, float baseR) {
    float insideX = step(0.0, uv.x) * (1.0 - step(1.0, uv.x));
    float insideY = step(0.0, uv.y) * (1.0 - step(1.0, uv.y));
    float cell = insideX * insideY;

    float r = mix(0.75 * baseR, 0.0, lum);
    float rMod = mod(r, 0.5);
    float d = length(uv - 0.5);
    float aa = fwidth(d);
    float circle = 1.0 - smoothstep(rMod - aa, rMod + aa, d);
    return (r < 0.5) ? circle : (cell - circle);
}

// Soft fuzzy falloff.
 float swHt_getSoft(vec2 uv, float lum, float baseR) {
    float d = length(uv - 0.5);
    float sizeR = clamp(baseR, 0.0, 1.0);
    sizeR = mix(0.5 * sizeR, 0.0, lum);
    d = 1.0 - swHt_lst(0.0, sizeR, d);
    float powR = 1.0 - swHt_lst(0.0, 2.0, baseR);
    d = pow(d, 4.0 + 3.0 * powR);
    return d;
}

// =============================================================================
// MARK: - Luminance ball (combines sample + dot)
// =============================================================================

// Evaluates one dot at a sub-cell offset, writing the sampled ball color
// (used by originalColors mode) to `outBallColor`.
 float swHt_getLumBall(vec2 uv,
                             vec2 pad,
                             vec2 offset,
                             int layer,
                             vec2 layerSize,
                             int typeI,
                             bool hexGrid,
                             bool originalColors,
                             float contrastK_sigmoid,
                             float contrastK_linear,
                             float baseRadius,
                             bool inverted,
                             float stepSize,
                              vec4 outBallColor) {
    vec2 p = uv + offset;
    vec2 uv_i = floor(p);
    vec2 uv_f = fract(p);
    vec2 samplingUV = (uv_i + 0.5 - offset) * pad + 0.5;
    float outOfFrame = swHt_uvFrame(samplingUV, pad * stepSize);

    vec2 samplingPos = samplingUV * layerSize;
    vec4 tex = layerSample(samplingPos);

    // Two contrast paths so we don't double-apply contrast when the
    // caller wants original colors retained.
    vec3 c = originalColors
        ? swHt_contrastLinear(vec3(tex.rgb), contrastK_linear)
        : swHt_contrastRGB(vec3(tex.rgb), contrastK_sigmoid);

    float lum = dot(vec3(0.2126, 0.7152, 0.0722), c);
    lum = mix(1.0, lum, float(tex.a));
    if (inverted) lum = 1.0 - lum;

    outBallColor = vec4(c * float(tex.a), float(tex.a)) * outOfFrame;

    float ball = 0.0;
    if      (typeI == 0) ball = swHt_getClassic(uv_f, lum, baseRadius);
    else if (typeI == 1) ball = swHt_getGooey  (uv_f, lum, baseRadius, hexGrid);
    else if (typeI == 2) ball = swHt_getHoles  (uv_f, lum, baseRadius);
    else                 ball = swHt_getSoft   (uv_f, lum, baseRadius);

    return ball * outOfFrame;
}

// Picks the right sub-sampling density per dot type.
// classic = 2× (4 samples), gooey/soft = 6× (36 samples), holes = 1× (1 sample).
 float swHt_stepMultiplierFor(int typeI) {
    if (typeI == 0) return 2.0;
    if (typeI == 2) return 1.0;
    return 6.0;
}

// =============================================================================
// MARK: - swHalftoneDots (4 styles × 2 grids × originalColors + grain)
// =============================================================================



// =============================================================================
// MARK: - swHalftoneCmyk (4-channel CMYK ink-only simplified port)
// =============================================================================
//
// Simplified CMYK variant:
//   • Only the `ink` dot style — `dots` (separate) and `sharp` (per-pixel)
//     styles need extra branching and are left for a follow-up.
//   • No flood / gain / softness sliders — uses fixed defaults.
//   • No grain mixer / overlay.
//   • CMYK plate rotation angles, paper feed shifts, and a 3×3
//     neighbour scan drive the four-color reconstruction.

// Extract one CMYK channel from a contrast-shaped RGB triple.
 float swHt_cyan(vec3 c)    { float m = max(max(c.r, c.g), c.b); return m > 1e-5 ? (m - c.r) / m : 0.0; }
 float swHt_magenta(vec3 c) { float m = max(max(c.r, c.g), c.b); return m > 1e-5 ? (m - c.g) / m : 0.0; }
 float swHt_yellow(vec3 c)  { float m = max(max(c.r, c.g), c.b); return m > 1e-5 ? (m - c.b) / m : 0.0; }
 float swHt_black(vec3 c)   { return 1.0 - max(max(c.r, c.g), c.b); }

// One CMYK dot in ink mode — joined coverage mask.
 float swHt_cmykDot(vec2 uvLocal, vec2 cellCenter, float coverage, float alpha) {
    float radius = coverage * 1.1;
    radius += 0.15;
    radius = max(0.0, radius);
    radius = mix(0.0, radius, alpha);
    float dist = length(uvLocal - cellCenter);
    float m = 1.0 - smoothstep(0.0, radius, dist);
    return pow(m, 1.2);
}

// Image normalized UV for a CMYK cell center in plate-local grid space.
 vec2 swHt_gridToImageUV(vec2 cellCenter, float c, float s, float shift, vec2 pad) {
    vec2 uvGrid = swHt_rot(cellCenter - shift, c, -s);
    return uvGrid * pad + 0.5;
}

vec4 swHalftoneDots(vec2 position, int layer, vec4 boundingRect, float type, float grid, float size, float radius, float contrast, float inverted, float originalColors, float grainMixer, float grainOverlay, float grainSize, vec4 colorFront, vec4 colorBack) {

    vec2 sz = boundingRect.zw;
    float aspect = sz.x / max(sz.y, 1.0);

    int typeI = clamp(int(type + 0.5), 0, 3);
    bool hexGrid = (grid > 0.5);
    bool inv     = (inverted > 0.5);
    bool useOrig = (originalColors > 0.5);

    float stepMultiplier = swHt_stepMultiplierFor(typeI);
    float stepSize = 1.0 / stepMultiplier;

    // Grid in normalized image UV (0..1 across the layer).
    float cellsPerSide = mix(300.0, 7.0, pow(clamp_01(size), 0.7));
    cellsPerSide /= stepMultiplier;
    float cellSizeY = 1.0 / cellsPerSide;
    vec2 pad = cellSizeY * vec2(1.0 / max(aspect, 1e-4), 1.0);
    if (typeI == 1 && hexGrid) {
        // gooey + hex: shrink pad to keep cells overlapping properly.
        pad *= 0.7;
    }

    // uvImage in [0, 1]; uv in cell-grid coords centered at 0.
    vec2 uvImage = position / max(sz, vec2(1.0));
    vec2 uv = (uvImage - 0.5) / pad;

    // Two contrast curves so originalColors mode keeps natural midtones
    // while two-tone mode aggressively shapes the histogram.
    float contrastK_sigmoid = mix(0.0, 15.0, pow(clamp_01(contrast), 1.5));
    float contrastK_linear  = mix(0.1, 4.0,  pow(clamp_01(contrast), 2.0));
    float baseRadius = useOrig
        ? (2.0 * pow(0.5 * clamp_01(radius), 0.3))
        : clamp_01(radius);

    // Sub-cell scan — nested loop, capped at 6×6 = 36 samples.
    float  totalShape   = 0.0;
    vec3 totalColor   = vec3(0.0);
    float  totalOpacity = 0.0;

    int steps = int(stepMultiplier);
    for (int ix = 0; ix < 6; ix++) {
        if (ix >= steps) break;
        float ox = -0.5 + (float(ix) + 0.5) * stepSize;
        for (int iy = 0; iy < 6; iy++) {
            if (iy >= steps) break;
            float oy = -0.5 + (float(iy) + 0.5) * stepSize;
            vec2 offset = vec2(ox, oy);

            // Hex grid alternates row/col parity differently per type.
            if (hexGrid) {
                float rowIndex = floor((oy + 0.5) / stepSize);
                float colIndex = floor((ox + 0.5) / stepSize);
                if (stepSize >= 0.999) {
                    rowIndex = floor(uv.y + oy + 1.0);
                    if (typeI == 1) colIndex = floor(uv.x + ox + 1.0);
                }
                if (typeI == 1) {
                    // gooey hex: skip checker-pattern cells.
                    if (mod(rowIndex + colIndex, 2.0) >= 0.5) continue;
                } else {
                    // others: offset every other row by float a cell.
                    if (mod(rowIndex, 2.0) >= 0.5) offset.x += 0.5 * stepSize;
                }
            }

            vec4 ballColor;
            float shape = swHt_getLumBall(
                uv, pad, offset, layer, sz,
                typeI, hexGrid, useOrig,
                contrastK_sigmoid, contrastK_linear,
                baseRadius, inv, stepSize,
                ballColor
            );

            totalColor   += ballColor.rgb * shape;
            totalShape   += shape;
            totalOpacity += shape;
        }
    }

    const float eps = 1e-4;
    totalColor   /= max(totalShape, eps);
    totalOpacity /= max(totalShape, eps);

    // Per-type threshold.
    float finalShape;
    if (typeI == 0)      finalShape = min(1.0, totalShape);
    else if (typeI == 1) { float aa = fwidth(totalShape);
                           finalShape = smoothstep(0.5 - aa, 0.5 + aa, totalShape); }
    else if (typeI == 2) finalShape = min(1.0, totalShape);
    else                 finalShape = totalShape;

    // Grain mixer — perturbs the dot mask with a noise field.
    vec2 grainScale = mix(2000.0, 200.0, clamp_01(grainSize))
                       * vec2(1.0, 1.0 / max(aspect, 1e-4));
    vec2 grainUV    = (uvImage - 0.5) * grainScale + 0.5;
    float  grainN     = swHt_valueNoise(grainUV);
    grainN = smoothstep(0.55, 0.7 + 0.2 * clamp_01(grainMixer), grainN);
    grainN *= clamp_01(grainMixer);
    finalShape = mix(finalShape, 0.0, grainN);

    // Composite — either keep sampled colors or replace with ink/paper.
    vec3 col;
    if (useOrig) {
        float opacity = totalOpacity * finalShape;
        col = totalColor * finalShape
            + vec3(colorBack.rgb) * float(colorBack.a) * (1.0 - opacity);
    } else {
        float fgA = float(colorFront.a);
        float bgA = float(colorBack.a);
        col = vec3(colorFront.rgb) * fgA * finalShape
            + vec3(colorBack.rgb)  * bgA * (1.0 - fgA * finalShape);
    }

    // Grain overlay — black/white speckle added on top, slightly rotated
    // for variety so it doesn't look like a regular pattern.
    vec2 grainUVA = swHt_rot(grainUV, cos(1.0), sin(1.0)) + 3.0;
    vec2 grainUVB = swHt_rot(grainUV, cos(2.0), sin(2.0)) + vec2(-1.0);
    float grainOver = mix(swHt_valueNoise(grainUVA), swHt_valueNoise(grainUVB), 0.5);
    grainOver = pow(grainOver, 1.3);
    float grainOverV = grainOver * 2.0 - 1.0;
    float grainStr = clamp_01(grainOverlay) * abs(grainOverV);
    grainStr = pow(grainStr, 0.8);
    vec3 grainColor = vec3(step(0.0, grainOverV));
    col = mix(col, grainColor, 0.5 * grainStr);

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swHalftoneDots(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uType, uGrid, uSizeF, uRadius, uContrast, uInverted, uOriginalColors, uGrainMixer, uGrainOverlay, uGrainSize, uColorFront, uColorBack);
}
