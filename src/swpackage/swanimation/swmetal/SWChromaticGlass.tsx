import { type ReactNode } from "react";
import { LayerShader, useControlState, type SWTilt } from "./shaderHost";
import source from "./SWChromaticGlass.frag?raw";

export function SWChromaticGlass({
  tilt = { width: 0, height: 0 },
  intensity = 0.6,
  separation = 0.4,
  showsControls = false,
  children,
}: {
  tilt?: SWTilt;
  intensity?: number;
  separation?: number;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    { tiltX: tilt.width, tiltY: tilt.height, intensity, separation },
    showsControls,
  );
  return (
    <LayerShader
      source={source}
      title="Chromatic Glass"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uTilt: [v.tiltX, v.tiltY],
        uIntensity: v.intensity,
        uSeparation: v.separation,
      }}
      fields={[
        { kind: "slider", key: "tiltX", label: "Tilt X", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "tiltY", label: "Tilt Y", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "separation", label: "Separation", min: 0, max: 1, step: 0.01 },
      ]}
    >
      {children}
    </LayerShader>
  );
}
