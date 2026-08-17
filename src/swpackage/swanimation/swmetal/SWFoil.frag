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
//  SWFoil.metal
//  ShipSwift
//
//  Adapted from ShaderKit by James Rochabrun
//  https://github.com/jamesrochabrun/ShaderKit
//  Licensed under the MIT License. Copyright (c) James Rochabrun.
//  Original copyright and license notice retained as required by MIT.
//  See ShipSwift ACKNOWLEDGEMENTS for the full license text.
//
//  Stitchable SwiftUI layerEffect that paints a holographic rainbow foil
//  over any source layer. Three crossing sine waves drive a rainbow ramp,
//  a high-power sparkle term adds glints, and a tilt-driven fresnel rim
//  makes the foil flare as the card is rotated.
//
//  Paired with: SWFoil.swift
//  Entry point: `swFoil` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - helpers
// =============================================================================

// Rainbow color generation — phase-shifted sines on the three channels.
 vec3 swFoil_generateRainbow(float angle, float intensity) {
    vec3 color;
    color.r = sin(angle) * 0.5 + 0.5;
    color.g = sin(angle + 2.094) * 0.5 + 0.5;
    color.b = sin(angle + 4.189) * 0.5 + 0.5;
    return color * float(intensity);
}

// =============================================================================
// MARK: - swFoil
// =============================================================================

vec4 swFoil(vec2 position, int layer, vec4 boundingRect, vec2 tilt, float time, float intensity) {

    vec2 size = boundingRect.zw;
    vec4 originalColor = layerSample(position);

    if (originalColor.a < 0.01) {
        return originalColor;
    }

    vec2 uv = position / size;

    // Holographic angle based on position and tilt
    float angle = (uv.x + uv.y) * 6.0 + tilt.x * 3.0 + tilt.y * 2.0 + time * 0.5;

    // Wave patterns
    float wave1 = sin(uv.x * 20.0 + time * 2.0 + tilt.x * 5.0) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 15.0 + time * 1.5 + tilt.y * 4.0) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 25.0 + time * 3.0) * 0.5 + 0.5;

    float pattern = (wave1 + wave2 + wave3) / 3.0;

    vec3 rainbow = swFoil_generateRainbow(angle + pattern * 2.0, 1.0);

    // Sparkle effect
    float sparkleAngle = (uv.x * 50.0 + uv.y * 50.0 + time * 10.0);
    float sparkle = pow(max(0.0, sin(sparkleAngle)), 20.0) * 0.5;

    // Fresnel-like effect
    vec2 center = vec2(0.5, 0.5);
    vec2 toCenter = uv - center;
    float tiltDot = dot(normalize(toCenter + 0.001), normalize(tilt + 0.001));
    float fresnel = pow(1.0 - abs(tiltDot), 2.0) * 0.3 + 0.7;

    // Combine effects
    vec3 holoColor = rainbow * float(pattern * fresnel + sparkle);
    vec3 finalColor = mix(originalColor.rgb, originalColor.rgb + holoColor * 0.6, float(intensity));
    finalColor += rainbow * 0.15 * float(intensity);

    return vec4(finalColor, originalColor.a);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swFoil(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uTilt, uTime, uIntensity);
}
