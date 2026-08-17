import { useEffect, useState, type ReactNode } from "react";
import {
  SWLayerEffectView,
  SWShaderControlsSheet,
  SWSymbol,
  type SWControlField,
} from "@/swpackage/swutil";
import { rgb3, shaderFillStyle, useControlState } from "./shaderHost";
import source from "./SWGlassLogo.frag?raw";

function FlowingLight({ phase }: { phase: number }) {
  const a = phase;
  const x = 50 + 16 * Math.cos(a);
  const y = 50 + 16 * Math.sin(a * 0.8);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(circle at ${x}% ${y}%, #fc8323 0%, #b3bcff 38%, #0856ff 100%)`,
      }}
    />
  );
}

export function SWGlassLogo({
  symbolName = "apple.logo",
  symbolSize = 300,
  refraction = 0.35,
  frost = 9,
  thickness = 0.6,
  edgeSoftness = 0.6,
  fresnel = 0.08,
  fresnelSoftness = 0.57,
  flowSpeed = 0.18,
  showsControls = false,
  children,
}: {
  symbolName?: string;
  symbolSize?: number;
  refraction?: number;
  frost?: number;
  thickness?: number;
  edgeSoftness?: number;
  fresnel?: number;
  fresnelSoftness?: number;
  flowSpeed?: number;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    { refraction, frost, thickness, edgeSoftness, fresnel, fresnelSoftness, flowSpeed },
    showsControls,
  );
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      setPhase(((t - start) / 1000) * v.flowSpeed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v.flowSpeed]);

  const uniforms = {
    uRefraction: v.refraction,
    uFrost: v.frost,
    uThickness: v.thickness,
    uEdgeSoftness: v.edgeSoftness,
    uFresnel: v.fresnel,
    uFresnelSoftness: v.fresnelSoftness,
    uFresnelColor: rgb3("#b3e5ff"),
    uTintColor: [0.55, 0.7, 1.0] as [number, number, number],
    uTintIntensity: 0.18,
  };

  const content = children ?? (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          width: symbolSize,
          height: symbolSize,
          WebkitMaskImage: "linear-gradient(#000, #000)",
          maskImage: "linear-gradient(#000, #000)",
          position: "relative",
        }}
      >
        <FlowingLight phase={phase} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <SWSymbol name={symbolName} size={symbolSize * 0.72} color="rgba(255,255,255,0.15)" />
        </div>
      </div>
    </div>
  );

  const view = (
    <div style={{ ...shaderFillStyle, background: "#0a0a0a" }}>
      <SWLayerEffectView source={source} uniforms={uniforms} style={shaderFillStyle}>
        {content}
      </SWLayerEffectView>
    </div>
  );

  const fields: SWControlField[] = [
    { kind: "slider", key: "refraction", label: "Refraction", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "frost", label: "Frost", min: 0, max: 24, step: 0.5 },
    { kind: "slider", key: "thickness", label: "Thickness", min: 0, max: 2, step: 0.01 },
    { kind: "slider", key: "edgeSoftness", label: "Edge Softness", min: 0.2, max: 1.5, step: 0.01 },
    { kind: "slider", key: "fresnel", label: "Fresnel", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "fresnelSoftness", label: "Fresnel Softness", min: 0.1, max: 1, step: 0.01 },
    { kind: "slider", key: "flowSpeed", label: "Flow Speed", min: 0, max: 1, step: 0.01 },
  ];

  if (!showsControls) return view;
  return (
    <SWShaderControlsSheet title="Glass Logo" values={v} fields={fields} onChange={onChange}>
      {view}
    </SWShaderControlsSheet>
  );
}
