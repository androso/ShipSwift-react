import { type ReactNode } from "react";
import { LayerShader, useControlState, type SWTilt } from "./shaderHost";
import source from "./SWGlitter.frag?raw";

export function SWGlitter({
  tilt = { width: 0, height: 0 },
  density = 50,
  speed = 1,
  showsControls = false,
  children,
}: {
  tilt?: SWTilt;
  density?: number;
  speed?: number;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    { tiltX: tilt.width, tiltY: tilt.height, density, speed },
    showsControls,
  );
  return (
    <LayerShader
      source={source}
      title="Glitter Controls"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uTilt: [v.tiltX, v.tiltY],
        uDensity: v.density,
      }}
      fields={[
        { kind: "slider", key: "tiltX", label: "Tilt X", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "tiltY", label: "Tilt Y", min: -1, max: 1, step: 0.01 },
        { kind: "slider", key: "density", label: "Density", min: 10, max: 120, step: 1 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    >
      {children}
    </LayerShader>
  );
}
