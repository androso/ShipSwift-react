import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SWShaderControlsSheet, type SWControlField } from "@/swpackage/swutil";
import { rgbTuple } from "./cssColor";

const DEFAULT_CHARS = [
  "道", "可", "道", "非", "常", "道",
  "名", "可", "名", "非", "常", "名",
  "無", "名", "天", "地", "之", "始",
  "有", "名", "萬", "物", "之", "母",
  "故", "常", "無", "欲", "以", "觀", "其", "妙",
  "常", "有", "欲", "以", "觀", "其", "徼",
  "此", "兩", "者", "同", "出", "而", "異", "名",
  "同", "謂", "之", "玄", "玄", "之", "又", "玄",
  "眾", "妙", "之", "門",
];

export type SWCharSphereWeight = "normal" | "medium" | "semibold" | "bold" | "heavy";

const WEIGHT: Record<SWCharSphereWeight, string> = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
};

export function SWCharSphere({
  chars = DEFAULT_CHARS,
  glyphCount = 240,
  colors = ["white", "cyan", "pink"],
  background = "black",
  morphAmount = 1,
  rotationSpeed = 0.5,
  fadeSeconds = 5.5,
  waitSeconds = 5,
  fontSize = 7,
  fontWeight = "semibold",
  hidesBackFaces = false,
  showsControls = false,
  className,
  style,
}: {
  chars?: string[];
  glyphCount?: number;
  colors?: string[];
  background?: string;
  morphAmount?: number;
  rotationSpeed?: number;
  fadeSeconds?: number;
  waitSeconds?: number;
  fontSize?: number;
  fontWeight?: SWCharSphereWeight;
  hidesBackFaces?: boolean;
  showsControls?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const [local, setLocal] = useState({
    chars,
    glyphCount,
    colors,
    background,
    morphAmount,
    rotationSpeed,
    fadeSeconds,
    waitSeconds,
    fontSize,
    fontWeight,
    hidesBackFaces,
  });

  const valuesIn = showsControls
    ? local
    : {
        chars,
        glyphCount,
        colors,
        background,
        morphAmount,
        rotationSpeed,
        fadeSeconds,
        waitSeconds,
        fontSize,
        fontWeight,
        hidesBackFaces,
      };

  const renderer = (
    <SWCharSphereRenderer
      chars={valuesIn.chars}
      glyphCount={valuesIn.glyphCount}
      colors={valuesIn.colors}
      background={valuesIn.background}
      morphAmount={valuesIn.morphAmount}
      rotationSpeed={valuesIn.rotationSpeed}
      fadeSeconds={valuesIn.fadeSeconds}
      waitSeconds={valuesIn.waitSeconds}
      fontSize={valuesIn.fontSize}
      fontWeight={valuesIn.fontWeight}
      hidesBackFaces={valuesIn.hidesBackFaces}
      style={showsControls ? { width: "100%", height: "100%" } : style}
      className={showsControls ? undefined : className}
    />
  );

  if (!showsControls) return renderer;

  const fields: SWControlField[] = [
    { kind: "slider", key: "glyphCount", label: "Glyph Count", min: 50, max: 1000, step: 20 },
    { kind: "slider", key: "morphAmount", label: "Morph", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "fontSize", label: "Font Size", min: 4, max: 30, step: 0.5 },
    { kind: "slider", key: "rotationSpeed", label: "Rotation", min: 0, max: 3, step: 0.05 },
    { kind: "slider", key: "fadeSeconds", label: "Fade s", min: 0.5, max: 20, step: 0.25 },
    { kind: "slider", key: "waitSeconds", label: "Wait s", min: 0, max: 20, step: 0.25 },
    { kind: "toggle", key: "hidesBackFaces", label: "Hide back faces" },
    {
      kind: "select",
      key: "fontWeight",
      label: "Weight",
      options: [
        { value: "normal", label: "Regular" },
        { value: "medium", label: "Medium" },
        { value: "semibold", label: "Semibold" },
        { value: "bold", label: "Bold" },
        { value: "heavy", label: "Heavy" },
      ],
    },
    { kind: "color", key: "color0", label: "Color 1" },
    { kind: "color", key: "color1", label: "Color 2" },
    { kind: "color", key: "color2", label: "Color 3" },
    { kind: "color", key: "background", label: "Background" },
  ];

  const values: Record<string, string | number | boolean> = {
    glyphCount: local.glyphCount,
    morphAmount: local.morphAmount,
    fontSize: local.fontSize,
    rotationSpeed: local.rotationSpeed,
    fadeSeconds: local.fadeSeconds,
    waitSeconds: local.waitSeconds,
    hidesBackFaces: local.hidesBackFaces,
    fontWeight: local.fontWeight,
    color0: toHex(local.colors[0] ?? "white"),
    color1: toHex(local.colors[1] ?? "cyan"),
    color2: toHex(local.colors[2] ?? "pink"),
    background: toHex(local.background),
  };

  return (
    <div className={className} style={{ width: "100%", height: "100%", minHeight: 280, ...style }}>
      <SWShaderControlsSheet
        title="Char Sphere"
        values={values}
        fields={fields}
        onChange={(key, value) => {
          setLocal((prev) => {
            if (key === "color0" || key === "color1" || key === "color2") {
              const next = [...prev.colors];
              const idx = key === "color0" ? 0 : key === "color1" ? 1 : 2;
              next[idx] = String(value);
              return { ...prev, colors: next };
            }
            return { ...prev, [key]: value } as typeof prev;
          });
        }}
      >
        {renderer}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 16,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            value={local.chars.join("")}
            onChange={(e) =>
              setLocal((p) => ({ ...p, chars: Array.from(e.target.value) }))
            }
            placeholder="Glyph palette"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              background: "color-mix(in srgb, var(--sw-surface) 80%, transparent)",
            }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={local.morphAmount}
            onChange={(e) => setLocal((p) => ({ ...p, morphAmount: Number(e.target.value) }))}
            aria-label="Morph"
          />
        </div>
      </SWShaderControlsSheet>
    </div>
  );
}

