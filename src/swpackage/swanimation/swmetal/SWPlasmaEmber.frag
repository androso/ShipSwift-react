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

uniform vec4 uC1;
uniform vec4 uC2;
uniform vec4 uC3;
uniform vec4 uC4;
uniform vec4 uC5;
uniform float uScale;
uniform float uIntensity;
uniform float uDistortion;

//
//  SWPlasma.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effects — `SWPlasma` family.
//
//  Five plasma styles bundled in one file because they share the same
//  hash / value-noise / FBM / 5-stop palette helpers (with only minor
//  octave-count differences). Unlike `SWDots`, where each style's shader
//  body diverges substantially and warrants its own file, the plasma
//  shaders only differ in their final color mixing step — keeping them
//  in one TU lets the helpers be defined exactly once.
//
//  Entry points:
//    - `swPlasmaSolar`     — stacked sins + 3-octave fbm, warm 5-stop palette
//    - `swPlasmaPrism`     — rotating-direction sin field, RGB split on X
//    - `swPlasmaSpectrum`  — like Prism but vertical bias, RGB split on Y
//    - `swPlasmaEmber`     — radial term + gamma boost + high-power hotspots
//    - `swPlasmaLilac`     — slow phase + global breath envelope
//
//  Paired with: SWPlasma.swift
//
//  Requires iOS 17+ / macOS 14+.
//





// MARK: - Shared helpers

 float swPlasmaHash(vec2 p) {
    p = vec2(dot(p, vec2(91.31, 47.79)),
               dot(p, vec2(31.07, 73.13)));
    return fract(sin(p.x + p.y) * 19357.713);
}

 float swPlasmaVNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = swPlasmaHash(i);
    float b = swPlasmaHash(i + vec2(1.0, 0.0));
    float c = swPlasmaHash(i + vec2(0.0, 1.0));
    float d = swPlasmaHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 2-octave FBM (Prism only).
 float swPlasmaFBM2(vec2 p) {
    float v = swPlasmaVNoise(p) * 0.6;
    v += swPlasmaVNoise(p * 2.0) * 0.4;
    return v - 0.5;
}

// 3-octave FBM (everyone else).
 float swPlasmaFBM3(vec2 p) {
    float v = swPlasmaVNoise(p) * 0.5;
    v += swPlasmaVNoise(p * 2.0) * 0.3;
    v += swPlasmaVNoise(p * 4.0) * 0.2;
    return v - 0.5;
}

// 5-stop palette mixer, smoothstep-interpolated between each adjacent pair.
 vec3 swPlasmaPal5(float t,
                           vec3 c1, vec3 c2, vec3 c3, vec3 c4, vec3 c5) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.25) return mix(c1, c2, smoothstep(0.0,  0.25, t));
    if (t < 0.5)  return mix(c2, c3, smoothstep(0.25, 0.5,  t));
    if (t < 0.75) return mix(c3, c4, smoothstep(0.5,  0.75, t));
    return mix(c4, c5, smoothstep(0.75, 1.0, t));
}

// MARK: - Solar



// MARK: - Prism



// MARK: - Spectrum



// MARK: - Ember



// MARK: - Lilac

vec4 swPlasmaEmber(vec2 position, vec4 color, vec4 boundingRect, float time, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, float scale, float intensity, float distortion) {

    vec2 size   = boundingRect.zw;
    vec2 uv     = position / size;
    float  aspect = size.x / size.y;
    vec2 p      = uv - 0.5;
    p.x *= aspect;
    p   *= scale * 1.3;                     // tighter pre-scale for ember detail

    float v = 0.0;
    v += sin(p.x * 2.5 + time * 0.6);
    v += sin(p.y * 3.0 + time * 0.8);
    v += sin(length(p) * 2.0 - time * 0.5);
    v += swPlasmaFBM3(p * 2.0 + time * 0.18) * distortion * 3.0;
    v  = (v + 4.0) * 0.125;
    v  = pow(clamp(v, 0.0, 1.0), 1.6) * intensity;

    vec3 col = swPlasmaPal5(v,
                              vec3(c1.rgb), vec3(c2.rgb),
                              vec3(c3.rgb), vec3(c4.rgb), vec3(c5.rgb));
    col += pow(v, 6.0) * 0.55;
    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swPlasmaEmber(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uC1, uC2, uC3, uC4, uC5, uScale, uIntensity, uDistortion);
}
