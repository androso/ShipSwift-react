import { ColorShader, padColors, useControlState } from "./shaderHost";
import source from "./SWSmokeRing.frag?raw";

export function SWSmokeRing({
  colors = ["#ffffff", "#ffffff"],
  colorBack = "#0a0612",
  thickness = 0.4,
  radius = 0.4,
  innerShape = 1,
  noiseScale = 2.8,
  noiseIterations = 8,
  scale = 0.8,
  speed = 1,
  showsControls = false,
}: {
  colors?: string[];
  colorBack?: string;
  thickness?: number;
  radius?: number;
  innerShape?: number;
  noiseScale?: number;
  noiseIterations?: number;
  scale?: number;
  speed?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 10);
  const [v, onChange] = useControlState(
    {
      colorBack,
      thickness,
      radius,
      innerShape,
      noiseScale,
      noiseIterations,
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
      title="Smoke Ring"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uCurrentColor: v.colorBack,
        uScale: v.scale,
        uColorsCountF: count,
        uThickness: v.thickness,
        uRadius: v.radius,
        uInnerShape: v.innerShape,
        uNoiseScale: v.noiseScale,
        uNoiseIterationsF: v.noiseIterations,
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
        { kind: "slider", key: "radius", label: "Radius", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "thickness", label: "Thickness", min: 0.01, max: 1, step: 0.01 },
        { kind: "slider", key: "innerShape", label: "Inner Fill", min: 0, max: 4, step: 0.05 },
        { kind: "slider", key: "scale", label: "Scale", min: 0.05, max: 4, step: 0.05 },
        { kind: "slider", key: "noiseScale", label: "Noise Scale", min: 0.01, max: 5, step: 0.01 },
        { kind: "slider", key: "noiseIterations", label: "Iterations", min: 1, max: 8, step: 1 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
