import { type ReactNode } from "react";
import { LayerShader, useControlState } from "./shaderHost";
import source from "./SWWater.frag?raw";

export function SWWater({
  speed = 1,
  size = 1,
  caustic = 0.1,
  waves = 0.08,
  layering = 0.15,
  edges = 0.3,
  highlights = 0.35,
  colorBack = "#000000",
  colorHighlight = "#ffffff",
  showsControls = false,
  children,
}: {
  speed?: number;
  size?: number;
  caustic?: number;
  waves?: number;
  layering?: number;
  edges?: number;
  highlights?: number;
  colorBack?: string;
  colorHighlight?: string;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    { speed, size, caustic, waves, layering, edges, highlights, colorBack, colorHighlight },
    showsControls,
  );
  return (
    <LayerShader
      source={source}
      title="Water"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uSpeed: v.speed,
        uSize: v.size,
        uCaustic: v.caustic,
        uWaves: v.waves,
        uLayering: v.layering,
        uEdges: v.edges,
        uHighlights: v.highlights,
        uColorBack: v.colorBack,
        uColorHighlight: v.colorHighlight,
      }}
      fields={[
        { kind: "color", key: "colorBack", label: "Back" },
        { kind: "color", key: "colorHighlight", label: "Highlight" },
        { kind: "slider", key: "size", label: "Size", min: 0.01, max: 7, step: 0.01 },
        { kind: "slider", key: "caustic", label: "Caustic", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "waves", label: "Waves", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "layering", label: "Layering", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "edges", label: "Edges", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "highlights", label: "Highlights", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    >
      {children}
    </LayerShader>
  );
}
