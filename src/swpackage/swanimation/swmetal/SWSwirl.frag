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
uniform float uBandCount;
uniform float uTwistRaw;
uniform float uCenter;
uniform float uProportion;
uniform float uSoftness;
uniform float uNoiseStrength;
uniform float uNoiseFrequency;
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
//  SWSwirl.metal
//  ShipSwift
//
//  Swirl procedural background as a SwiftUI Metal `colorEffect`.
//
//  Algorithm: convert pixel position to polar coordinates, multiply
//  angle by `bandCount` and add time to spin; apply a radial twist via
//  `pow(length, -twist)` which bends straight sectoral bands into
//  spirals; fold to a triangular wave so each band has two edges;
//  optionally distort with simplex noise; mask out the very center;
//  finally map the resulting 0..1 shape value across 1...10 colors
//  with `fwidth()`-based anti-aliasing on each band boundary.
//





     float TWO_PI = 6.28318530718;

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


// Swirl procedural background.
//
// Parameters:
//   - position       : pixel position (`int`-relative).
//   - currentColor   : source color from `.colorEffect` (unused).
//   - boundingRect   : `(x, y, w, h)` of the view's bounding rect.
//   - time           : seconds since the renderer started.
//   - scale          : overall zoom (smaller = swirl fills more).
//   - colorsCountF   : number of active palette entries, 1...10.
//   - bandCount      : number of color bands, 0 = concentric ripples, 0...15.
//   - twist          : vortex power, 0 = straight sectoral shapes, 0...1.
//   - center         : how far from the center the colors begin, 0...1.
//   - proportion     : blend point between colors, 0.5 = equal, 0...1.
//   - softness       : color transition sharpness, 0 = hard, 1 = smooth.
//   - noise          : strength of noise distortion, 0...1.
//   - noiseFrequency : noise frequency, 0...1.
//   - colorBack      : background color.
//   - c0...c9        : up to 10 swirl band colors.

vec4 swSwirl(vec2 position, vec4 currentColor, vec4 boundingRect, float time, float scale, float colorsCountF, float bandCount, float twistRaw, float center, float proportion, float softness, float noiseStrength, float noiseFrequency, vec4 colorBack, vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8, vec4 c9) {

    

    vec2 size   = boundingRect.zw;
    float  maxDim = max(max(size.x, size.y), 1.0);

    // Object UV: centered, normalized so the swirl fills the longest edge.
    vec2 uv = (position - 0.5 * size) / (0.5 * maxDim);
    uv /= max(scale, 0.001);

    float t = time;

    float l = max(1e-4, length(uv));

    float angle = ceil(bandCount) * atan(uv.y, uv.x) + t;
    float angleNorm = angle / TWO_PI;

    float twist  = 3.0 * clamp(twistRaw, 0.0, 1.0);
    float offset = pow(l, -twist) + angleNorm;

    // Triangular wave so each band has two symmetric edges.
    float shape = fract(offset);
    shape = 1.0 - abs(2.0 * shape - 1.0);

    // Optional simplex distortion.
    shape += noiseStrength *
             snoise(15.0 * pow(noiseFrequency, 2.0) * uv);

    // Mask out a tiny disc at the origin (the `atan(0,0)` singularity).
    // Hard-coding 0.2 here would leave a visible black hole; we shrink
    // it to 0.005 so the swirl fills every visible pixel.
    float lPosTwist = pow(l, twist);
    float holeCutoff = 0.005;
    float mid = smoothstep(holeCutoff, holeCutoff + 0.8 * center, lPosTwist);
    shape = mix(0.0, shape, mid);

    // `proportion` warps the gradient distribution between colors.
    float p = clamp(proportion, 0.0, 1.0);
    float exponent = mix(0.25, 1.0, p * 2.0);
    exponent = mix(exponent, 10.0, max(0.0, p * 2.0 - 1.0));
    shape = pow(max(shape, 0.0), exponent);

    // Map `shape` across the palette.
    int colorsCount = clamp(int(colorsCountF), 1, 10);
    float mixer = shape * float(colorsCount);

    vec4 gradient = c0;
    gradient.rgb *= gradient.a;

    float outerShape = 0.0;
    for (int i = 1; i <= 10; i++) {
        if (i > colorsCount) break;
        float m = clamp(mixer - float(i - 1), 0.0, 1.0);
        float aa = fwidth(m);
        m = smoothstep(0.5 - 0.5 * softness - aa,
                       0.5 + 0.5 * softness + aa, m);
        if (i == 1) outerShape = m;

        vec4 c = pickColor(i - 1, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9);
        c.rgb *= c.a;
        gradient = mix(gradient, c, float(m));
    }

    // Smoothly fade out the outermost band against the tiny center disc.
    float midAA    = 0.1 * fwidth(pow(l, -twist));
    float outerMid = smoothstep(holeCutoff, holeCutoff + midAA, lPosTwist);
    outerShape    *= outerMid;

    vec3 color   = vec3(gradient.rgb) * outerShape;
    float  opacity = float(gradient.a)    * outerShape;

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
  fragColor = swSwirl(position, uCurrentColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uScale, uColorsCountF, uBandCount, uTwistRaw, uCenter, uProportion, uSoftness, uNoiseStrength, uNoiseFrequency, uColorBack, uC0, uC1, uC2, uC3, uC4, uC5, uC6, uC7, uC8, uC9);
}
