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
uniform float uDensity;

//
//  SWGlitter.metal
//  ShipSwift
//
//  Adapted from ShaderKit by James Rochabrun
//  https://github.com/jamesrochabrun/ShaderKit
//  Licensed under the MIT License. Copyright (c) James Rochabrun.
//  Original copyright and license notice retained as required by MIT.
//  See ShipSwift ACKNOWLEDGEMENTS for the full license text.
//
//  Stitchable SwiftUI layerEffect that scatters animated glitter points
//  over any source layer. A hashed grid seeds per-cell sparkles whose
//  phase is nudged by the `tilt` vector, so glints twinkle as the card
//  is rotated.
//
//  Paired with: SWGlitter.swift
//  Entry point: `swGlitter` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - helpers
// =============================================================================

// Rainbow color generation — phase-shifted sines on the three channels.
 vec3 swGlitter_generateRainbow(float angle, float intensity) {
    vec3 color;
    color.r = sin(angle) * 0.5 + 0.5;
    color.g = sin(angle + 2.094) * 0.5 + 0.5;
    color.b = sin(angle + 4.189) * 0.5 + 0.5;
    return color * float(intensity);
}

// =============================================================================
// MARK: - swGlitter
// =============================================================================

vec4 swGlitter(vec2 position, int layer, vec4 boundingRect, vec2 tilt, float time, float density) {

    vec2 size = boundingRect.zw;
    vec4 originalColor = layerSample(position);

    if (originalColor.a < 0.01) {
        return originalColor;
    }

    vec2 uv = position / size;

    // Grid for glitter points
    float gridSize = density;
    vec2 gridUV = fract(uv * gridSize);
    vec2 gridID = floor(uv * gridSize);

    // Pseudo-random per grid cell
    float random = fract(sin(dot(gridID, vec2(12.9898, 78.233))) * 43758.5453);

    // Sparkle visibility
    float sparklePhase = random * 6.28318 + time * (2.0 + random * 3.0);
    float tiltInfluence = dot(normalize(tilt + 0.001), vec2(cos(random * 6.28), sin(random * 6.28)));
    float sparkleIntensity = pow(max(0.0, sin(sparklePhase + tiltInfluence * 3.0)), 8.0);

    // Distance from center of grid cell
    vec2 cellCenter = vec2(0.5, 0.5);
    float dist = length(gridUV - cellCenter);
    float pointSize = 0.1 + random * 0.1;
    float point = smoothstep(pointSize, 0.0, dist);

    // Sparkle color
    vec3 sparkleColor = vec3(1.0, 1.0, 1.0);
    float rainbowAngle = random * 6.28 + tilt.x * 2.0 + tilt.y * 2.0;
    sparkleColor += swGlitter_generateRainbow(rainbowAngle, 0.3) * 0.5;

    vec3 finalColor = originalColor.rgb + sparkleColor * float(point * sparkleIntensity * 0.55);

    return vec4(finalColor, originalColor.a);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swGlitter(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uTilt, uTime, uDensity);
}
