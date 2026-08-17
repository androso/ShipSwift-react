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

uniform float uSpeed;
uniform float uSizeF;
uniform float uCaustic;
uniform float uWaves;
uniform float uLayering;
uniform float uEdges;
uniform float uHighlights;
uniform vec4 uColorBack;
uniform vec4 uColorHighlight;

//
//  SWWater.metal
//  ShipSwift
//
//  Stitchable SwiftUI layerEffect that wraps a source layer in a
//  rippling caustic distortion: a slow simplex-noise wave gently pushes
//  UVs around while a 6-octave rotated caustic field pinches highlights
//  into the surface, like sunlight on a pool bottom.
//
//  Paired with: SWWater.swift
//  Entry point: `swWater` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - 2D simplex noise (Ashima Arts / Stefan Gustavson, public domain)
// =============================================================================

 vec3 swW_mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
 vec2 swW_mod289v2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
 vec3 swW_permute(vec3 x)  { return swW_mod289v3(((x * 34.0) + 1.0) * x); }

 float swW_snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                             0.366025403784439,
                            -0.577350269189626,
                             0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);

    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = swW_mod289v2(i);
    vec3 p = swW_permute(swW_permute(i.y + vec3(0.0, i1.y, 1.0))
                                     + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0),
                                 dot(x12.xy, x12.xy),
                                 dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;

    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// =============================================================================
// MARK: - helpers
// =============================================================================

// 2D rotation matrix.
 float2x2 swW_rot2(float r) {
    float c = cos(r), s = sin(r);
    return float2x2(c, s, -s, c);
}

// Smooth box that fades a `uv ∈ [0, 1]` rectangle's edges (per-axis fwidth).
// Used to mask out samples that wander past the layer's bounds.
 float swW_uvFrame(vec2 uv) {
    float aax = 2.0 * fwidth(uv.x);
    float aay = 2.0 * fwidth(uv.y);
    float left   = smoothstep(0.0, aax, uv.x);
    float right  = 1.0 - smoothstep(1.0 - aax, 1.0, uv.x);
    float bottom = smoothstep(0.0, aay, uv.y);
    float top    = 1.0 - smoothstep(1.0 - aay, 1.0, uv.y);
    return left * right * bottom * top;
}

// `getCausticNoise` — six rotated octaves whose phase advances
// with `t`. The vec2 accumulator `n` carries phase forward into the next
// octave, while `N` accumulates the visible caustic field.
 float swW_caustic(vec2 uv, float t, float scale) {
    vec2 n = vec2(0.1);
    vec2 N = vec2(0.1);
    float2x2 m = swW_rot2(0.5);
    for (int j = 0; j < 6; j++) {
        uv = m * uv;
        n  = m * n;
        float fj = float(j);
        vec2 q = uv * scale + fj + n + (0.5 + 0.5 * fj) * (mod(fj, 2.0) - 1.0) * t;
        n += sin(q);
        N += cos(q) / scale;
        scale *= 1.1;
    }
    return (N.x + N.y + 1.0);
}

// =============================================================================
// MARK: - swWater
// =============================================================================

vec4 swWater(vec2 position, int layer, vec4 boundingRect, float time, float speed, float size, float caustic, float waves, float layering, float edges, float highlights, vec4 colorBack, vec4 colorHighlight) {

    vec2 sz = boundingRect.zw;
    float aspect = sz.x / max(sz.y, 1.0);

    // Normalized image UV in 0..1.
    vec2 imageUV = position / max(sz, vec2(1.0));
    // Pattern UV centred at 0 and aspect-stretched so the caustic cells
    // stay roughly square no matter the layer shape.
    vec2 patternUV = (imageUV - 0.5) * vec2(aspect, 1.0);
    patternUV /= max(0.01 + 0.09 * size, 1e-4);

    float t = time * speed;

    // Slow simplex-noise wave breathes over the surface.
    float wavesNoise = swW_snoise((0.3 + 0.1 * sin(t)) * 0.1 * patternUV
                                  + vec2(0.0, 0.4 * t));

    // Two layered caustic samples to add detail without doubling the
    // inner loop count.
    float causticN = swW_caustic(patternUV + waves * vec2(1.0, -1.0) * wavesNoise,
                                 2.0 * t, 1.5);
    causticN += clamp_01(layering) * swW_caustic(patternUV + 2.0 * waves * vec2(1.0, -1.0) * wavesNoise,
                                                 1.5 * t, 2.0);
    causticN = causticN * causticN;

    // Edges distortion mask — pumps distortion harder near the layer
    // borders so the centre stays legible. `edges` blends it toward 1.0
    // (full distortion everywhere).
    float edgeMask = smoothstep(0.0, 0.1, imageUV.x);
    edgeMask *= smoothstep(0.0, 0.1, imageUV.y);
    edgeMask *= (smoothstep(1.0, 1.1, imageUV.x) + (1.0 - smoothstep(0.8, 0.95, imageUV.x)));
    edgeMask *= (1.0 - smoothstep(0.9, 1.0, imageUV.y));
    edgeMask = mix(edgeMask, 1.0, clamp_01(edges));

    float causticDistort = 0.02 * causticN * edgeMask;
    float wavesDistort   = 0.1 * clamp_01(waves) * wavesNoise;

    // Shift the sampling UV by the combined distortion.
    imageUV += vec2(wavesDistort, -wavesDistort);
    imageUV += clamp_01(caustic) * causticDistort;

    float frame = swW_uvFrame(imageUV);

    // Sample the layer at the (now distorted) UV. layer.sample takes
    // view-space pixels, so multiply UV back up by the layer size.
    vec4 image = layerSample(imageUV * sz);

    vec3 backRGB = vec3(colorBack.rgb) * float(colorBack.a);
    vec3 col = mix(backRGB, vec3(image.rgb), float(image.a) * frame);

    // Caustic highlight tint — clamps the negative tail so the lowlights
    // don't darken the picture, then mixes the highlight color in
    // proportional to the caustic intensity and the user's `highlights`
    // slider.
    causticN = max(-0.2, causticN);
    float hi = 0.05 * clamp_01(highlights) * causticN;
    col = mix(col, vec3(colorHighlight.rgb), hi);
    // A second, slightly brighter highlight pulse mixes the highlight
    // color in additively, weighted by the wave noise so the sparkle
    // travels with the surface.
    float sparkle = 0.025 * clamp_01(highlights) * causticN * float(colorHighlight.a)
                     * (0.5 + 0.5 * wavesNoise);
    col += vec3(colorHighlight.rgb) * sparkle;

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swWater(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uSizeF, uCaustic, uWaves, uLayering, uEdges, uHighlights, uColorBack, uColorHighlight);
}
