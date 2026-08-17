import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWNeuroNoise.frag?raw";

export function SWNeuroNoise({
  colorFront = "#ffffff",
  colorMid = "#56cde3",
  colorBack = "#050519",
  speed = 1,
  brightness = 0.5,
  contrast = 0.5,
  scale = 0.8,
  showsControls = false,
}: {
  colorFront?: string;
  colorMid?: string;
  colorBack?: string;
  speed?: number;
  brightness?: number;
  contrast?: number;
  scale?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    { colorFront, colorMid, colorBack, speed, brightness, contrast, scale },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Neuro Noise"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uBrightness: v.brightness,
        uContrast: v.contrast,
        uScale: v.scale,
        uColorFront: v.colorFront,
        uColorMid: v.colorMid,
        uColorBack: v.colorBack,
      }}
      fields={[
        { kind: "color", key: "colorFront", label: "Front" },
        { kind: "color", key: "colorMid", label: "Mid (web)" },
        { kind: "color", key: "colorBack", label: "Back" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.05, max: 1, step: 0.01 },
        { kind: "slider", key: "brightness", label: "Brightness", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "contrast", label: "Contrast", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
