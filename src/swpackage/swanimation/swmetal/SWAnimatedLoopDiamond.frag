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
uniform float uLineWidth;
uniform float uLines;
uniform float uSpacing;
uniform float uChannelOffset;
uniform float uPatternMod;
uniform float uRotation;
uniform float uScale;
uniform vec2 uCenter;
uniform float uShape;
uniform float uPetals;
uniform float uAngularLobes;
uniform float uAngularAmount;
uniform float uAngularSpeed;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform vec4 uBackground;

//
//  SWAnimatedLoop.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effects — `SWAnimatedLoop` family.
//
//  Four hand-tuned styles bundled in one file because they share the same
//  per-line phase ramp / RGB-channel split / additive composite logic;
//  they only differ in the distance metric `d` and the pattern term `m`.
//
//  Entry points:
//    - `swAnimatedLoopShape`   — user-pickable shape (circle / square /
//                                 diamond pip / hexagon / star)
//    - `swAnimatedLoopDiamond` — L1 distance rings + multiplicative pattern
//    - `swAnimatedLoopNeon`    — circle rings + per-channel angular wobble
//    - `swAnimatedLoopWarp`    — stretched-ellipse rings + 1D pattern
//
//  All four take the same 18-parameter signature so the Swift renderer can
//  use a single argument list and dispatch by name. Parameters that don't
//  apply to a given style are touched with `(void)x;` to make the "unused
//  on purpose" decision explicit.
//
//  Paired with: SWAnimatedLoop.swift
//  Requires iOS 17+ / macOS 14+.
//





// MARK: - Shape



// MARK: - Diamond



// MARK: - Neon



// MARK: - Warp

vec4 swAnimatedLoopDiamond(vec2 position, vec4 color, vec4 boundingRect, float time, float speed, float lineWidth, float lines, float spacing, float channelOffset, float patternMod, float rotation, float scale, vec2 center, float shape, float petals, float angularLobes, float angularAmount, float angularSpeed, vec4 color1, vec4 color2, vec4 color3, vec4 background) {
    vec2 size = boundingRect.zw;
    vec2 uv   = (position * 2.0 - size) / min(size.x, size.y);

    uv = uv / max(scale, 0.0001);
    uv -= center;
    float c = cos(rotation);
    float s = sin(rotation);
    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

    float t     = time * speed;
    int   count = max(1, int(lines));

    float d   = abs(uv.x) + abs(uv.y);
    float pmm = max(patternMod, 0.0001);
    float m   = mod(uv.x * uv.y, pmm);

    vec3 ch[3] = vec3[]( vec3(color1.rgb), vec3(color2.rgb), vec3(color3.rgb) );

    vec3 col = vec3(0.0);
    for (int j = 0; j < 3; j++) {
        float acc = 0.0;
        for (int i = 0; i < count; i++) {
            float f = fract(t - channelOffset * float(j) + 0.012 * float(i)) * spacing - d + m;
            acc += lineWidth * float(i * i) / max(abs(f), 0.00001);
        }
        col += ch[j] * acc;
    }

    vec3 bg = vec3(background.rgb);
    return vec4(vec3(bg + col), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swAnimatedLoopDiamond(position, vec4(0.0), vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uLineWidth, uLines, uSpacing, uChannelOffset, uPatternMod, uRotation, uScale, uCenter, uShape, uPetals, uAngularLobes, uAngularAmount, uAngularSpeed, uColor1, uColor2, uColor3, uBackground);
}
