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
uniform float uGrain;
uniform float uContrast;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;

//
//  SWGrainGradient.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — soft tri-color gradient with film grain.
//
//  Two low-frequency value-noise samples drive the blend between three
//  user colors, producing a slow, premium-feeling color field. A per-frame
//  high-frequency hash adds film grain so the surface always reads as
//  "designed" rather than flat — the staple of 2025-era hero backgrounds
//  (Apple Music posters, Spotify hero cards, Linear gradients).
//
//  Paired with: SWGrainGradient.swift
//  Entry point: `swGrainGradient` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





 float swGrainGradientHash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Bilinear value noise with smoothstep interpolation.
 float swGrainGradientVNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = swGrainGradientHash21(i);
    float b = swGrainGradientHash21(i + vec2(1.0, 0.0));
    float c = swGrainGradientHash21(i + vec2(0.0, 1.0));
    float d = swGrainGradientHash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec4 swGrainGradient(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float scale, float grain, float contrast, vec4 color1, vec4 color2, vec4 color3) {

    vec2 size = boundingRect.zw;
    // Normalized coords (0..1), then scaled for the noise sampler.
    vec2 uv = position / max(min(size.x, size.y), 1.0);
    vec2 ap = uv * max(scale, 0.0001);

    // Time is slowed by 0.15 — grain gradients are meant to drift, not flow.
    float t = time * speed * 0.15;

    // Two low-frequency samples drive the two blend weights between the
    // three colors. Different offsets / scales decouple them so the field
    // doesn't collapse into a single direction of motion.
    float n1 = swGrainGradientVNoise(ap         + vec2( t,         t * 0.6));
    float n2 = swGrainGradientVNoise(ap * 0.7   + vec2(-t * 0.4,   t * 0.3) + 17.0);

    // Contrast-shape each weight before blending so the user can compress
    // colors toward one dominant tone or open them up.
    float w1 = clamp(pow(n1, max(contrast, 0.001)), 0.0, 1.0);
    float w2 = clamp(pow(n2, max(contrast, 0.001)), 0.0, 1.0);

    vec3 c1 = vec3(color1.rgb);
    vec3 c2 = vec3(color2.rgb);
    vec3 c3 = vec3(color3.rgb);

    vec3 col = mix(c1, c2, w1);
    col        = mix(col, c3, w2);

    // Film grain — high-frequency hash on raw pixel position (independent
    // of `scale`) shifted per-frame so the grain shimmers like actual film.
    // Centered around 0 so it adds equally to highlights and shadows.
    float g = swGrainGradientHash21(position * 0.5 + time * 60.0) - 0.5;
    col    += g * grain;

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swGrainGradient(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uScale, uGrain, uContrast, uColor1, uColor2, uColor3);
}
