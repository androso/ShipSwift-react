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

uniform vec4 uInColor;
uniform float uSpeed;
uniform float uCount;
uniform float uSizeF;
uniform float uColorsCount;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform vec4 uColor4;
uniform vec4 uColor5;
uniform vec4 uColor6;
uniform vec4 uColor7;
uniform vec4 uColor8;
uniform vec4 uBackground;
uniform float uBigSize;

//
//  SWMetaballs.metal
//  ShipSwift
//
//  Stitchable SwiftUI color effect that renders a cluster of metaballs.
//  Each blob is a radial power-of-distance shape; per-ball shapes are
//  summed and a smoothstep threshold carves the final silhouette. Color
//  is the shape-weighted average of the per-ball colors, composited over
//  `background`.
//
//  Paired with: SWMetaballs.swift
//  Entry point: `swMetaballs` — invoked via SwiftUI `.colorEffect(...)`.
//
//  Requires iOS 17+ / macOS 14+.
//





// 1D hash + smoothstep noise — avoids binding an auxiliary noise texture.
// Produces a smooth pseudo-random scalar in [0, 1] so the per-ball drift
// is continuous in time.
 float swMetaballsHash1(float x) {
    return fract(sin(x * 12.9898) * 43758.5453);
}

 float swMetaballsNoise1(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(swMetaballsHash1(i), swMetaballsHash1(i + 1.0), u);
}

// Radial power-of-distance shape, 0..1.
// `aspectScale` rescales the (uv - c) difference so 1 unit on each axis
// corresponds to the same on-screen distance: keeps the blob round on
// portrait / landscape viewports instead of stretching with the frame.
 float swMetaballsBallShape(vec2 uv, vec2 c, float p, vec2 aspectScale) {
    vec2 diff = (uv - c) * aspectScale;
    float s = 0.5 * length(diff);
    s = 1.0 - clamp_01(s);
    return pow(s, p);
}



// MARK: - Fountain

// A large central ball with small balls streaming vertically: roughly float
// rise from the bottom and converge into the big ball, the other float leave
// the big ball and spread upward out of frame. Because all shapes are summed
// before the threshold, a small ball melts into a teardrop bridge as it nears
// the big ball (the metaball "merge"), then separates again as it travels.
// Reuses the same parameter signature as `swMetaballs`:
//   count = number of small balls (1...7, big ball is always present)
//   size  = ball fatness, speed = stream speed, colors = palette
//           (colors[0] paints the big ball, the rest cycle over small balls).

vec4 swMetaballsFountain(vec2 position, vec4 inColor, vec4 boundingRect, float time, float speed, float count, float size, float colorsCount, vec4 color1, vec4 color2, vec4 color3, vec4 color4, vec4 color5, vec4 color6, vec4 color7, vec4 color8, vec4 background, float bigSize) {

    vec2 sz = boundingRect.zw;
    vec2 shape_uv = position / max(sz, vec2(1.0));
    float minDim = max(min(sz.x, sz.y), 1.0);
    vec2 aspectScale = sz / minDim;

    float t = time * speed;

    vec4 colors[8] = { color1, color2, color3, color4,
                        color5, color6, color7, color8 };
    int colorsCountInt = max(int(colorsCount + 0.5), 1);

    vec3 totalColor = vec3(0.0);
    float  totalShape = 0.0;

    // --- Big central ball (always present, painted with colors[0]) ---
    // Small power = large, soft ball. `bigSize` is independent of `size`.
    // Wide range so `bigSize` can grow the big ball much larger.
    float bigP = 18.0 - 15.0 * bigSize;
    float bigShape = swMetaballsBallShape(shape_uv, vec2(0.5, 0.5), bigP, aspectScale);
    bigShape = smoothstep(0.0, 1.0, bigShape);
    vec4  bigColor = colors[0];
    vec3 bigRGB   = vec3(bigColor.rgb) * float(bigColor.a);
    totalColor += bigRGB * bigShape;
    totalShape += bigShape;

    // --- Small balls streaming in / out ---
    // Large power = small, crisp balls. Wide range so `size` can go very tiny.
    float smallP = 100.0 - 70.0 * size;
    int n = max(min(int(count + 0.5), 99), 1);
    for (int i = 0; i < 99; i++) {
        if (i >= n) break;
        float fi = float(i);

        float h1 = swMetaballsHash1(fi + 1.0);    // per-ball phase offset
        float h2 = swMetaballsHash1(fi + 7.3);    // horizontal spread
        bool  rising = (int(h1 * 17.0) % 2 == 0); // ~float rise, float leave
        float xj = (h2 - 0.5) * 0.55;             // lateral offset at the far end

        float phase = fract(t * 0.22 + h1);       // 0..1 travel loop

        vec2 pos;
        float fade;
        if (rising) {
            // bottom (y = 1.12) -> centre (y = 0.5), x converges to centre.
            float y = mix(1.12, 0.5, phase);
            float x = 0.5 + xj * (1.0 - phase);
            pos = vec2(x, y);
            fade = smoothstep(0.0, 0.18, phase);  // fade in from bottom, stay as it merges
        } else {
            // centre (y = 0.5) -> top (y = -0.12), x spreads outward.
            float y = mix(0.5, -0.12, phase);
            float x = 0.5 + xj * phase;
            pos = vec2(x, y);
            fade = smoothstep(0.0, 0.12, phase) * (1.0 - smoothstep(0.72, 1.0, phase));
        }

        float shape = swMetaballsBallShape(shape_uv, pos, smallP, aspectScale);
        shape = smoothstep(0.0, 1.0, shape) * fade;

        int safeIdx = (i + 1) % colorsCountInt;
        vec4 bc = colors[safeIdx];
        vec3 rgb = vec3(bc.rgb) * float(bc.a);
        // Dissolve into the big ball: the nearer a small ball is to the centre,
        // the more its color is blended toward the big ball's, so it mixes in
        // like two liquids instead of staying a distinct dot.
        float distToBig = length((pos - vec2(0.5)) * aspectScale);
        float blend = 1.0 - smoothstep(0.0, 0.6, distToBig);
        rgb = mix(rgb, bigRGB, blend);
        totalColor += rgb * shape;
        totalShape += shape;
    }

    totalColor /= max(totalShape, 1e-4);

    float edge_width = fwidth(totalShape);
    float finalShape = smoothstep(0.4, 0.4 + edge_width, totalShape);

    vec3 color = totalColor * finalShape +
                   vec3(background.rgb) * (1.0 - finalShape);

    return vec4(vec3(color), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swMetaballsFountain(position, uInColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uCount, uSizeF, uColorsCount, uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uColor7, uColor8, uBackground, uBigSize);
}
