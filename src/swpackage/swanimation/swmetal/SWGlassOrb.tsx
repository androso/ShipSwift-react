import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  SWLayerEffectView,
  SWShaderControlsSheet,
  type SWControlField,
} from "@/swpackage/swutil";
import { shaderFillStyle, useControlState } from "./shaderHost";
import source from "./SWGlassOrb.frag?raw";

const DEFAULT_COLORS = ["#5856d6", "#007aff", "#30b0c7", "#34c759", "#34c759"];

function gradientFill(colors: string[]): string {
  return `linear-gradient(to bottom, ${colors.join(", ")})`;
}

export function SWGlassOrb({
  radius = 120,
  magnification = 1.6,
  refraction = 0.5,
  edgeHighlight = 0.6,
  dispersion = 0.25,
  colors = DEFAULT_COLORS,
  colorFlow = 30,
  showsControls = false,
}: {
  radius?: number;
  magnification?: number;
  refraction?: number;
  edgeHighlight?: number;
  dispersion?: number;
  colors?: string[];
  colorFlow?: number;
  showsControls?: boolean;
}) {
  const [v, onChange] = useControlState(
    { radius, magnification, refraction, edgeHighlight, dispersion, colorFlow },
    showsControls,
  );
  const [hue, setHue] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (v.colorFlow === 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      setHue((((t - start) / 1000) * v.colorFlow) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v.colorFlow]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setPos({
      x: drag.current.x + (e.clientX - drag.current.px),
      y: drag.current.y + (e.clientY - drag.current.py),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const diameter = v.radius * 2;
  const orb = (
    <div
      style={{
        ...shaderFillStyle,
        background: "#000000",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <SWLayerEffectView
          source={source}
          style={{ width: diameter, height: diameter, borderRadius: "50%" }}
          uniforms={{
            uCenter: [v.radius, v.radius],
            uRadius: v.radius,
            uMagnification: v.magnification,
            uRefraction: v.refraction,
            uEdgeHighlight: v.edgeHighlight,
            uDispersion: v.dispersion,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: gradientFill(colors),
              filter: `hue-rotate(${hue}deg)`,
            }}
          />
        </SWLayerEffectView>
      </div>
    </div>
  );

  const fields: SWControlField[] = [
    { kind: "slider", key: "radius", label: "Radius", min: 40, max: 200, step: 1 },
    { kind: "slider", key: "magnification", label: "Magnification", min: 1, max: 3, step: 0.05 },
    { kind: "slider", key: "refraction", label: "Refraction", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "edgeHighlight", label: "Edge Highlight", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "dispersion", label: "Dispersion", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "colorFlow", label: "Color Flow", min: 0, max: 90, step: 1 },
  ];

  if (!showsControls) return orb;
  return (
    <SWShaderControlsSheet title="Glass Orb" values={v} fields={fields} onChange={onChange}>
      {orb}
    </SWShaderControlsSheet>
  );
}
