import { ColorShader, padColors, useControlState } from "./shaderHost";
import source from "./SWSwirl.frag?raw";

const DEFAULT_COLORS = ["#f24db3", "#4d66f2", "#4dd9f2", "#ffffff"];

export function SWSwirl({
  colors = DEFAULT_COLORS,
  colorBack = "#0a0f1a",
  bandCount = 6,
  twist = 0.2,
  center = 0.2,
  proportion = 0.5,
  softness = 0,
  noise = 0.2,
  noiseFrequency = 0.4,
  scale = 1,
  speed = 1,
  showsControls = false,
}: {
  colors?: string[];
  colorBack?: string;
  bandCount?: number;
  twist?: number;
  center?: number;
  proportion?: number;
  softness?: number;
  noise?: number;
  noiseFrequency?: number;
  scale?: number;
  speed?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 10);
  const [v, onChange] = useControlState(
    {
      colorBack,
      bandCount,
      twist,
      center,
      proportion,
      softness,
      noise,
      noiseFrequency,
      scale,
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
      title="Swirl"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uCurrentColor: v.colorBack,
        uScale: v.scale,
        uColorsCountF: count,
        uBandCount: v.bandCount,
        uTwistRaw: v.twist,
        uCenter: v.center,
        uProportion: v.proportion,
        uSoftness: v.softness,
        uNoiseStrength: v.noise,
        uNoiseFrequency: v.noiseFrequency,
        uColorBack: v.colorBack,
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
        { kind: "color", key: "colorBack", label: "Background" },
        { kind: "color", key: "c0", label: "Color 1" },
        { kind: "color", key: "c1", label: "Color 2" },
        { kind: "color", key: "c2", label: "Color 3" },
        { kind: "color", key: "c3", label: "Color 4" },
        { kind: "slider", key: "bandCount", label: "Bands", min: 0, max: 15, step: 1 },
        { kind: "slider", key: "twist", label: "Twist", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "center", label: "Center", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "proportion", label: "Proportion", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "softness", label: "Softness", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "scale", label: "Scale", min: 0.05, max: 4, step: 0.05 },
        { kind: "slider", key: "noise", label: "Strength", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "noiseFrequency", label: "Frequency", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
