import { ColorShader, padColors, useControlState } from "./shaderHost";
import source from "./SWVoronoi.frag?raw";

const DEFAULT_COLORS = ["#33d9f2", "#1a66f2", "#8c33f2", "#f24da6"];

export function SWVoronoi({
  colors = DEFAULT_COLORS,
  colorBack = "#ffffff",
  colorGap = "#000000",
  colorGlow = "#000000",
  speed = 1,
  scale = 6,
  distortion = 0.3,
  gap = 0.01,
  glow = 0,
  stepsPerColor = 1,
  showsControls = false,
}: {
  colors?: string[];
  colorBack?: string;
  colorGap?: string;
  colorGlow?: string;
  speed?: number;
  scale?: number;
  distortion?: number;
  gap?: number;
  glow?: number;
  stepsPerColor?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 5);
  const [v, onChange] = useControlState(
    {
      colorBack,
      colorGap,
      colorGlow,
      speed,
      scale,
      distortion,
      gap,
      glow,
      stepsPerColor,
      c1: slots[0]!,
      c2: slots[1]!,
      c3: slots[2]!,
      c4: slots[3]!,
      c5: slots[4]!,
    },
    showsControls,
  );
  const count = Math.max(1, Math.min(colors.length, 5));
  return (
    <ColorShader
      source={source}
      title="Voronoi"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uInColor: v.colorBack,
        uSpeed: v.speed,
        uScale: v.scale,
        uDistortion: v.distortion,
        uGap: v.gap,
        uGlow: v.glow,
        uStepsPerColor: v.stepsPerColor,
        uColorsCount: count,
        uC1: v.c1,
        uC2: v.c2,
        uC3: v.c3,
        uC4: v.c4,
        uC5: v.c5,
        uColorGap: v.colorGap,
        uColorGlow: v.colorGlow,
        uColorBack: v.colorBack,
      }}
      fields={[
        { kind: "color", key: "c1", label: "Color 1" },
        { kind: "color", key: "c2", label: "Color 2" },
        { kind: "color", key: "c3", label: "Color 3" },
        { kind: "color", key: "c4", label: "Color 4" },
        { kind: "color", key: "colorBack", label: "Background" },
        { kind: "color", key: "colorGap", label: "Gap" },
        { kind: "color", key: "colorGlow", label: "Glow Color" },
        { kind: "slider", key: "scale", label: "Density", min: 0.3, max: 8, step: 0.05 },
        { kind: "slider", key: "distortion", label: "Distortion", min: 0, max: 0.5, step: 0.01 },
        { kind: "slider", key: "gap", label: "Gap", min: 0, max: 0.1, step: 0.001 },
        { kind: "slider", key: "glow", label: "Glow", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "stepsPerColor", label: "Steps", min: 1, max: 3, step: 1 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
