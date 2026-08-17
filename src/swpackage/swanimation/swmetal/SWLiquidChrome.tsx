import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWLiquidChrome.frag?raw";

export function SWLiquidChrome({
  shadow = "#05030d",
  silver = "#333340",
  highlight = "#808099",
  tint = "#263366",
  speed = 0.3,
  scale = 2,
  warp = 1.5,
  contrast = 0.6,
  specPower = 12,
  specStrength = 0.3,
  tintStrength = 0.15,
  showsControls = false,
}: {
  shadow?: string;
  silver?: string;
  highlight?: string;
  tint?: string;
  speed?: number;
  scale?: number;
  warp?: number;
  contrast?: number;
  specPower?: number;
  specStrength?: number;
  tintStrength?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    {
      shadow,
      silver,
      highlight,
      tint,
      speed,
      scale,
      warp,
      contrast,
      specPower,
      specStrength,
      tintStrength,
    },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Liquid Chrome"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uScale: v.scale,
        uWarp: v.warp,
        uContrast: v.contrast,
        uSpecPower: v.specPower,
        uSpecStrength: v.specStrength,
        uTintStrength: v.tintStrength,
        uShadow: v.shadow,
        uSilver: v.silver,
        uHighlight: v.highlight,
        uTint: v.tint,
      }}
      fields={[
        { kind: "color", key: "shadow", label: "Shadow" },
        { kind: "color", key: "silver", label: "Silver" },
        { kind: "color", key: "highlight", label: "Highlight" },
        { kind: "color", key: "tint", label: "Tint" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.2, max: 5, step: 0.05 },
        { kind: "slider", key: "warp", label: "Warp", min: 0, max: 5, step: 0.05 },
        { kind: "slider", key: "contrast", label: "Contrast", min: 0.1, max: 3, step: 0.05 },
        { kind: "slider", key: "specPower", label: "Spec Power", min: 1, max: 50, step: 0.5 },
        { kind: "slider", key: "specStrength", label: "Spec Strength", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "tintStrength", label: "Tint Strength", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 2, step: 0.05 },
      ]}
    />
  );
}
