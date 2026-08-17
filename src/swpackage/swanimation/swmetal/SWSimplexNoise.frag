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
uniform float uColorsCount;
uniform float uStepsPerColor;
uniform float uSoftness;
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
//  SWSimplexNoise.metal
//  ShipSwift
//
//  Simplex-noise procedural background as a SwiftUI Metal `colorEffect`.
//
//  Algorithm: two layered 2D simplex noises composed into a 0..1 shape
//  value, then mapped across up to 10 base colors with `stepsPerColor`
//  banded transitions, `softness`-controlled smoothing, and `fwidth()`
//  derivative-based anti-aliasing. The first and last colors wrap
//  smoothly on either side of the gradient so the palette tiles.
//





     vec2 mod289_2(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
     vec3 mod289_3(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
     vec3 permute289(vec3 x) {
        return mod289_3((x * 34.0 + 1.0) * x);
    }

    // 2D simplex noise (Ashima Arts, public domain).
     float snoise(vec2 v) {
        const vec4 C = vec4( 0.211324865405187,
                                  0.366025403784439,
                                 -0.577350269189626,
                                  0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289_2(i);
        vec3 p = permute289(permute289(i.y + vec3(0.0, i1.y, 1.0))
                              + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0),
                                     dot(x12.xy, x12.xy),
                                     dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x  = 2.0 * fract(p * C.www) - 1.0;
        vec3 h  = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
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

     float steppedSmooth(float m, float steps, float softness) {
        float stepT  = floor(m * steps) / steps;
        float f      = m * steps - floor(m * steps);
        float fw     = steps * fwidth(m);
        float smoothed = smoothstep(0.5 - softness,
                                    min(1.0, 0.5 + softness + fw),
                                    f);
        return stepT + smoothed / steps;
    }


// Procedural Simplex-Noise color background.
//
// Parameters:
//   - position       : pixel position (`int`-relative).
//   - currentColor   : source color from `.colorEffect` (unused).
//   - boundingRect   : `(x, y, w, h)` of the view's bounding rect.
//   - time           : seconds since the renderer started.
//   - scale          : pattern zoom (higher = more cycles per pixel).
//   - colorsCount    : number of active palette entries, 1...10.
//   - stepsPerColor  : extra banded transitions per color pair, 1...10.
//   - softness       : smoothness of band-to-band transitions, 0...1.
//   - c0...c9        : up to 10 palette colors (SwiftUI `Color`s).

vec4 swSimplexNoise(vec2 position, vec4 currentColor, vec4 boundingRect, float time, float scale, float colorsCount, float stepsPerColor, float softness, vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8, vec4 c9) {

    

    vec2 size   = boundingRect.zw;
    float  minDim = max(min(size.x, size.y), 1.0);

    // Normalize so the shader is resolution-independent.
    vec2 uv = (position - 0.5 * size) / minDim;
    uv /= max(scale, 0.001);
    uv *= 0.1; // `shape_uv *= .1`.

    float t = 0.2 * time;

    float noise  = 0.5 * snoise(uv - vec2(0.0, 0.30 * t));
    noise       += 0.5 * snoise(2.0 * uv + vec2(0.0, 0.32 * t));

    float shape = 0.5 + 0.5 * noise;

    float n     = max(1.0, colorsCount);
    float mixer = (shape - 0.5 / n) * n;
    float steps = max(1.0, stepsPerColor);

    vec4 gradient = c0;
    gradient.rgb *= gradient.a;

    for (int i = 1; i < 10; i++) {
        if (i >= int(n)) break;
        float localM = clamp(mixer - float(i - 1), 0.0, 1.0);
        localM = steppedSmooth(localM, steps, 0.5 * softness);
        vec4 cc = pickColor(i, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9);
        cc.rgb *= cc.a;
        gradient = mix(gradient, cc, float(localM));
    }

    // Wrap zone — lets the first and last colors blend smoothly across
    // the gradient seam.
    if (mixer < 0.0 || mixer > (n - 1.0)) {
        float localM = (mixer < 0.0) ? (mixer + 1.0) : (mixer - (n - 1.0));
        localM = steppedSmooth(localM, steps, 0.5 * softness);
        vec4 cFirst = c0;
        cFirst.rgb *= cFirst.a;
        vec4 cLast = pickColor(int(n - 1.0),
                                c0, c1, c2, c3, c4, c5, c6, c7, c8, c9);
        cLast.rgb *= cLast.a;
        gradient = mix(cLast, cFirst, float(localM));
    }

    // Sub-pixel dither against gradient banding.
    float dither = fract(sin(dot(0.014 * position,
                                  vec2(12.9898, 78.233))) * 43758.5453123) - 0.5;
    gradient.rgb += vec3(float(dither / 256.0));

    return gradient;

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swSimplexNoise(position, uCurrentColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uScale, uColorsCount, uStepsPerColor, uSoftness, uC0, uC1, uC2, uC3, uC4, uC5, uC6, uC7, uC8, uC9);
}
