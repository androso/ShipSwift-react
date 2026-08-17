import { type ReactNode } from "react";
import { LayerShader, useControlState } from "./shaderHost";
import source from "./SWLiquidMetal.frag?raw";

export function SWLiquidMetal({
  speed = 1,
  refraction = 0.001,
  edge = 0.8,
  liquid = 0.45,
  patternBlur = 0.012,
  patternScale = 0.5,
  timeScale = 0.08,
  coolTint = 0.5,
  fresnel = 0.6,
  bandSoftness = 7,
  showsControls = false,
  children,
}: {
  speed?: number;
  refraction?: number;
  edge?: number;
  liquid?: number;
  patternBlur?: number;
  patternScale?: number;
  timeScale?: number;
  coolTint?: number;
  fresnel?: number;
  bandSoftness?: number;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    {
      speed,
      refraction,
      edge,
      liquid,
      patternBlur,
      patternScale,
      timeScale,
      coolTint,
      fresnel,
      bandSoftness,
    },
    showsControls,
  );
  return (
    <LayerShader
      source={source}
      title="Liquid Metal"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      timeScale={v.speed}
      uniforms={{
        uSpeed: v.speed,
        uRefraction: v.refraction,
        uEdge: v.edge,
        uLiquid: v.liquid,
        uPatternBlur: v.patternBlur,
        uPatternScale: v.patternScale,
        uTimeScale: v.timeScale,
        uCoolTint: v.coolTint,
        uFresnel: v.fresnel,
        uBandSoftness: v.bandSoftness,
      }}
      fields={[
        { kind: "slider", key: "refraction", label: "Refraction", min: 0, max: 0.06, step: 0.001 },
        { kind: "slider", key: "edge", label: "Edge", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "liquid", label: "Liquid", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "patternBlur", label: "Pattern Blur", min: 0, max: 0.05, step: 0.001 },
        { kind: "slider", key: "patternScale", label: "Pattern Scale", min: 0.3, max: 10, step: 0.05 },
        { kind: "slider", key: "coolTint", label: "Cool Tint", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "fresnel", label: "Fresnel Rim", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "bandSoftness", label: "Band Softness", min: 1, max: 8, step: 0.1 },
        { kind: "slider", key: "timeScale", label: "Time Scale", min: 0, max: 2, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    >
      {children}
    </LayerShader>
  );
}
