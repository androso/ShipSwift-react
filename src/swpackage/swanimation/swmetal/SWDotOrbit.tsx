import { ColorShader, padColors, useControlState } from "./shaderHost";
import source from "./SWDotOrbit.frag?raw";

const DEFAULT_COLORS = ["#33d9f2", "#1a66f2", "#8c33f2", "#f24da6", "#ffd933"];

export function SWDotOrbit({
  colors = DEFAULT_COLORS,
  colorBack = "#ffffff",
  speed = 1,
  scale = 10,
  size = 1,
  sizeRange = 0.5,
  spreading = 1,
  stepsPerColor = 1,
  showsControls = false,
}: {
  colors?: string[];
  colorBack?: string;
  speed?: number;
  scale?: number;
  size?: number;
  sizeRange?: number;
  spreading?: number;
  stepsPerColor?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 10);
  const [v, onChange] = useControlState(
    {
      colorBack,
      speed,
      scale,
      size,
      sizeRange,
      spreading,
      stepsPerColor,
      c1: slots[0]!,
      c2: slots[1]!,
      c3: slots[2]!,
      c4: slots[3]!,
      c5: slots[4]!,
      c6: slots[5]!,
      c7: slots[6]!,
      c8: slots[7]!,
      c9: slots[8]!,
      c10: slots[9]!,
    },
    showsControls,
  );
  const count = Math.max(1, Math.min(colors.length, 10));
  return (
    <ColorShader
      source={source}
      title="Dot Orbit Controls"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uInColor: v.colorBack,
        uSpeed: v.speed,
        uScale: v.scale,
        uSize: v.size,
        uSizeRange: v.sizeRange,
        uSpreading: v.spreading,
        uStepsPerColor: v.stepsPerColor,
        uColorsCount: count,
        uC1: v.c1,
        uC2: v.c2,
        uC3: v.c3,
        uC4: v.c4,
        uC5: v.c5,
        uC6: v.c6,
        uC7: v.c7,
        uC8: v.c8,
        uC9: v.c9,
        uC10: v.c10,
        uColorBack: v.colorBack,
      }}
      fields={[
        { kind: "color", key: "colorBack", label: "Background" },
        { kind: "color", key: "c1", label: "Color 1" },
        { kind: "color", key: "c2", label: "Color 2" },
        { kind: "color", key: "c3", label: "Color 3" },
        { kind: "color", key: "c4", label: "Color 4" },
        { kind: "color", key: "c5", label: "Color 5" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.5, max: 20, step: 0.1 },
        { kind: "slider", key: "size", label: "Size", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "sizeRange", label: "Size Range", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "spreading", label: "Spreading", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "stepsPerColor", label: "Steps", min: 1, max: 4, step: 1 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
