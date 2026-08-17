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
//  SWDotsMountains.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect — `mountains` style of the SWDots family.
//  Sharp, jagged mountain ridges on a 3D dot grid. Fractal-summed sines
//  with an abs/pow fold produce pointy peaks; same perspective skeleton
//  as `SWDotsWavy.metal`.
//
//  Paired with: SWDots.swift (style = .mountains)
//  Entry point: `swDotsMountains` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





 float swDotsMountainsHeight(float x, float z, float t,
                                   float amplitude, float patternScale) {
    float h = sin(x * 1.0 * patternScale + t * 0.20) * 0.50 +
              sin(z * 0.8 * patternScale + t * 0.15) * 0.50 +
              sin((x * 2.3 + z * 1.7) * patternScale + t * 0.30) * 0.30 +
              sin((x * 4.7 - z * 3.1) * patternScale + t * 0.40) * 0.18 +
              sin((x * 9.0 + z * 7.0) * patternScale + t * 0.55) * 0.10;
    h = 1.0 - abs(h * 0.5);
    h = pow(max(h, 0.0), 2.5) - 0.4;
    h *= 0.16;
    float damp = 1.0 - smoothstep(4.0, 10.0, z) * 0.85;
    return h * damp * amplitude;
}

vec4 swDotsMountains(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float brightness, vec4 tint, vec4 background, float dotSize, float gridDensity, float patternScale, float vignette, float horizon, float amplitude, float depthFade) {

    vec2 size = boundingRect.zw;
    vec2 uv   = (position - 0.5 * size) / size.y;
    float  t    = time * speed;

    float yFromHorizon = uv.y - horizon;
    if (yFromHorizon < 0.002) {
        return vec4(vec3(background.rgb), 1.0);
    }

    // Wave-aware Z sweep — see SWDotsWavy.metal for the derivation.
    // `yampBound` here is the peak |Y| the mountain height function can
    // produce (~0.12 at amplitude=1). Replaces a fixed ±dj window that
    // dropped cells (black holes) once gridDensity or amplitude grew past
    // the hardcoded radius.
    float gridSize = 0.034 / max(gridDensity, 0.01);
    const float cellZmax = 9.1;
    float jMaxAbsolute = cellZmax / gridSize;

    float Z0        = 1.0 / yFromHorizon;
    float dampEst   = 1.0 - smoothstep(3.5, 9.0, Z0 * 0.85) * 0.85;
    float yampBound = max(0.12 * dampEst * amplitude, 0.03);
    float Zlo = max(0.05, (1.0 - yampBound) / yFromHorizon);
    float Zhi = (1.0 + yampBound) / yFromHorizon;
    int jMin = max(1, int(floor(Zlo / gridSize)));
    int jMax = min(int(jMaxAbsolute), int(ceil(Zhi / gridSize)));

    vec3 accum = vec3(0.0);
    float halfSizeX = 0.5 * size.x;
    float halfSizeY = 0.5 * size.y;
    for (int j = jMin; j <= jMax; j++) {
        float jf    = float(j);
        float cellZ = jf * gridSize;

        float rawR             = 4.4 / (1.0 + cellZ * 1.10);
        float pxR              = max(rawR, 0.85) * dotSize;
        float horizCullThresh  = pxR * 4.0 + 2.0;
        float haloScale        = max(pxR * 1.7, 1.2);
        float subPxFade        = smoothstep(0.4, 1.0, rawR);
        float depth            = 1.0 / (1.0 + cellZ * 0.32 * depthFade);
        float invCellZ         = 1.0 / cellZ;
        float pitchScreenX     = gridSize * invCellZ * size.y;
        float iCenter          = round(uv.x * jf);
        float iCenterScreenX   = iCenter * pitchScreenX + halfSizeX;
        float iCenterCellX     = iCenter * gridSize;

        for (int di = -1; di <= 1; di++) {
            float dotScreenX = iCenterScreenX + float(di) * pitchScreenX;
            if (abs(position.x - dotScreenX) > horizCullThresh) continue;

            float cellX = iCenterCellX + float(di) * gridSize;
            float Y     = swDotsMountainsHeight(cellX, cellZ, t, amplitude, patternScale);
            float dotYFromH = (1.0 - Y) * invCellZ;
            if (dotYFromH < 0.01) continue;
            float dotScreenY = (horizon + dotYFromH) * size.y + halfSizeY;

            float horizonFade = smoothstep(0.0, 0.05, dotYFromH);
            float d           = length(position - vec2(dotScreenX, dotScreenY));
            float mask        = smoothstep(pxR + 1.0, pxR - 1.0, d);
            float halo        = exp(-d / haloScale) * 0.25;
            float crest       = clamp(Y / (0.16 * max(amplitude, 0.01)) * 0.5 + 0.5, 0.0, 1.0);
            float ridge       = pow(crest, 3.0);
            float highlight   = 0.35 + 0.55 * crest + 0.6 * ridge;
            float intensity   = (mask + halo) * depth * highlight * horizonFade * subPxFade;
            accum = max(accum, vec3(intensity));
        }
    }
    accum = min(accum * 1.15, vec3(1.0));

    vec2 vUV  = (position - 0.5 * size) / size;
    float  vig  = clamp(1.0 - dot(vUV, vUV) * 0.5 * vignette, 0.0, 1.0);
    accum *= float(vig);

    vec3 fg  = vec3(tint.rgb) * brightness;
    vec3 bg  = vec3(background.rgb);
    vec3 col = mix(bg, fg, vec3(accum));
    return vec4(vec3(col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swDotsMountains(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uBrightness, uTint, uBackground, uDotSize, uGridDensity, uPatternScale, uVignette, uHorizon, uAmplitude, uDepthFade);
}
