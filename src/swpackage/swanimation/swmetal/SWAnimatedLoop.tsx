import { ColorShader, useControlState } from "./shaderHost";
import shapeSrc from "./SWAnimatedLoopShape.frag?raw";
import diamondSrc from "./SWAnimatedLoopDiamond.frag?raw";
import neonSrc from "./SWAnimatedLoopNeon.frag?raw";
import warpSrc from "./SWAnimatedLoopWarp.frag?raw";
import type { SWControlField } from "@/swpackage/swutil";

export const SWAnimatedLoopStyles = ["shape", "diamond", "neon", "warp"] as const;
export type SWAnimatedLoopStyle = (typeof SWAnimatedLoopStyles)[number];

export const SWAnimatedLoopShapes = ["circle", "square", "diamond", "hexagon", "star"] as const;
export type SWAnimatedLoopShape = (typeof SWAnimatedLoopShapes)[number];

const SOURCES: Record<SWAnimatedLoopStyle, string> = {
  shape: shapeSrc,
  diamond: diamondSrc,
  neon: neonSrc,
  warp: warpSrc,
};

const SHAPE_INDEX: Record<SWAnimatedLoopShape, number> = {
  circle: 0,
  square: 1,
  diamond: 2,
  hexagon: 3,
  star: 4,
};

const NUMERIC: Record<
  SWAnimatedLoopStyle,
  { speed: number; lineWidth: number; lines: number; spacing: number; channelOffset: number; patternMod: number }
> = {
  shape: { speed: 0.05, lineWidth: 0.002, lines: 5, spacing: 5, channelOffset: 0.01, patternMod: 0.2 },
  diamond: { speed: 0.05, lineWidth: 0.002, lines: 6, spacing: 5, channelOffset: 0.01, patternMod: 0.15 },
  neon: { speed: 0.06, lineWidth: 0.002, lines: 5, spacing: 5, channelOffset: 0.01, patternMod: 0.2 },
  warp: { speed: 0.07, lineWidth: 0.002, lines: 6, spacing: 4, channelOffset: 0.008, patternMod: 0.3 },
};

