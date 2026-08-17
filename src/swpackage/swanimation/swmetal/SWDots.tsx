import { ColorShader, useControlState } from "./shaderHost";
import wavy from "./SWDotsWavy.frag?raw";
import mountains from "./SWDotsMountains.frag?raw";
import ocean from "./SWDotsOcean.frag?raw";
import standing from "./SWDotsStanding.frag?raw";
import flow from "./SWDotsFlow.frag?raw";
import plasma from "./SWDotsPlasma.frag?raw";
import snake from "./SWDotsSnake.frag?raw";
import type { SWControlField } from "@/swpackage/swutil";

export const SWDotsStyles = [
  "wavy",
  "mountains",
  "ocean",
  "standing",
  "flow",
  "plasma",
  "snake",
] as const;
export type SWDotsStyle = (typeof SWDotsStyles)[number];

const SOURCES: Record<SWDotsStyle, string> = {
  wavy,
  mountains,
  ocean,
  standing,
  flow,
  plasma,
  snake,
};

const LABELS: Record<SWDotsStyle, string> = {
  wavy: "Wavy",
  mountains: "Mountains",
  ocean: "Ocean",
  standing: "Standing",
  flow: "Flow",
  plasma: "Plasma",
  snake: "Snake",
};

const IS_3D: Record<SWDotsStyle, boolean> = {
  wavy: true,
  mountains: true,
  ocean: true,
  standing: true,
  flow: false,
  plasma: false,
  snake: false,
};

export function SWDots({
  style = "wavy",
  tint = "#ffffff",
  background = "#000000",
  speed = 1,
  brightness = 1,
  dotSize = 1,
  gridDensity = 1,
  patternScale = 1,
  amplitude = 1,
  depthFade = 1,
  vignette = 1,
  horizon = -0.45,
  showsControls = false,
}: {
  style?: SWDotsStyle;
  tint?: string;
  background?: string;
  speed?: number;
  brightness?: number;
  dotSize?: number;
  gridDensity?: number;
  patternScale?: number;
  amplitude?: number;
  depthFade?: number;
  vignette?: number;
  horizon?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    {
      style,
      tint,
      background,
      speed,
      brightness,
      dotSize,
      gridDensity,
      patternScale,
      amplitude,
      depthFade,
      vignette,
      horizon,
    },
    showsControls,
  );
  const st = (SWDotsStyles.includes(v.style as SWDotsStyle) ? v.style : "wavy") as SWDotsStyle;
  const fields: SWControlField[] = [
    {
      kind: "select",
      key: "style",
      label: "Style",
      options: SWDotsStyles.map((s) => ({ value: s, label: LABELS[s] })),
    },
    { kind: "color", key: "tint", label: "Dot Color" },
    { kind: "color", key: "background", label: "Background" },
    { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
    { kind: "slider", key: "brightness", label: "Brightness", min: 0, max: 3, step: 0.05 },
    { kind: "slider", key: "dotSize", label: "Dot Size", min: 0.2, max: 3, step: 0.05 },
    { kind: "slider", key: "gridDensity", label: "Grid Density", min: 0.3, max: 3, step: 0.05 },
    { kind: "slider", key: "patternScale", label: "Pattern Scale", min: 0.2, max: 3, step: 0.05 },
    { kind: "slider", key: "vignette", label: "Vignette", min: 0, max: 3, step: 0.05 },
  ];
  if (IS_3D[st]) {
    fields.push(
      { kind: "slider", key: "amplitude", label: "Wave Amplitude", min: 0, max: 3, step: 0.05 },
      { kind: "slider", key: "depthFade", label: "Depth Fade", min: 0, max: 3, step: 0.05 },
      { kind: "slider", key: "horizon", label: "Horizon", min: -1, max: 0.4, step: 0.01 },
    );
  }
  return (
    <ColorShader
      source={SOURCES[st]}
      title="Dots Controls"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uBrightness: v.brightness,
        uTint: v.tint,
        uBackground: v.background,
        uDotSize: v.dotSize,
        uGridDensity: v.gridDensity,
        uPatternScale: v.patternScale,
        uVignette: v.vignette,
        uHorizon: v.horizon,
        uAmplitude: v.amplitude,
        uDepthFade: v.depthFade,
      }}
      fields={fields}
    />
  );
}
