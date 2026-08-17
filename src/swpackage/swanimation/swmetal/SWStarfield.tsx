import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWStarfield.frag?raw";

export function SWStarfield({
  starColor = "#ffffff",
  background = "#000000",
  speed = 1,
  layers = 4,
  baseScale = 60,
  scaleStep = 30,
  density = 0.3,
  starSize = 0.4,
  twinkleSpeed = 3,
  twinkleAmount = 0.3,
  showsControls = false,
}: {
  starColor?: string;
  background?: string;
  speed?: number;
  layers?: number;
  baseScale?: number;
  scaleStep?: number;
  density?: number;
  starSize?: number;
  twinkleSpeed?: number;
  twinkleAmount?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    {
      starColor,
      background,
      speed,
      layers,
      baseScale,
      scaleStep,
      density,
      starSize,
      twinkleSpeed,
      twinkleAmount,
    },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Starfield Controls"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uLayers: v.layers,
        uBaseScale: v.baseScale,
        uScaleStep: v.scaleStep,
        uDensity: v.density,
        uStarSize: v.starSize,
        uTwinkleSpeed: v.twinkleSpeed,
        uTwinkleAmount: v.twinkleAmount,
        uStarColor: v.starColor,
        uBackground: v.background,
      }}
      fields={[
        { kind: "color", key: "starColor", label: "Star Color" },
        { kind: "color", key: "background", label: "Background" },
        { kind: "slider", key: "layers", label: "Layers", min: 1, max: 8, step: 1 },
        { kind: "slider", key: "baseScale", label: "Base Scale", min: 5, max: 200, step: 1 },
        { kind: "slider", key: "scaleStep", label: "Scale Step", min: 0, max: 100, step: 1 },
        { kind: "slider", key: "density", label: "Density", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "starSize", label: "Star Size", min: 0.05, max: 2, step: 0.05 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
        { kind: "slider", key: "twinkleSpeed", label: "Twinkle Speed", min: 0, max: 10, step: 0.1 },
        { kind: "slider", key: "twinkleAmount", label: "Twinkle Amount", min: 0, max: 1, step: 0.01 },
      ]}
    />
  );
}
