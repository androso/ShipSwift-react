import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWGrainGradient.frag?raw";

export function SWGrainGradient({
  color1 = "#ffb380",
  color2 = "#b399ff",
  color3 = "#ff8099",
  speed = 1,
  scale = 1.2,
  grain = 0.06,
  contrast = 1,
  showsControls = false,
}: {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  grain?: number;
  contrast?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    { color1, color2, color3, speed, scale, grain, contrast },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Grain Gradient"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uScale: v.scale,
        uGrain: v.grain,
        uContrast: v.contrast,
        uColor1: v.color1,
        uColor2: v.color2,
        uColor3: v.color3,
      }}
      fields={[
        { kind: "color", key: "color1", label: "Color 1" },
        { kind: "color", key: "color2", label: "Color 2" },
        { kind: "color", key: "color3", label: "Color 3" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.2, max: 4, step: 0.05 },
        { kind: "slider", key: "grain", label: "Grain", min: 0, max: 0.3, step: 0.005 },
        { kind: "slider", key: "contrast", label: "Contrast", min: 0.2, max: 3, step: 0.05 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
