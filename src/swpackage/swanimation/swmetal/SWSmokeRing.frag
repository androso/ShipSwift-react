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

uniform vec4 uCurrentColor;
uniform float uScale;
uniform float uColorsCountF;
uniform float uThickness;
uniform float uRadius;
uniform float uInnerShape;
uniform float uNoiseScale;
uniform float uNoiseIterationsF;
uniform vec4 uColorBack;
uniform vec4 uC0;
uniform vec4 uC1;
uniform vec4 uC2;
uniform vec4 uC3;
uniform vec4 uC4;
uniform vec4 uC5;
uniform vec4 uC6;
uniform vec4 uC7;
uniform vec4 uC8;
uniform vec4 uC9;

//
//  SWSmokeRing.metal
//  ShipSwift
//
//  Smoke-ring procedural background as a SwiftUI Metal `colorEffect`.
//
//  Algorithm: a polar-coordinate ring shape (`length(uv)` + `atan2`)
//  is distorted by two layers of value-noise FBM. The two layers are
//  phase-shifted in time and cross-faded so the smoke perpetually
//  re-rolls instead of looping visibly. The ring's radius, thickness
//  and inner-fill are user controls; the distorted shape mask drives
//  the alpha and a 1...10 color gradient.
//
//  Uses a procedural `hash21` so the shader is fully self-contained
//  (no sampler / no resource binding).
//





     float TWO_PI = 6.28318530718;
     float PI     = 3.14159265358979;

     float hash21(vec2 p) {
        p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
        p += dot(p, p.yx + 19.19);
        return fract(p.x * p.y);
    }

    // `randomR` quantizes the input by /100 and wraps to keep the noise
    // tileable.
     float randomR(vec2 p) {
        vec2 uv = floor(p) / 100.0 + 0.5;
        return hash21(fract(uv));
    }

     float valueNoise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = randomR(i);
        float b = randomR(i + vec2(1.0, 0.0));
        float c = randomR(i + vec2(0.0, 1.0));
        float d = randomR(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        float x1 = mix(a, b, u.x);
        float x2 = mix(c, d, u.x);
        return mix(x1, x2, u.y);
    }

     vec2 fbm(vec2 n0, vec2 n1, int iterations) {
        vec2 total = vec2(0.0);
        float  amplitude = 0.4;
        for (int i = 0; i < 8; i++) {
            if (i >= iterations) break;
            total.x += valueNoise(n0) * amplitude;
            total.y += valueNoise(n1) * amplitude;
            n0 *= 1.99;
            n1 *= 1.99;
            amplitude *= 0.65;
        }
        return total;
    }

     float getNoise(vec2 uv,
                          vec2 pUv,
                          float  t,
                          float  noiseScale,
                          int    iterations)
    {
        vec2 pUvLeft  = pUv + 0.03 * t;
        float  period   = max(abs(noiseScale * TWO_PI), 1e-6);
        vec2 pUvRight = vec2(fract(pUv.x / period) * period, pUv.y) + 0.03 * t;
        vec2 n = fbm(pUvLeft, pUvRight, iterations);
        return mix(n.y, n.x, smoothstep(-0.25, 0.25, uv.x));
    }

     float getRingShape(vec2 uv,
                              float radius,
                              float thickness,
                              float innerShape)
    {
        float d = length(uv);
        float ring = 1.0 - smoothstep(radius, radius + thickness, d);
        float inner = pow(innerShape, 3.0) * thickness;
        ring *= smoothstep(radius - inner, radius, d);
        return ring;
    }

     vec4 pickColor(int i,
                           vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4,
                           vec4 c5, vec4 c6, vec4 c7, vec4 c8, vec4 c9) {
        switch (i) {
            case 0: return c0;
            case 1: return c1;
            case 2: return c2;
            case 3: return c3;
            case 4: return c4;
            case 5: return c5;
            case 6: return c6;
            case 7: return c7;
            case 8: return c8;
            default: return c9;
        }
    }


