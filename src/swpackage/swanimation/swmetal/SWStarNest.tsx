import { useControlState, ColorShader } from "./shaderHost";
import source from "./SWStarNest.frag?raw";

export function SWStarNest({
  zoom = 0.8,
  speed = 0.01,
  brightness = 0.0015,
  saturation = 0.85,
  darkmatter = 0.3,
  distfading = 0.73,
  angleX = 0.5,
  angleY = 0.8,
  volsteps = 16,
  iterations = 17,
  showsControls = false,
}: {
  zoom?: number;
  speed?: number;
  brightness?: number;
  saturation?: number;
  darkmatter?: number;
  distfading?: number;
  angleX?: number;
  angleY?: number;
  volsteps?: number;
  iterations?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    {
      zoom,
      speed,
      brightness,
      saturation,
      darkmatter,
      distfading,
      angleX,
      angleY,
      volsteps,
      iterations,
    },
    showsControls,
  );
  return (
    <ColorShader
      source={source}
      title="Star Nest"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uZoom: v.zoom,
        uBrightness: v.brightness,
        uSaturation: v.saturation,
        uDarkmatter: v.darkmatter,
        uDistfading: v.distfading,
        uAngleX: v.angleX,
        uAngleY: v.angleY,
        uVolsteps: v.volsteps,
        uIterations: v.iterations,
      }}
      fields={[
        { kind: "slider", key: "zoom", label: "Zoom", min: 0.2, max: 2, step: 0.01 },
        { kind: "slider", key: "angleX", label: "Angle X", min: 0, max: 6.283, step: 0.01 },
        { kind: "slider", key: "angleY", label: "Angle Y", min: 0, max: 6.283, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 0.05, step: 0.001 },
        { kind: "slider", key: "brightness", label: "Brightness", min: 0.0002, max: 0.006, step: 0.0001 },
        { kind: "slider", key: "saturation", label: "Saturation", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "darkmatter", label: "Dark Matter", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "distfading", label: "Dist Fading", min: 0.3, max: 0.95, step: 0.01 },
        { kind: "slider", key: "volsteps", label: "Vol Steps", min: 4, max: 24, step: 1 },
        { kind: "slider", key: "iterations", label: "Iterations", min: 4, max: 24, step: 1 },
      ]}
    />
  );
}
