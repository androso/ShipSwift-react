import { type ReactNode } from "react";
import { LayerShader, useControlState, type SWTilt } from "./shaderHost";
import source from "./SWPolishedAluminum.frag?raw";

export function SWPolishedAluminum({
  tilt = { width: 0, height: 0 },
  intensity = 0.85,
  speed = 1,
  showsControls = false,
  children,
}: {
  tilt?: SWTilt;
  intensity?: number;
  speed?: number;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    { tiltX: tilt.width, tiltY: tilt.height, intensity, speed },
    showsControls,
  );
  return (
    <LayerShader
      source={source}
      title="Polished Aluminum"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uTilt: [v.tiltX, v.tiltY],
        uIntensity: v.intensity,
      }}
      fields={[
        { kind: "slider", key: "tiltX", label: "Tilt X", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "tiltY", label: "Tilt Y", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    >
      {children}
    </LayerShader>
  );
}
