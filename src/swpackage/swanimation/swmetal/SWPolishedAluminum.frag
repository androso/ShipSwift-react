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
//  SWPolishedAluminum.metal
//  ShipSwift
//
//  Adapted from ShaderKit by James Rochabrun
//  https://github.com/jamesrochabrun/ShaderKit
//  Licensed under the MIT License. Copyright (c) James Rochabrun.
//  Original copyright and license notice retained as required by MIT.
//  See ShipSwift ACKNOWLEDGEMENTS for the full license text.
//
//  Stitchable SwiftUI layerEffect — polished aluminum. A tilt-shifted
//  cyan/silver/purple vertical gradient forms the brushed-metal base, a
//  diagonal 45-degree rainbow band sweeps across for iridescence, and a
//  tilt-tracking specular hotspot finishes the lit-metal look.
//
//  The three utility helpers below (hash, value noise, rainbow ramp and
//  screen blend) are vendored verbatim from ShaderKit's
//  ShaderUtilities.metal and namespaced with a `swAlu_` prefix so every
//  SW Metal file stays self-contained and free of duplicate-symbol
//  collisions across the app's single shader library.
//
//  Paired with: SWPolishedAluminum.swift
//  Entry point: `swPolishedAluminum` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - helpers (vendored from ShaderKit ShaderUtilities.metal)
// =============================================================================

/// 2D hash for pseudo-random values.
 float swAlu_hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/// 2D value noise.
 float swAlu_valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = swAlu_hash21(i);
    float b = swAlu_hash21(i + vec2(1.0, 0.0));
    float c = swAlu_hash21(i + vec2(0.0, 1.0));
    float d = swAlu_hash21(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

/// Multi-stop rainbow gradient (7 colors).
 vec3 swAlu_rainbowGradient(float t) {
    vec3 colors[7] = vec3[](
        vec3(1.0, 0.0, 0.0),   // Red
        vec3(1.0, 0.5, 0.0),   // Orange
        vec3(1.0, 1.0, 0.0),   // Yellow
        vec3(0.0, 1.0, 0.0),   // Green
        vec3(0.0, 0.5, 1.0),   // Blue
        vec3(0.3, 0.0, 1.0),   // Indigo
        vec3(0.5, 0.0, 0.5)    // Violet
    );

    float scaledT = fract(t) * 6.0;
    int index = int(scaledT);
    float blend = fract(scaledT);

    int nextIndex = (index + 1) % 7;
    return mix(colors[index], colors[nextIndex], float(blend));
}

/// Screen: Lightens by inverting, multiplying, and inverting again.
 vec3 swAlu_blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
}

// =============================================================================
// MARK: - swPolishedAluminum
// =============================================================================

vec4 swPolishedAluminum(vec2 position, int layer, vec4 boundingRect, vec2 tilt, float time, float intensity) {

    vec2 size = boundingRect.zw;
    vec2 uv = position / size;
    vec4 originalColor = layerSample(position);

    if (originalColor.a < 0.01) {
        return originalColor;
    }

    // =========================================================================
    // STEP 1: Linear Gradient Base (Polished Metal Look)
    // =========================================================================

    // Define polished metal colors
    vec3 silver = vec3(0.92, 0.93, 0.95);       // Bright silver
    vec3 darkSilver = vec3(0.70, 0.72, 0.75);   // Darker silver
    vec3 cyan = vec3(0.5, 0.85, 0.92);          // Cyan/turquoise
    vec3 purple = vec3(0.78, 0.65, 0.88);       // Lavender/purple

    // Linear gradient that shifts with tilt
    // Gradient runs vertically but shifts horizontally with tilt
    float gradientT = uv.y + tilt.x * 0.4 + tilt.y * 0.3;
    gradientT = fract(gradientT); // Keep in 0-1 range

    // Create smooth color bands: cyan -> silver -> purple -> silver -> cyan
    vec3 metalBase;
    if (gradientT < 0.2) {
        // Cyan to silver
        float t = gradientT / 0.2;
        metalBase = mix(cyan, silver, float(smoothstep(0.0, 1.0, t)));
    } else if (gradientT < 0.4) {
        // Silver to bright silver
        float t = (gradientT - 0.2) / 0.2;
        metalBase = mix(silver, vec3(0.98), float(smoothstep(0.0, 1.0, t) * 0.5));
    } else if (gradientT < 0.6) {
        // Silver to purple
        float t = (gradientT - 0.4) / 0.2;
        metalBase = mix(silver, purple, float(smoothstep(0.0, 1.0, t)));
    } else if (gradientT < 0.8) {
        // Purple to silver
        float t = (gradientT - 0.6) / 0.2;
        metalBase = mix(purple, darkSilver, float(smoothstep(0.0, 1.0, t)));
    } else {
        // Dark silver to cyan
        float t = (gradientT - 0.8) / 0.2;
        metalBase = mix(darkSilver, cyan, float(smoothstep(0.0, 1.0, t)));
    }

    // Add horizontal variation for more dimension
    float horizVar = sin(uv.x * 3.14159 + tilt.x * 2.0) * 0.5 + 0.5;
    metalBase = mix(metalBase, metalBase * 1.1, float(horizVar * 0.15));

    // Add subtle noise for brushed texture
    float noise = swAlu_valueNoise(uv * 80.0 + tilt * 2.0);
    metalBase += vec3((noise - 0.5) * 0.08);

    // =========================================================================
    // STEP 2: Diagonal Rainbow Reflection Band
    // =========================================================================

    // Diagonal direction (45 degrees - bottom-left to top-right)
    float rainbowAngle = 45.0 * 3.14159 / 180.0;
    vec2 rainbowDir = vec2(cos(rainbowAngle), sin(rainbowAngle));

    // Rainbow position shifts with tilt for parallax
    vec2 tiltOffset = tilt * 0.5;
    float rainbowT = dot(uv + tiltOffset, rainbowDir);

    // Create a focused band of rainbow
    float bandCenter = 0.5 + (tilt.x + tilt.y) * 0.25;
    float bandWidth = 0.3;
    float bandFalloff = smoothstep(bandCenter - bandWidth, bandCenter, rainbowT) *
                        smoothstep(bandCenter + bandWidth, bandCenter, rainbowT);

    // Rainbow colors along the band
    float rainbowPhase = rainbowT * 2.5 + (tilt.x - tilt.y) * 1.5;
    vec3 rainbow = swAlu_rainbowGradient(rainbowPhase);

    // =========================================================================
    // STEP 3: Combine Layers
    // =========================================================================

    vec3 result = metalBase;

    // Blend rainbow using screen mode for bright overlay
    vec3 rainbowContrib = rainbow * float(bandFalloff * intensity * 0.5);
    result = swAlu_blendScreen(result, rainbowContrib);

    // Add subtle specular highlight that follows tilt
    vec2 lightPos = vec2(0.5 + tilt.x * 0.3, 0.5 + tilt.y * 0.3);
    float lightDist = length(uv - lightPos);
    float specular = smoothstep(0.5, 0.0, lightDist);
    specular = pow(specular, 3.0) * 0.2;
    result += vec3(float(specular));

    // Mix with original based on intensity
    result = mix(originalColor.rgb, result, float(intensity));

    return vec4(clamp(result, vec3(0.0), vec3(1.0)), originalColor.a);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swPolishedAluminum(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uTilt, uTime, uIntensity);
}
