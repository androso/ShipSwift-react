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

//
//  SWIntenseBling.metal
//  ShipSwift
//
//  Adapted from ShaderKit by James Rochabrun
//  https://github.com/jamesrochabrun/ShaderKit
//  Licensed under the MIT License. Copyright (c) James Rochabrun.
//  Original copyright and license notice retained as required by MIT.
//  See ShipSwift ACKNOWLEDGEMENTS for the full license text.
//
//  Stitchable SwiftUI layerEffect — maximum-intensity holographic shader
//  with a dense vertical diamond grid, multi-hue rainbow, three moving
//  light hotspots and layered sparkles. All highlights track the `tilt`
//  vector for an aggressive "secret-rare card" shimmer.
//
//  The two utility helpers below (hash + HSV->RGB) are vendored verbatim
//  from ShaderKit's ShaderUtilities.metal and namespaced with a `swBling_`
//  prefix so every SW Metal file stays self-contained and free of
//  duplicate-symbol collisions across the app's single shader library.
//
//  Paired with: SWIntenseBling.swift
//  Entry point: `swIntenseBling` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - helpers (vendored from ShaderKit ShaderUtilities.metal)
// =============================================================================

/// 2D hash for pseudo-random values.
 float swBling_hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/// Convert HSV to RGB color space.
 vec3 swBling_hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// =============================================================================
// MARK: - swIntenseBling
// =============================================================================

vec4 swIntenseBling(vec2 position, int layer, vec4 boundingRect, vec2 tilt, float time, float intensity) {

    vec2 size = boundingRect.zw;
    vec2 uv = position / size;
    vec4 originalColor = layerSample(position);

    if (originalColor.a < 0.01) {
        return originalColor;
    }

    // Dense vertical diamond grid
    float diamondWidth = 28.0;
    float diamondHeight = 48.0;

    vec2 diamondUV = vec2(
        uv.x * diamondWidth,
        uv.y * diamondHeight
    );

    float row = floor(diamondUV.y);
    if (mod(row, 2.0) == 1.0) {
        diamondUV.x += 0.5;
    }

    vec2 diamondCell = floor(diamondUV);
    vec2 diamondLocal = fract(diamondUV) - 0.5;
    float diamondDist = abs(diamondLocal.x) * 2.0 + abs(diamondLocal.y);

    float diamondEdge = smoothstep(0.5, 0.25, diamondDist);
    float diamondRim = smoothstep(0.5, 0.4, diamondDist) - smoothstep(0.4, 0.3, diamondDist);

    // Multi-hue rainbow
    vec2 tiltOffset = tilt * 4.0;
    float hue1 = fract((diamondCell.x + diamondCell.y) * 0.06 + tiltOffset.x * 0.12);
    float hue2 = fract((diamondCell.x - diamondCell.y) * 0.04 + tiltOffset.y * 0.1);
    float hue = fract((hue1 + hue2) * 0.5 + time * 0.01);

    vec3 diamondColor = swBling_hsv2rgb(vec3(hue, 0.9, 1.0));

    // Secondary color layer
    float hue3 = fract(hue + 0.33);
    vec3 diamondColor2 = swBling_hsv2rgb(vec3(hue3, 0.7, 0.9));

    // Multiple light sources
    vec2 light1 = vec2(0.5 + tilt.y * 0.9, 0.5 + tilt.x * 0.9);
    vec2 light2 = vec2(0.5 - tilt.y * 0.6, 0.5 - tilt.x * 0.6);
    vec2 light3 = vec2(0.5 + tilt.x * 0.5, 0.5 - tilt.y * 0.5);

    float hot1 = pow(smoothstep(0.5, 0.0, length(uv - light1)), 1.8);
    float hot2 = pow(smoothstep(0.4, 0.0, length(uv - light2)), 2.0) * 0.6;
    float hot3 = pow(smoothstep(0.35, 0.0, length(uv - light3)), 2.0) * 0.4;
    float totalHot = hot1 + hot2 + hot3;

    // Intense sparkles
    float sparkleRand = swBling_hash21(diamondCell);
    float sparklePhase = sparkleRand * 6.28 + (tilt.x + tilt.y) * 12.0 + time * 3.0;
    float sparkle = pow(max(0.0, sin(sparklePhase)), 6.0);
    sparkle *= step(0.5, sparkleRand);
    sparkle *= diamondEdge;

    // Extra bright sparkles
    float megaSparkle = pow(max(0.0, sin(sparklePhase * 0.5)), 12.0);
    megaSparkle *= step(0.85, sparkleRand);
    megaSparkle *= diamondEdge;

    // Combine all effects. `hi` scales every holographic overlay so the
    // shader can act as a light surface finish (intensity 0 ≈ source image)
    // up to the full secret-rare blast (intensity 1).
    float hi = float(intensity);

    float holoStrength = float(diamondEdge * (0.7 + totalHot * 0.3)) * hi;
    vec3 result = mix(originalColor.rgb, diamondColor, holoStrength);

    result = mix(result, diamondColor2, float(totalHot * diamondEdge * 0.3) * hi);
    result += float(totalHot * diamondEdge * 0.5) * diamondColor * hi;
    result += float(diamondRim * 0.5 * (totalHot + 0.3)) * vec3(1.0, 1.0, 1.0) * hi;
    result += float(sparkle * 1.5) * vec3(1.0, 1.0, 1.0) * hi;
    result += float(megaSparkle * 2.5) * vec3(1.0, 0.95, 0.9) * hi;
    result *= float(1.0 + totalHot * 0.25 * intensity);

    return vec4(result, originalColor.a);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swIntenseBling(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uTilt, uTime, uIntensity);
}
