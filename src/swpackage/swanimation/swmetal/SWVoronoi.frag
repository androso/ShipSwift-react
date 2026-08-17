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
uniform float uDistortion;
uniform float uGap;
uniform float uGlow;
uniform float uStepsPerColor;
uniform float uColorsCount;
uniform vec4 uC1;
uniform vec4 uC2;
uniform vec4 uC3;
uniform vec4 uC4;
uniform vec4 uC5;
uniform vec4 uColorGap;
uniform vec4 uColorGlow;
uniform vec4 uColorBack;

//
//  SWVoronoi.metal
//  ShipSwift
//
//  Stitchable SwiftUI colorEffect — voronoi. Anti-aliased animated
//  Voronoi pattern with smooth, customizable edges; up to 5 cell colors
//  in a step-discretized ramp, plus radial inner glow and explicit gap
//  border between cells.
//
//  The per-cell randomizer (`randomGB`) uses a pure 2-channel hash
//  function so no auxiliary texture binding is needed.
//
//  Paired with: SWVoronoi.swift
//  Entry point: `swVoronoi` — invoked via SwiftUI `.colorEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - helpers
// =============================================================================

// 2-channel hash for the per-cell offset randomizer.
 vec2 swV_hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

// Double-pass Voronoi. First pass finds the closest
// cell center; second pass scans a 5×5 neighbourhood to compute the
// minimum float-plane distance to all neighbour cells — that's the cell
// edge distance.
//
// Returns `(edgeDist, mr.x, mr.y, randomHash)`.
//   - `edgeDist`     : signed-distance to the nearest cell border
//   - `mr.xy`        : vector from current point to closest center
//   - `randomHash`   : the raw 0..1 hash of the closest cell (palette mixer)
 vec4 swV_voronoi(vec2 x, float time, float distortion) {
    const float TWO_PI = 6.28318530718;

    vec2 ip = floor(x);
    vec2 fp = fract(x);

    vec2 mg = vec2(0.0);
    vec2 mr = vec2(0.0);
    float  md = 8.0;
    float  rndHash = 0.0;

    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = swV_hash22(ip + g);
            float rawHash = o.x;
            o = 0.5 + distortion * sin(time + TWO_PI * o);
            vec2 r = g + o - fp;
            float d = dot(r, r);

            if (d < md) {
                md = d;
                mr = r;
                mg = g;
                rndHash = rawHash;
            }
        }
    }

    md = 8.0;
    for (int j = -2; j <= 2; j++) {
        for (int i = -2; i <= 2; i++) {
            vec2 g = mg + vec2(float(i), float(j));
            vec2 o = swV_hash22(ip + g);
            o = 0.5 + distortion * sin(time + TWO_PI * o);
            vec2 r = g + o - fp;
            if (dot(mr - r, mr - r) > 0.00001) {
                md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
            }
        }
    }

    return vec4(md, mr, rndHash);
}

// =============================================================================
// MARK: - swVoronoi
// =============================================================================

vec4 swVoronoi(vec2 position, vec4 inColor, vec4 boundingRect, float time, float speed, float scale, float distortion, float gap, float glow, float stepsPerColor, float colorsCount, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 colorGap, vec4 colorGlow, vec4 colorBack) {

    vec2 sz = boundingRect.zw;
    float  minDim = max(min(sz.x, sz.y), 1.0);
    vec2 uv = (position - 0.5 * sz) / minDim;
    uv *= max(scale, 1e-4);

    float t = time * speed;
    vec4 v = swV_voronoi(uv, t, clamp_01(distortion));

    // Palette mixer — two-line idiom where the first assignment
    // is overwritten; preserved for parity.
    float shape = clamp_01(v.w);
    int countI = clamp(int(colorsCount + 0.5), 1, 5);
    float countF = float(countI);

    float mixerA = shape * (countF - 1.0);
    float mixer = (shape - 0.5 / countF) * countF;
    float steps = max(1.0, stepsPerColor);

    vec4 colors[5] = vec4[]( c1, c2, c3, c4, c5 );

    vec4 gradient = colors[0];
    gradient = vec4(vec3(gradient.rgb) * gradient.a, gradient.a);
    for (int i = 1; i < 5; i++) {
        if (i >= countI) break;
        float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
        localT = round(localT * steps) / steps;
        vec4 cc = colors[i];
        cc = vec4(vec3(cc.rgb) * cc.a, cc.a);
        gradient = mix(gradient, cc, float(localT));
    }

    // Wrap-around mix for mixer outside [0, count-1].
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

    vec3 cellColor = vec3(gradient.rgb);
    float cellOpacity = float(gradient.a);

    // Radial inner glow shadow — uses `mr` (vector to cell center).
    float glows = length(v.yz * clamp_01(glow));
    glows = pow(glows, 1.5);
    vec3 glowRGB = vec3(colorGlow.rgb) * float(colorGlow.a);
    vec3 col = mix(cellColor, glowRGB, float(colorGlow.a) * glows);
    float opacity = cellOpacity + float(colorGlow.a) * glows;

    // Cell border (gap) — AA width scales with viewport scale.
    float edge = v.x;
    float smoothEdge = 0.02 / (2.0 * max(scale, 1e-4)) * (1.0 + 0.5 * clamp_01(gap));
    edge = smoothstep(clamp_01(gap) - smoothEdge, clamp_01(gap) + smoothEdge, edge);

    vec3 gapRGB = vec3(colorGap.rgb) * float(colorGap.a);
    col = mix(gapRGB, col, edge);
    opacity = mix(float(colorGap.a), opacity, edge);

    // Composite over background.
    vec3 backRGB = vec3(colorBack.rgb) * float(colorBack.a);
    col = col + backRGB * (1.0 - clamp_01(opacity));

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swVoronoi(position, uInColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uScale, uDistortion, uGap, uGlow, uStepsPerColor, uColorsCount, uC1, uC2, uC3, uC4, uC5, uColorGap, uColorGlow, uColorBack);
}
