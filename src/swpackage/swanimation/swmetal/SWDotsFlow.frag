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
//  SWDotsFlow.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — `flow` style of the SWDots family.
//  Curl-like flow field on a flat (non-perspective) dot grid. Each dot's
//  brightness pulses along wavefronts orthogonal to the flow direction.
//
//  Paired with: SWDots.swift (style = .flow)
//  Entry point: `swDotsFlow` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





// Signature mirrors SWDotsWavy.metal so that `SWDotsRenderer` can call every
// style with the same argument list. The trailing `horizon` / `amplitude` /
// `depthFade` belong to the unified parameter set but are not consumed by
// this flat-grid style; they are touched with `(void)x;` to make the
// "unused on purpose" decision explicit.

vec4 swDotsFlow(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float brightness, vec4 tint, vec4 background, float dotSize, float gridDensity, float patternScale, float vignette, float horizon, float amplitude, float depthFade) {
    vec2 size = boundingRect.zw;
    vec2 uv   = (position - 0.5 * size) / size.y;
    float  t    = time * speed;

    float  grid       = 0.020 / max(gridDensity, 0.01);
    vec2 cell       = round(uv / grid) * grid;
    float  distToDot  = length(uv - cell);
    float  pxR        = (1.4 / size.y) * dotSize;
    float  mask       = smoothstep(pxR * 1.4, pxR * 0.6, distToDot);

    float n = sin(cell.x * 3.0 * patternScale + t * 0.4) *
              cos(cell.y * 3.0 * patternScale - t * 0.35) +
              0.5 * sin(cell.x * 7.0 * patternScale - t * 0.6) *
                    sin(cell.y * 7.0 * patternScale + t * 0.55);

    float fronts = sin(n * 6.0 + length(cell) * 8.0 * patternScale - t * 1.8);
    float bright = pow(max(fronts, 0.0), 1.8);

    vec2 vUV   = (position - 0.5 * size) / size;
    float  vig   = clamp(1.0 - dot(vUV, vUV) * 0.85 * vignette, 0.0, 1.0);
    float  intensity = mask * (0.10 + 1.0 * bright) * vig;

    vec3 bg  = vec3(background.rgb);
    vec3 fg  = vec3(tint.rgb) * brightness;
    vec3 col = mix(bg, fg, intensity);
    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swDotsFlow(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uBrightness, uTint, uBackground, uDotSize, uGridDensity, uPatternScale, uVignette, uHorizon, uAmplitude, uDepthFade);
}
