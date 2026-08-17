import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWFractalClouds.frag?raw";

export function SWFractalClouds({
  skyColor = "#1a2659",
  cloudColor = "#e6e6ff",
  warmTint = "#1a0d00",
  warmth = 0.5,
  speed = 1,
  zoom = 3,
  driftX = 0.08,
  driftY = 0.04,
  warp = 2,
  coverage = 0,
  showsControls = false,
}: {
  skyColor?: string;
  cloudColor?: string;
  warmTint?: string;
  warmth?: number;
  speed?: number;
  zoom?: number;
  driftX?: number;
  driftY?: number;
  warp?: number;
  coverage?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    { skyColor, cloudColor, warmTint, warmth, speed, zoom, driftX, driftY, warp, coverage },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Fractal Clouds"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uZoom: v.zoom,
        uDriftX: v.driftX,
        uDriftY: v.driftY,
        uWarp: v.warp,
        uCoverage: v.coverage,
        uSkyColor: v.skyColor,
        uCloudColor: v.cloudColor,
        uWarmTint: v.warmTint,
        uWarmth: v.warmth,
      }}
      fields={[
        { kind: "color", key: "skyColor", label: "Sky" },
        { kind: "color", key: "cloudColor", label: "Cloud" },
        { kind: "color", key: "warmTint", label: "Warm Tint" },
        { kind: "slider", key: "warmth", label: "Warmth", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "zoom", label: "Zoom", min: 0.5, max: 8, step: 0.05 },
        { kind: "slider", key: "driftX", label: "Drift X", min: -0.5, max: 0.5, step: 0.01 },
        { kind: "slider", key: "driftY", label: "Drift Y", min: -0.5, max: 0.5, step: 0.01 },
        { kind: "slider", key: "warp", label: "Warp", min: 0, max: 4, step: 0.05 },
        { kind: "slider", key: "coverage", label: "Coverage", min: -0.5, max: 0.5, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
