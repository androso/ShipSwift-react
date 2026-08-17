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
uniform float uZoom;
uniform float uDriftX;
uniform float uDriftY;
uniform float uWarp;
uniform float uCoverage;
uniform vec4 uSkyColor;
uniform vec4 uCloudColor;
uniform vec4 uWarmTint;
uniform float uWarmth;

//
//  SWFractalClouds.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — drifting fractal clouds.
//
//  Two-pass FBM (5-octave value noise): the first pass perturbs the sample
//  position for the second, producing soft cumulus-like swirls. Sky and
//  cloud colors are mixed by the warped FBM, then a warm tint is added on
//  top of the unwarped FBM for ambient lift.
//
//  Paired with: SWFractalClouds.swift
//  Entry point: `swFractalClouds` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





 float swFractalCloudsHash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

 float swFractalCloudsNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = swFractalCloudsHash(i);
    float b = swFractalCloudsHash(i + vec2(1.0, 0.0));
    float c = swFractalCloudsHash(i + vec2(0.0, 1.0));
    float d = swFractalCloudsHash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 5-octave fractional Brownian motion. Loop bound is  so the compiler
// can fully unroll; do not turn the octave count into a uniform.
 float swFractalCloudsFBM(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * swFractalCloudsNoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

vec4 swFractalClouds(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float zoom, float driftX, float driftY, float warp, float coverage, vec4 skyColor, vec4 cloudColor, vec4 warmTint, float warmth) {

    vec2 size = boundingRect.zw;
    vec2 uv   = position / size;

    float t = time * speed;

    uv *= max(zoom, 0.0001);
    uv += vec2(t * driftX, t * driftY);

    float f1 = swFractalCloudsFBM(uv);
    float f2 = swFractalCloudsFBM(uv + f1 * warp + vec2(t * 0.02, t * 0.03));

    vec3 sky   = vec3(skyColor.rgb);
    vec3 cloud = vec3(cloudColor.rgb);
    vec3 tint  = vec3(warmTint.rgb);

    vec3 col = mix(sky, cloud, clamp(f2 + coverage, 0.0, 1.0));
    col += tint * f1 * warmth;

    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swFractalClouds(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uZoom, uDriftX, uDriftY, uWarp, uCoverage, uSkyColor, uCloudColor, uWarmTint, uWarmth);
}
