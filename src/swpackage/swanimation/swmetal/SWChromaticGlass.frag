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

uniform vec2 uTilt;
uniform float uIntensity;
uniform float uSeparation;

//
//  SWChromaticGlass.metal
//  ShipSwift
//
//  Adapted from ShaderKit by James Rochabrun
//  https://github.com/jamesrochabrun/ShaderKit
//  Licensed under the MIT License. Copyright (c) James Rochabrun.
//  Original copyright and license notice retained as required by MIT.
//  See ShipSwift ACKNOWLEDGEMENTS for the full license text.
//
//  Stitchable SwiftUI layerEffect — a subtle chromatic-aberration "glass"
//  pass. The red and blue channels are sampled at opposing offsets that
//  grow toward the edges and follow the `tilt` vector, plus a soft centre
//  glow, for a premium glass-over-card feel.
//
//  Extracted from ShaderKit's GlassShaders.metal `chromaticGlass` function.
//
//  Paired with: SWChromaticGlass.swift
//  Entry point: `swChromaticGlass` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - swChromaticGlass
// =============================================================================

vec4 swChromaticGlass(
    vec2 position,
    int layer,
    vec4 boundingRect,
    vec2 tilt,
    float time,
    float intensity,
    float separation   // How much RGB channels separate (0.0 - 1.0)
) {
    vec2 size = boundingRect.zw;
    vec2 uv = position / size;

    // Chromatic offset based on tilt and position
    // Stronger at edges, follows tilt direction
    vec2 center = vec2(0.5, 0.5);
    vec2 fromCenter = uv - center;
    float edgeFactor = length(fromCenter) * 2.0; // 0 at center, 1 at corners
    edgeFactor = pow(edgeFactor, 1.5); // Non-linear falloff

    // Offset direction influenced by tilt
    vec2 offsetDir = normalize(fromCenter + tilt * 0.3 + 0.001);
    // Keep a baseline split even at the centre (the 0.15 floor) so the RGB
    // fringing reads clearly across the whole photo, then ramp up at edges.
    float offsetAmount = separation * (edgeFactor * 0.85 + 0.15) * 14.0; // pixels

    // Sample each channel at slightly different positions
    vec2 redOffset = offsetDir * offsetAmount;
    vec2 blueOffset = -offsetDir * offsetAmount;

    vec4 redSample = layerSample(position + redOffset);
    vec4 greenSample = layerSample(position);
    vec4 blueSample = layerSample(position + blueOffset);

    vec4 result;
    float h_intensity = float(intensity);
    result.r = mix(greenSample.r, redSample.r, h_intensity);
    result.g = greenSample.g;
    result.b = mix(greenSample.b, blueSample.b, h_intensity);
    result.a = greenSample.a;

    // Add subtle brightness boost at center
    float centerGlow = smoothstep(0.7, 0.0, length(fromCenter)) * 0.03 * intensity;
    result.rgb += centerGlow;

    return result;
}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swChromaticGlass(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uTilt, uTime, uIntensity, uSeparation);
}
