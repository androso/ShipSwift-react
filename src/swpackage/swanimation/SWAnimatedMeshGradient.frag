#version 300 es
precision highp float;
uniform vec2 uSize;
uniform float uTime;
uniform float uDuration;
uniform vec4 uA0; uniform vec4 uA1; uniform vec4 uA2;
uniform vec4 uA3; uniform vec4 uA4; uniform vec4 uA5;
uniform vec4 uA6; uniform vec4 uA7; uniform vec4 uA8;
uniform vec4 uB0; uniform vec4 uB1; uniform vec4 uB2;
uniform vec4 uB3; uniform vec4 uB4; uniform vec4 uB5;
uniform vec4 uB6; uniform vec4 uB7; uniform vec4 uB8;
out vec4 fragColor;

vec4 cell(int i, vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8) {
  if (i <= 0) return c0;
  if (i == 1) return c1;
  if (i == 2) return c2;
  if (i == 3) return c3;
  if (i == 4) return c4;
  if (i == 5) return c5;
  if (i == 6) return c6;
  if (i == 7) return c7;
  return c8;
}

vec4 sampleMesh(vec2 uv, vec4 c0, vec4 c1, vec4 c2, vec4 c3, vec4 c4, vec4 c5, vec4 c6, vec4 c7, vec4 c8) {
  vec2 p = clamp(uv, 0.0, 1.0) * 2.0;
  int xi = int(floor(p.x));
  int yi = int(floor(p.y));
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  int x1 = min(xi + 1, 2);
  int y1 = min(yi + 1, 2);
  vec4 a = cell(yi * 3 + xi, c0, c1, c2, c3, c4, c5, c6, c7, c8);
  vec4 b = cell(yi * 3 + x1, c0, c1, c2, c3, c4, c5, c6, c7, c8);
  vec4 c = cell(y1 * 3 + xi, c0, c1, c2, c3, c4, c5, c6, c7, c8);
  vec4 d = cell(y1 * 3 + x1, c0, c1, c2, c3, c4, c5, c6, c7, c8);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(uSize, vec2(1.0));
  float t = uTime;
  vec2 fuv = uv;
  fuv.x += 0.045 * sin(t * 0.55 + uv.y * 4.2);
  fuv.y += 0.045 * cos(t * 0.42 + uv.x * 3.6);

  float dur = max(uDuration, 0.001);
  float phase = mod(uTime, dur * 2.0) / dur;
  float linear = phase < 1.0 ? phase : 2.0 - phase;
  float ease = linear * linear * (3.0 - 2.0 * linear);

  vec4 c0 = mix(uB0, uA0, ease);
  vec4 c1 = mix(uB1, uA1, ease);
  vec4 c2 = mix(uB2, uA2, ease);
  vec4 c3 = mix(uB3, uA3, ease);
  vec4 c4 = mix(uB4, uA4, ease);
  vec4 c5 = mix(uB5, uA5, ease);
  vec4 c6 = mix(uB6, uA6, ease);
  vec4 c7 = mix(uB7, uA7, ease);
  vec4 c8 = mix(uB8, uA8, ease);

  fragColor = sampleMesh(fuv, c0, c1, c2, c3, c4, c5, c6, c7, c8);
}
