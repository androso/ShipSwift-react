import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWInkSmoke.frag?raw";

export function SWInkSmoke({
  ink1 = "#0d001a",
  ink2 = "#1a3380",
  ink3 = "#661a4d",
  ink4 = "#004d66",
  glow = "#4d3366",
  speed = 1,
  scale = 1.8,
  warp = 4,
  highlight = 1,
  showsControls = false,
}: {
  ink1?: string;
  ink2?: string;
  ink3?: string;
  ink4?: string;
  glow?: string;
  speed?: number;
  scale?: number;
  warp?: number;
  highlight?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    { ink1, ink2, ink3, ink4, glow, speed, scale, warp, highlight },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Ink Smoke"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uScale: v.scale,
        uWarp: v.warp,
        uHighlight: v.highlight,
        uInk1: v.ink1,
        uInk2: v.ink2,
        uInk3: v.ink3,
        uInk4: v.ink4,
        uGlow: v.glow,
      }}
      fields={[
        { kind: "color", key: "ink1", label: "Ink 1" },
        { kind: "color", key: "ink2", label: "Ink 2" },
        { kind: "color", key: "ink3", label: "Ink 3" },
        { kind: "color", key: "ink4", label: "Ink 4" },
        { kind: "color", key: "glow", label: "Glow" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.2, max: 5, step: 0.05 },
        { kind: "slider", key: "warp", label: "Warp", min: 0, max: 8, step: 0.05 },
        { kind: "slider", key: "highlight", label: "Highlight", min: 0, max: 2, step: 0.05 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
