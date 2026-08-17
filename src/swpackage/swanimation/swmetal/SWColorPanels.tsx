import { ColorShader, padColors, useControlState } from "./shaderHost";
import source from "./SWColorPanels.frag?raw";

const DEFAULT_COLORS = ["#f2334d", "#fad933", "#40d9f2", "#f266bf"];

export function SWColorPanels({
  colors = DEFAULT_COLORS,
  colorBack = "#0e0e14",
  density = 2,
  angle1 = 0,
  angle2 = 0,
  panelLength = 1,
  edges = true,
  blur = 0.1,
  fadeIn = 0.5,
  fadeOut = 0.5,
  gradient = 0,
  scale = 1,
  speed = 1,
  showsControls = false,
}: {
  colors?: string[];
  colorBack?: string;
  density?: number;
  angle1?: number;
  angle2?: number;
  panelLength?: number;
  edges?: boolean;
  blur?: number;
  fadeIn?: number;
  fadeOut?: number;
  gradient?: number;
  scale?: number;
  speed?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 7, colorBack);
  const [v, onChange] = useControlState(
    {
      colorBack,
      density,
      angle1,
      angle2,
      panelLength,
      edges,
      blur,
      fadeIn,
      fadeOut,
      gradient,
      scale,
      speed,
      c0: slots[0]!,
      c1: slots[1]!,
      c2: slots[2]!,
      c3: slots[3]!,
      c4: slots[4]!,
      c5: slots[5]!,
      c6: slots[6]!,
    },
    showsControls,
  );
  const count = Math.max(1, Math.min(colors.length, 7));
  return (
    <ColorShader
      source={source}
      title="Color Panels"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uCurrentColor: v.colorBack,
        uScale: v.scale,
        uColorsCountF: count,
        uDensity: v.density,
        uAngle1: v.angle1,
        uAngle2: v.angle2,
        uPanelLength: v.panelLength,
        uEdgesF: v.edges ? 1 : 0,
        uBlur: v.blur,
        uFadeIn: v.fadeIn,
        uFadeOut: v.fadeOut,
        uGradient: v.gradient,
        uColorBack: v.colorBack,
        uC0: v.c0,
        uC1: v.c1,
        uC2: v.c2,
        uC3: v.c3,
        uC4: v.c4,
        uC5: v.c5,
        uC6: v.c6,
      }}
      fields={[
        { kind: "color", key: "colorBack", label: "Background" },
        { kind: "color", key: "c0", label: "Color 1" },
        { kind: "color", key: "c1", label: "Color 2" },
        { kind: "color", key: "c2", label: "Color 3" },
        { kind: "color", key: "c3", label: "Color 4" },
        { kind: "toggle", key: "edges", label: "Edges" },
        { kind: "slider", key: "density", label: "Density", min: 0.25, max: 7, step: 0.05 },
        { kind: "slider", key: "angle1", label: "Angle 1", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "angle2", label: "Angle 2", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "panelLength", label: "Panel Length", min: 0.05, max: 3, step: 0.05 },
        { kind: "slider", key: "blur", label: "Blur", min: 0, max: 0.5, step: 0.01 },
        { kind: "slider", key: "fadeIn", label: "Fade In", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "fadeOut", label: "Fade Out", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "gradient", label: "Gradient", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "scale", label: "Scale", min: 0.05, max: 4, step: 0.05 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
