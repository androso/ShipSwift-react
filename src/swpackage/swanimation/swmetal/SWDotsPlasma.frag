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
uniform float uBrightness;
uniform vec4 uTint;
uniform vec4 uBackground;
uniform float uDotSize;
uniform float uGridDensity;
uniform float uPatternScale;
uniform float uVignette;
uniform float uHorizon;
uniform float uAmplitude;
uniform float uDepthFade;

//
//  SWDotsPlasma.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — `plasma` style of the SWDots family.
//  Plasma-style sin-stack lighting a flat (non-perspective) dot grid. Each
//  dot reads the plasma intensity at its cell center and tones up accordingly.
//
//  Paired with: SWDots.swift (style = .plasma)
//  Entry point: `swDotsPlasma` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





// Trailing `horizon` / `amplitude` / `depthFade` belong to the unified
// SWDots parameter set; not used by this flat-grid style.

vec4 swDotsPlasma(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float brightness, vec4 tint, vec4 background, float dotSize, float gridDensity, float patternScale, float vignette, float horizon, float amplitude, float depthFade) {

    (void)horizon;
    (void)amplitude;
    (void)depthFade;

    vec2 size = boundingRect.zw;
    vec2 uv   = (position - 0.5 * size) / size.y;
    float  t    = time * speed;

    float  grid      = 0.018 / max(gridDensity, 0.01);
    vec2 cell      = round(uv / grid) * grid;
    float  distToDot = length(uv - cell);
    float  pxR       = (1.6 / size.y) * dotSize;
    float  mask      = smoothstep(pxR * 1.4, pxR * 0.6, distToDot);

    float v = sin(cell.x * 8.0 * patternScale + t * 1.3) +
              sin(cell.y * 8.0 * patternScale + t * 1.1) +
              sin((cell.x + cell.y) * 6.0 * patternScale + t * 1.5) +
              sin(length(cell) * 10.0 * patternScale - t * 1.8);
    v = v * 0.25;
    float bright = clamp(0.5 + 0.5 * v, 0.0, 1.0);
    bright = pow(bright, 2.5);

    vec2 vUV  = (position - 0.5 * size) / size;
    float  vig  = clamp(1.0 - dot(vUV, vUV) * 0.9 * vignette, 0.0, 1.0);
    float  intensity = mask * bright * vig;

    vec3 bg  = vec3(background.rgb);
    vec3 fg  = vec3(tint.rgb) * brightness;
    vec3 col = mix(bg, fg, intensity);
    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swDotsPlasma(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uBrightness, uTint, uBackground, uDotSize, uGridDensity, uPatternScale, uVignette, uHorizon, uAmplitude, uDepthFade);
}
