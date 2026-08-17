import { ColorShader, padColors, useControlState } from "./shaderHost";
import source from "./SWSimplexNoise.frag?raw";

const DEFAULT_COLORS = ["#ff3b30", "#007aff", "#ffcc00", "#000000", "#a2845e", "#32ade6"];

export function SWSimplexNoise({
  colors = DEFAULT_COLORS,
  scale = 0.05,
  stepsPerColor = 1,
  softness = 0,
  speed = 1,
  showsControls = false,
}: {
  colors?: string[];
  scale?: number;
  stepsPerColor?: number;
  softness?: number;
  speed?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 10);
  const [v, onChange] = useControlState(
    {
      scale,
      stepsPerColor,
      softness,
      speed,
      c0: slots[0]!,
      c1: slots[1]!,
      c2: slots[2]!,
      c3: slots[3]!,
      c4: slots[4]!,
      c5: slots[5]!,
      c6: slots[6]!,
      c7: slots[7]!,
      c8: slots[8]!,
      c9: slots[9]!,
    },
    showsControls,
  );
  const count = Math.max(1, Math.min(colors.length, 10));
  return (
    <ColorShader
      source={source}
      title="Simplex Noise"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uCurrentColor: v.c0,
        uScale: v.scale,
        uColorsCount: count,
        uStepsPerColor: v.stepsPerColor,
        uSoftness: v.softness,
        uC0: v.c0,
        uC1: v.c1,
        uC2: v.c2,
        uC3: v.c3,
        uC4: v.c4,
        uC5: v.c5,
        uC6: v.c6,
        uC7: v.c7,
        uC8: v.c8,
        uC9: v.c9,
      }}
      fields={[
        { kind: "color", key: "c0", label: "Color 1" },
        { kind: "color", key: "c1", label: "Color 2" },
        { kind: "color", key: "c2", label: "Color 3" },
        { kind: "color", key: "c3", label: "Color 4" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.05, max: 4, step: 0.05 },
        { kind: "slider", key: "stepsPerColor", label: "Steps / Color", min: 1, max: 10, step: 1 },
        { kind: "slider", key: "softness", label: "Softness", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
