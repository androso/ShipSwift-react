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
uniform float uScale;
uniform float uWarp;
uniform float uHighlight;
uniform vec4 uInk1;
uniform vec4 uInk2;
uniform vec4 uInk3;
uniform vec4 uInk4;
uniform vec4 uGlow;

//
//  SWInkSmoke.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — domain-warped fbm "ink in water"
//  smoke field.
//
//  Three layers of value-noise fbm form the smoke body: `q` warps `p`,
//  `r2` warps it again with `q` as the offset, and `f` is a final fbm
//  sampled at the double-warped point. Four ink colors are mixed by
//  `f`, `q.x`, and `r2.y`, then a wispy highlight is added where `f`
//  is brightest.
//
//  Paired with: SWInkSmoke.swift
//  Entry point: `swInkSmoke` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





 float swInkSmokeHash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

 float swInkSmokeVNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = swInkSmokeHash21(i);
    float b = swInkSmokeHash21(i + vec2(1.0, 0.0));
    float c = swInkSmokeHash21(i + vec2(0.0, 1.0));
    float d = swInkSmokeHash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 5-octave fractional Brownian motion. Loop bound is  so the compiler
// can fully unroll; do not turn the octave count into a uniform.
 float swInkSmokeFBM(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * swInkSmokeVNoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

vec4 swInkSmoke(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float scale, float warp, float highlight, vec4 ink1, vec4 ink2, vec4 ink3, vec4 ink4, vec4 glow) {

    vec2 size = boundingRect.zw;
    vec2 uv   = (position * 2.0 - size) / min(size.x, size.y);

    float  t = time * speed * 0.2;
    vec2 p = uv * max(scale, 0.0001);

    // Two-stage domain warp — q warps p, then r2 warps it again with q as
    // the offset. f is the final fbm sampled at the double-warped point.
    vec2 q  = vec2(swInkSmokeFBM(p + vec2(t * 0.4, t * 0.3)),
                       swInkSmokeFBM(p + vec2(t * 0.2, -t * 0.4)));
    vec2 r2 = vec2(swInkSmokeFBM(p + q * warp + vec2(1.7, 9.2) + t * 0.15),
                       swInkSmokeFBM(p + q * warp + vec2(8.3, 2.8) - t * 0.1));
    float  f  = swInkSmokeFBM(p + r2 * 2.0);

    vec3 c1 = vec3(ink1.rgb);
    vec3 c2 = vec3(ink2.rgb);
    vec3 c3 = vec3(ink3.rgb);
    vec3 c4 = vec3(ink4.rgb);
    vec3 g  = vec3(glow.rgb);

    vec3 col = mix(c1, c2, clamp(f * 2.0, 0.0, 1.0));
    col        = mix(col, c3, clamp(q.x * 1.5, 0.0, 1.0));
    col        = mix(col, c4, clamp(r2.y * 0.8, 0.0, 1.0));

    // Wispy highlights where the double-warped field peaks.
    float wisp = pow(clamp(f * 1.5, 0.0, 1.0), 3.0);
    col       += g * wisp * highlight;

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swInkSmoke(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uScale, uWarp, uHighlight, uInk1, uInk2, uInk3, uInk4, uGlow);
}