export function SWAnimatedLoop({
  style = "shape",
  shape = "circle",
  petals = 5,
  color1 = "#ff0000",
  color2 = "#00ff00",
  color3 = "#0000ff",
  background = "#000000",
  speed,
  lineWidth,
  lines,
  spacing,
  channelOffset,
  patternMod,
  rotation = 0,
  scale = 1,
  centerX = 0,
  centerY = 0,
  angularLobes = 3,
  angularAmount = 0.08,
  angularSpeed = 0.5,
  showsControls = false,
}: {
  style?: SWAnimatedLoopStyle;
  shape?: SWAnimatedLoopShape;
  petals?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  background?: string;
  speed?: number;
  lineWidth?: number;
  lines?: number;
  spacing?: number;
  channelOffset?: number;
  patternMod?: number;
  rotation?: number;
  scale?: number;
  centerX?: number;
  centerY?: number;
  angularLobes?: number;
  angularAmount?: number;
  angularSpeed?: number;
  showsControls?: boolean;
}) {
  const d = NUMERIC[style];
  const [v, onChange] = useControlState(
    {
      style,
      shape,
      petals,
      color1,
      color2,
      color3,
      background,
      speed: speed ?? d.speed,
      lineWidth: lineWidth ?? d.lineWidth,
      lines: lines ?? d.lines,
      spacing: spacing ?? d.spacing,
      channelOffset: channelOffset ?? d.channelOffset,
      patternMod: patternMod ?? d.patternMod,
      rotation,
      scale,
      centerX,
      centerY,
      angularLobes,
      angularAmount,
      angularSpeed,
    },
    showsControls,
  );
  const handleChange = (key: string, value: string | number | boolean) => {
    if (key === "style" && typeof value === "string") {
      const next = value as SWAnimatedLoopStyle;
      const n = NUMERIC[next];
      onChange("style", next);
      onChange("speed", n.speed);
      onChange("lineWidth", n.lineWidth);
      onChange("lines", n.lines);
      onChange("spacing", n.spacing);
      onChange("channelOffset", n.channelOffset);
      onChange("patternMod", n.patternMod);
      return;
    }
    onChange(key, value);
  };
  const st = (
    SWAnimatedLoopStyles.includes(v.style as SWAnimatedLoopStyle) ? v.style : "shape"
  ) as SWAnimatedLoopStyle;
  const sh = (
    SWAnimatedLoopShapes.includes(v.shape as SWAnimatedLoopShape) ? v.shape : "circle"
  ) as SWAnimatedLoopShape;
  const fields: SWControlField[] = [
    {
      kind: "select",
      key: "style",
      label: "Style",
      options: [
        { value: "shape", label: "Shape" },
        { value: "diamond", label: "Diamond" },
        { value: "neon", label: "Neon" },
        { value: "warp", label: "Warp" },
      ],
    },
    { kind: "color", key: "color1", label: "Color 1" },
    { kind: "color", key: "color2", label: "Color 2" },
    { kind: "color", key: "color3", label: "Color 3" },
    { kind: "color", key: "background", label: "Background" },
    { kind: "slider", key: "speed", label: "Speed", min: 0, max: 0.3, step: 0.005 },
    { kind: "slider", key: "lineWidth", label: "Line Width", min: 0.0005, max: 0.02, step: 0.0005 },
    { kind: "slider", key: "lines", label: "Lines", min: 1, max: 12, step: 1 },
    { kind: "slider", key: "spacing", label: "Spacing", min: 1, max: 12, step: 0.1 },
    { kind: "slider", key: "channelOffset", label: "Channel Offset", min: 0, max: 0.05, step: 0.001 },
    { kind: "slider", key: "patternMod", label: "Pattern Mod", min: 0.05, max: 1, step: 0.01 },
    { kind: "slider", key: "rotation", label: "Rotation", min: 0, max: 6.283, step: 0.01 },
    { kind: "slider", key: "scale", label: "Scale", min: 0.2, max: 3, step: 0.05 },
    { kind: "slider", key: "centerX", label: "Center X", min: -1, max: 1, step: 0.01 },
    { kind: "slider", key: "centerY", label: "Center Y", min: -1, max: 1, step: 0.01 },
  ];
  if (st === "shape") {
    fields.splice(1, 0, {
      kind: "select",
      key: "shape",
      label: "Shape",
      options: [
        { value: "circle", label: "Circle" },
        { value: "square", label: "Square" },
        { value: "diamond", label: "Diamond" },
        { value: "hexagon", label: "Hexagon" },
        { value: "star", label: "Star" },
      ],
    });
    if (sh === "star") {
      fields.splice(2, 0, {
        kind: "slider",
        key: "petals",
        label: "Star Points",
        min: 3,
        max: 12,
        step: 1,
      });
    }
  }
  if (st === "neon") {
    fields.push(
      { kind: "slider", key: "angularLobes", label: "Angular Lobes", min: 1, max: 8, step: 1 },
      { kind: "slider", key: "angularAmount", label: "Angular Amount", min: 0, max: 0.4, step: 0.01 },
      { kind: "slider", key: "angularSpeed", label: "Angular Speed", min: 0, max: 2, step: 0.05 },
    );
  }
  return (
    <ColorShader
      source={SOURCES[st]}
      title="Animated Loop"
      showsControls={showsControls}
      values={v}
      onChange={handleChange}
      uniforms={{
        uSpeed: v.speed,
        uLineWidth: v.lineWidth,
        uLines: v.lines,
        uSpacing: v.spacing,
        uChannelOffset: v.channelOffset,
        uPatternMod: v.patternMod,
        uRotation: v.rotation,
        uScale: v.scale,
        uCenter: [v.centerX, v.centerY],
        uShape: SHAPE_INDEX[sh],
        uPetals: v.petals,
        uAngularLobes: v.angularLobes,
        uAngularAmount: v.angularAmount,
        uAngularSpeed: v.angularSpeed,
        uColor1: v.color1,
        uColor2: v.color2,
        uColor3: v.color3,
        uBackground: v.background,
      }}
      fields={fields}
    />
  );
}
