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

vec4 swMetaballs(vec2 position, vec4 inColor, vec4 boundingRect, float time, float speed, float count, float size, float colorsCount, vec4 color1, vec4 color2, vec4 color3, vec4 color4, vec4 color5, vec4 color6, vec4 color7, vec4 color8, vec4 background) {

    vec2 sz = boundingRect.zw;
    // Map the bounding rect to 0..1 in pixel space — divide the position
    // by the bounding rect.
    vec2 shape_uv = position / max(sz, vec2(1.0));
    // `aspectScale` lets `length()` measure visually equal distances on
    // both axes — divide pixels by the short side, so the short axis
    // scales to 1 and the long axis scales above 1.
    float minDim = max(min(sz.x, sz.y), 1.0);
    vec2 aspectScale = sz / minDim;

    // Offset time by 2503.4 in the first frame so the cluster doesn't
    // start in a "uniform initial state". `speed` is exposed here as a
    // wrapper-side multiplier on top of the internal 0.2 factor.
    const float firstFrameOffset = 2503.4;
    float t = 0.2 * (time * speed + firstFrameOffset);

    // Pack the 8 color slots so the loop can index by ball.
    vec4 colors[8] = { color1, color2, color3, color4,
                        color5, color6, color7, color8 };
    int colorsCountInt = max(int(colorsCount + 0.5), 1);

    // Unrolled to 8 iterations to fit SwiftUI's stitchable color shaders'
    // instruction budget. `count` is exposed as a float so the wrapper can
    // fractional-fade the last ball in / out via `fract(count)`.
    float countClamped = min(max(count, 1.0), 8.0);
    int countCeil = int(ceil(countClamped));

    vec3 totalColor = vec3(0.0);
    float  totalShape = 0.0;

    for (int i = 0; i < 8; i++) {
        if (i >= countCeil) break;

        // Per-ball drift — two 1D noise samples placed on a circle so
        // each ball gets an independent, slowly meandering position.
        float idxFract = float(i) / 20.0;
        float angle = 6.2831853 * idxFract;
        float spd = 1.0 - 0.2 * idxFract;
        float noiseX = swMetaballsNoise1(angle * 10.0 + float(i) + t * spd);
        float noiseY = swMetaballsNoise1(angle * 20.0 + float(i) - t * spd);
        vec2 pos = vec2(0.5) + 1e-4 + 0.9 * (vec2(noiseX, noiseY) - 0.5);

        // Pick color by `i % colorsCount` so adding balls beyond the
        // color count cycles through the palette.
        int safeIdx = i % colorsCountInt;
        vec4 ballColor = colors[safeIdx];
        // Premultiply alpha — the summation assumes premultiplied color
        // contributions.
        vec3 rgb = vec3(ballColor.rgb) * float(ballColor.a);

        // Fractional last-ball fade: when `count` isn't a whole number,
        // shrink the last ball by `fract(count)` so it grows in.
        float sizeFrac = 1.0;
        if (float(i) > floor(countClamped - 1.0)) {
            sizeFrac *= fract(countClamped);
        }

        float p = 45.0 - 30.0 * size * sizeFrac;
        float shape = swMetaballsBallShape(shape_uv, pos, p, aspectScale);
        shape *= pow(size, 0.2);
        shape = smoothstep(0.0, 1.0, shape);

        totalColor += rgb * shape;
        totalShape += shape;
    }

    // Shape-weighted average — gives each blob its own hue while the
    // overlaps blend smoothly.
    totalColor /= max(totalShape, 1e-4);

    // Use `fwidth(totalShape)` for an anti-aliased edge. Metal's `fwidth`
    // works inside fragment-shader-style stitchables — fall back to a
    // small  if the compile target rejects it.
    float edge_width = fwidth(totalShape);
    float finalShape = smoothstep(0.4, 0.4 + edge_width, totalShape);

    vec3 color = totalColor * finalShape +
                   vec3(background.rgb) * (1.0 - finalShape);

    return vec4(vec3(color), 1.0);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swMetaballs(position, uInColor, vec4(0.0, 0.0, uSize.x, uSize.y), uTime, uSpeed, uCount, uSizeF, uColorsCount, uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uColor7, uColor8, uBackground);
}