// Smoke-Ring procedural background.
//
// Parameters:
//   - position         : pixel position (`int`-relative).
//   - currentColor     : source color from `.colorEffect` (unused).
//   - boundingRect     : `(x, y, w, h)` of the view's bounding rect.
//   - time             : seconds since the renderer started.
//   - scale            : overall zoom (smaller = ring fills more).
//   - colorsCountF     : number of active palette entries, 1...10.
//   - thickness        : ring thickness, 0.01...1.
//   - radius           : ring radius, 0...1.
//   - innerShape       : inner-fill amount, 0...4 (cubed before use).
//   - noiseScale       : noise frequency, 0.01...5.
//   - noiseIterationsF : FBM layer count, 1...8.
//   - colorBack        : background color.
//   - c0...c9          : up to 10 ring gradient colors.

vec4 swSmokeRing(vec2 position, vec4 currentColor, vec4 boundingRect, float time, float scale, float colorsCountF, float thickness, float radius, float innerShape, float noiseScale, float noiseIterationsF, vec4 colorBack, vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8, vec4 c9) {

    

    vec2 size   = boundingRect.zw;
    float  maxDim = max(max(size.x, size.y), 1.0);

    // Centered, normalized so the ring fits the longest edge.
    vec2 uv = (position - 0.5 * size) / (0.5 * maxDim);
    uv /= max(scale, 0.001);

    float t = time;

    // Two phase-shifted time loops + cross-fade weight so the smoke
    // never visibly repeats.
    float cycleDuration = 3.0;
    float timeBlend     = 0.5 + 0.5 * sin(0.1 * t * PI / cycleDuration - 0.5 * PI);

    float period2    = 2.0 * cycleDuration;
    float localTime1 = fract((0.1 * t + cycleDuration) / period2) * period2;
    float localTime2 = fract((0.1 * t) / period2) * period2;

    float atg = atan(uv.y, uv.x) + 0.001;
    float l   = length(uv);
    float radialOffset = 0.5 * l - rsqrt(max(1e-4, l));

    vec2 polar1 = vec2(atg, localTime1 - radialOffset) * noiseScale;
    vec2 polar2 = vec2(atg, localTime2 - radialOffset) * noiseScale;

    int   iter   = clamp(int(noiseIterationsF), 1, 8);
    float noise1 = getNoise(uv, polar1, t, noiseScale, iter);
    float noise2 = getNoise(uv, polar2, t, noiseScale, iter);
    float noise  = mix(noise1, noise2, timeBlend);

    // Noise warps the polar UV so the ring's silhouette billows.
    vec2 shapeUV = uv * (0.8 + 1.2 * noise);

    float ringShape = getRingShape(shapeUV, radius, thickness, innerShape);

    int colorsCount = clamp(int(colorsCountF), 1, 10);
    int idxLast = colorsCount - 1;

    float mixer = ringShape * ringShape * float(colorsCount - 1);

    vec4 gradient = pickColor(idxLast,
                                c0, c1, c2, c3, c4, c5, c6, c7, c8, c9);
    gradient.rgb *= gradient.a;
    for (int i = 8; i >= 0; i--) {
        if (i >= idxLast) continue;
        float localT = clamp(mixer - float(idxLast - i - 1), 0.0, 1.0);
        vec4 c = pickColor(i, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9);
        c.rgb *= c.a;
        gradient = mix(gradient, c, float(localT));
    }

    vec3 color   = vec3(gradient.rgb) * ringShape;
    float  opacity = float(gradient.a) * ringShape;

    vec3 bgRGB = vec3(colorBack.rgb) * float(colorBack.a);
    color   = color + bgRGB * (1.0 - opacity);
    opacity = opacity + float(colorBack.a) * (1.0 - opacity);

    // Sub-pixel dither against banding.
    float dither = fract(sin(dot(0.014 * position,
                                 vec2(12.9898, 78.233))) * 43758.5453123) - 0.5;
    color += vec3(dither / 256.0);

    return vec4(vec3(color), float(opacity));

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swSmokeRing(position, uCurrentColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uScale, uColorsCountF, uThickness, uRadius, uInnerShape, uNoiseScale, uNoiseIterationsF, uColorBack, uC0, uC1, uC2, uC3, uC4, uC5, uC6, uC7, uC8, uC9);
}
