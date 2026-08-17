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
//  SWDotsSnake.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — `snake` style of the SWDots family.
//  Snake-like dot trails on a flat (non-perspective) dot grid. A flow
//  field defines an angle per dot; brightness peaks where the dot's
//  position aligns with the flow's phase wavefront.
//
//  Paired with: SWDots.swift (style = .snake)
//  Entry point: `swDotsSnake` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





// Trailing `horizon` / `amplitude` / `depthFade` belong to the unified
// SWDots parameter set; not used by this flat-grid style.

vec4 swDotsSnake(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float brightness, vec4 tint, vec4 background, float dotSize, float gridDensity, float patternScale, float vignette, float horizon, float amplitude, float depthFade) {
    vec2 size = boundingRect.zw;
    vec2 uv   = (position - 0.5 * size) / size.y;
    float  t    = time * speed;

    float  grid      = 0.018 / max(gridDensity, 0.01);
    vec2 cell      = round(uv / grid) * grid;
    float  distToDot = length(uv - cell);
    float  pxR       = (1.5 / size.y) * dotSize;
    float  mask      = smoothstep(pxR * 1.4, pxR * 0.6, distToDot);

    float angle = sin(cell.x * 4.0 * patternScale + t * 0.6) * 1.2 +
                  cos(cell.y * 4.0 * patternScale - t * 0.5) * 1.2 +
                  sin((cell.x + cell.y) * 3.0 * patternScale + t * 0.9);
    vec2 flow = vec2(cos(angle), sin(angle));

    float phase  = dot(cell, flow) * 12.0 * patternScale - t * 4.0;
    float bright = 0.5 + 0.5 * sin(phase);
    bright = pow(bright, 4.0);

    vec2 vUV   = (position - 0.5 * size) / size;
    float  vig   = clamp(1.0 - dot(vUV, vUV) * 0.7 * vignette, 0.0, 1.0);
    float  intensity = mask * (0.10 + 1.1 * bright) * vig;

    vec3 bg  = vec3(background.rgb);
    vec3 fg  = vec3(tint.rgb) * brightness;
    vec3 col = mix(bg, fg, intensity);
    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swDotsSnake(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uBrightness, uTint, uBackground, uDotSize, uGridDensity, uPatternScale, uVignette, uHorizon, uAmplitude, uDepthFade);
}