function toHex(input: string): string {
  if (input.startsWith("#") && (input.length === 7 || input.length === 4)) return input;
  const [r, g, b] = rgbTuple(input);
  const h = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function SWCharSphereRenderer({
  chars,
  glyphCount,
  colors,
  background,
  morphAmount,
  rotationSpeed,
  fadeSeconds,
  waitSeconds,
  fontSize,
  fontWeight,
  hidesBackFaces,
  className,
  style,
}: {
  chars: string[];
  glyphCount: number;
  colors: string[];
  background: string;
  morphAmount: number;
  rotationSpeed: number;
  fadeSeconds: number;
  waitSeconds: number;
  fontSize: number;
  fontWeight: SWCharSphereWeight;
  hidesBackFaces: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const count = Math.max(50, Math.min(1000, Math.round(glyphCount)));
  const cloud = useMemo(
    () => buildCloud(count, Math.max(1, chars.length)),
    [count, chars.length],
  );
  const startRef = useRef(performance.now());
  const palette = useMemo(() => colors.map((c) => rgbTuple(c)), [colors]);
  const safeChars = chars.length ? chars : ["·"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const draw = () => {
      const parent = canvas.parentElement;
      const rect = (parent ?? canvas).getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = cssFill(background);
      ctx.fillRect(0, 0, rect.width, rect.height);

      const elapsed = (performance.now() - startRef.current) / 1000;
      const rotation = elapsed * rotationSpeed;
      const totalCycle = Math.max(0.001, fadeSeconds + waitSeconds);
      const timeInCycle = elapsed % totalCycle;
      const nColors = Math.max(1, palette.length);
      const baseIdx = Math.floor(elapsed / totalCycle) % nColors;
      const nextIdx = (baseIdx + 1) % nColors;
      const baseRGB = palette[baseIdx] ?? [1, 1, 1];
      const nextRGB = palette[nextIdx] ?? [1, 1, 1];
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const tMorph = Math.max(0, Math.min(1, morphAmount));
      const chaosScale = 250 * (1 - tMorph) + 100 * tMorph;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < cloud.randomXYZ.length; i++) {
        const sphereY = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
        const theta = goldenAngle * i;
        const sphereX = radiusAtY * Math.cos(theta);
        const sphereZ = radiusAtY * Math.sin(theta);
        const rnd = cloud.randomXYZ[i]!;
        const wx = (rnd[0] * (1 - tMorph) + sphereX * tMorph) * chaosScale;
        const wy = (rnd[1] * (1 - tMorph) + sphereY * tMorph) * chaosScale;
        const wz = (rnd[2] * (1 - tMorph) + sphereZ * tMorph) * chaosScale;
        const rx = wx * cosR - wz * sinR;
        const rz = wx * sinR + wz * cosR;
        if (hidesBackFaces && rz > 0) continue;
        const p = 300 / (300 + rz);
        const sx = rx * p;
        const sy = wy * p;
        const glyphSize = Math.max(4, fontSize * p);
        const delay = cloud.yNormalized[i]! * fadeSeconds;
        const progress = Math.max(0, Math.min(1, (timeInCycle - delay) / fadeSeconds));
        const r = baseRGB[0] * (1 - progress) + nextRGB[0] * progress;
        const g = baseRGB[1] * (1 - progress) + nextRGB[1] * progress;
        const b = baseRGB[2] * (1 - progress) + nextRGB[2] * progress;
        const glyph = safeChars[cloud.charIndices[i]! % safeChars.length] ?? "·";
        ctx.fillStyle = `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},0.9)`;
        ctx.font = `${WEIGHT[fontWeight]} ${glyphSize}px ui-rounded, system-ui, sans-serif`;
        ctx.fillText(glyph, cx + sx, cy + sy);
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [
    background,
    cloud,
    count,
    fadeSeconds,
    fontSize,
    fontWeight,
    hidesBackFaces,
    morphAmount,
    palette,
    rotationSpeed,
    safeChars,
    waitSeconds,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", minHeight: 280, ...style }}
    />
  );
}

function cssFill(input: string): string {
  if (input.startsWith("#") || input.startsWith("rgb") || input.startsWith("hsl")) return input;
  const [r, g, b] = rgbTuple(input);
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

function buildCloud(glyphCount: number, charCount: number) {
  const randomXYZ: [number, number, number][] = [];
  const sortable: [number, number][] = [];
  const charIndices: number[] = [];
  const safeCharCount = Math.max(1, charCount);
  for (let i = 0; i < glyphCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2 * Math.PI;
    const phi = Math.acos(2 * v - 1);
    const r = Math.pow(Math.random(), 1 / 3);
    randomXYZ.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ]);
    const sphereY = glyphCount > 1 ? 1 - (i / (glyphCount - 1)) * 2 : 0;
    sortable.push([i, sphereY]);
    charIndices.push(Math.floor(Math.random() * safeCharCount));
  }
  const ys = sortable.map((s) => s[1]);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(1e-6, maxY - minY);
  const yNormalized = Array.from({ length: glyphCount }, () => 0);
  for (const [i, y] of sortable) yNormalized[i] = (y - minY) / span;
  return { randomXYZ, yNormalized, charIndices };
}
