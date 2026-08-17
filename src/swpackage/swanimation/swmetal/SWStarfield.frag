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
uniform float uLayers;
uniform float uBaseScale;
uniform float uScaleStep;
uniform float uDensity;
uniform float uStarSize;
uniform float uTwinkleSpeed;
uniform float uTwinkleAmount;
uniform vec4 uStarColor;
uniform vec4 uBackground;

//
//  SWStarfield.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — multi-layer twinkling starfield.
//
//  Each layer is a hashed grid: a per-cell scalar hash decides which cells
//  "light up" (`h > 1 - density`), a per-cell 2D hash places the star
//  inside the cell, and a sin-driven term twinkles its brightness. Layers
//  shift downward at different speeds for a parallax effect — back layers
//  are dimmer and finer-grained.
//
//  Paired with: SWStarfield.swift
//  Entry point: `swStarfield` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





// Cheap per-cell scalar hash. Standard "sin(dot) * 43758" trick — not great
// statistically but cheap and visually fine for a starfield.
 float swStarfieldHash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Two independent hashes packed into a vec2 — used to place the star inside
// the cell. Different magic numbers per channel so x and y aren't correlated.
 vec2 swStarfieldHash2(vec2 p) {
    float a = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453);
    return vec2(a, b);
}

vec4 swStarfield(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float layers, float baseScale, float scaleStep, float density, float starSize, float twinkleSpeed, float twinkleAmount, vec4 starColor, vec4 background) {

    vec2 size = boundingRect.zw;
    vec2 uv   = position / max(size, vec2(1.0));

    // Cap the layer count so the loop bound is bounded for the compiler.
    int   count  = max(1, min(int(layers), 8));
    float thresh = clamp(1.0 - density, 0.0, 1.0);
    float ssz    = max(starSize, 0.001);
    float amt    = clamp(twinkleAmount, 0.0, 1.0);

    vec3 starRGB = vec3(starColor.rgb);
    vec3 col     = vec3(0.0);

    for (int layer = 0; layer < count; layer++) {
        float fl    = float(layer);
        float scale = max(baseScale + fl * scaleStep, 1.0);
        float lspd  = (0.03 + fl * 0.02) * speed;
        float bri   = max(0.0, 1.0 - fl * 0.25);

        vec2 st   = uv * scale;
        st.y       += time * lspd * scale;
        vec2 cell = floor(st);
        vec2 f    = fract(st);

        float h = swStarfieldHash1(cell);
        if (h > thresh) {
            vec2 center = swStarfieldHash2(cell);
            float  d      = length(f - center);
            // Re-expressed as (mean = 1 - amt, amplitude = amt) so amt=0
            // gives steady stars and amt=0.3 reproduces the original look.
            float twink = sin(time * twinkleSpeed + h * 100.0) * amt + (1.0 - amt);
            // Inverse smoothstep — bright at d=0, fades to 0 at d=ssz. Using
            // (1 - smoothstep) instead of edge-flipped smoothstep so behavior
            // matches the WGSL preview, where edge0 > edge1 is undefined.
            float falloff = 1.0 - smoothstep(0.0, ssz, d);
            col += starRGB * (falloff * twink * bri);
        }
    }

    vec3 bg = vec3(background.rgb);
    return vec4(vec3(bg + col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swStarfield(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uLayers, uBaseScale, uScaleStep, uDensity, uStarSize, uTwinkleSpeed, uTwinkleAmount, uStarColor, uBackground);
}
