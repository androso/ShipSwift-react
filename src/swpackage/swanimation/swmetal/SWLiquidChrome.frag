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
uniform float uContrast;
uniform float uSpecPower;
uniform float uSpecStrength;
uniform float uTintStrength;
uniform vec4 uShadow;
uniform vec4 uSilver;
uniform vec4 uHighlight;
uniform vec4 uTint;

//
//  SWLiquidChrome.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — animated liquid chrome surface.
//
//  Three sequential value-noise samples are domain-warped against each
//  other to produce a fluid metallic flow. The third sample drives a
//  chrome curve (gamma-corrected, smoothstep-cut for highlights) and a
//  power-curve specular glint. A subtle tint is layered in via the first
//  sample for color depth.
//
//  Paired with: SWLiquidChrome.swift
//  Entry point: `swLiquidChrome` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





// Cheap 2D scalar hash. Standard fract/dot trick — biased but visually
// fine for value-noise interpolation.
 float swLiquidChromeHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Bilinear value noise with smoothstep interpolation.
 float swLiquidChromeNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = swLiquidChromeHash(i);
    float b = swLiquidChromeHash(i + vec2(1.0, 0.0));
    float c = swLiquidChromeHash(i + vec2(0.0, 1.0));
    float d = swLiquidChromeHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec4 swLiquidChrome(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float scale, float warp, float contrast, float specPower, float specStrength, float tintStrength, vec4 shadow, vec4 silver, vec4 highlight, vec4 tint) {

    vec2 size = boundingRect.zw;
    // Centered, aspect-corrected coords (-1..1 along the short axis).
    vec2 uv = (position * 2.0 - size) / max(min(size.x, size.y), 1.0);

    float t = time * speed;

    // Domain warping: each sample displaces the next by a scaled previous
    // noise value plus a per-axis time shift.
    vec2 p  = uv * max(scale, 0.0001);
    float  n1 = swLiquidChromeNoise(p + vec2(t, t * 0.6));
    float  n2 = swLiquidChromeNoise(p + n1 * warp + vec2(-t * 0.4, t * 0.3));
    float  n3 = swLiquidChromeNoise(p * 1.5 + n2 * warp + vec2(t * 0.2, -t * 0.5));

    // Chrome curve: remap to 0..1, then gamma-shape it. Higher contrast
    // exponent → steeper falloff into shadows; lower → flatter mid-tones.
    float chrome = clamp(n3 * 0.5 + 0.5, 0.0, 1.0);
    chrome = pow(chrome, max(contrast, 0.001));

    vec3 sh = vec3(shadow.rgb);
    vec3 sv = vec3(silver.rgb);
    vec3 hl = vec3(highlight.rgb);
    vec3 tn = vec3(tint.rgb);

    vec3 col = mix(sh, sv, chrome);
    col = mix(col, hl, smoothstep(0.8, 0.98, chrome));
    col += tn * smoothstep(0.3, 0.6, n1) * tintStrength;

    // Specular glint — high-power curve on the chrome value picks out crests.
    // The baked-in cool tint (0.6, 0.6, 0.8) is intentional and part of the
    // chrome style identity; it gives glints a slightly blue cast that reads
    // as polished metal even when the four user colors are warm.
    float spec = pow(max(chrome, 0.0), max(specPower, 0.001));
    col += vec3(0.6, 0.6, 0.8) * spec * specStrength;

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swLiquidChrome(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uScale, uWarp, uContrast, uSpecPower, uSpecStrength, uTintStrength, uShadow, uSilver, uHighlight, uTint);
}
