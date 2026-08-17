import { ColorShader, padColors, useControlState } from "./shaderHost";
import clusterSource from "./SWMetaballs.frag?raw";
import fountainSource from "./SWMetaballsFountain.frag?raw";

export const SWMetaballsStyles = ["cluster", "fountain"] as const;
export type SWMetaballsStyle = (typeof SWMetaballsStyles)[number];

const DEFAULT_COLORS = ["#ff0000", "#00ff00", "#ffffff", "#ffff00", "#0000ff", "#30c8c8", "#800080"];

export function SWMetaballs({
  style = "cluster",
  colors = DEFAULT_COLORS,
  background = "#000000",
  speed = 1,
  count = 8,
  size = 0.8,
  bigSize = 0.85,
  showsControls = false,
}: {
  style?: SWMetaballsStyle;
  colors?: string[];
  background?: string;
  speed?: number;
  count?: number;
  size?: number;
  bigSize?: number;
  showsControls?: boolean;
}) {
  const slots = padColors(colors, 8, "#00000000");
  const [v, onChange] = useControlState(
    {
      style,
      background,
      speed,
      count,
      size,
      bigSize,
      c1: slots[0]!,
      c2: slots[1]!,
      c3: slots[2]!,
      c4: slots[3]!,
      c5: slots[4]!,
      c6: slots[5]!,
      c7: slots[6]!,
      c8: slots[7]!,
    },
    showsControls,
  );
  const colorsCount = Math.max(1, Math.min(colors.length, 8));
  const fountain = v.style === "fountain";
  return (
    <ColorShader
      source={fountain ? fountainSource : clusterSource}
      title="Metaballs"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uInColor: v.background,
        uSpeed: v.speed,
        uCount: v.count,
        uSize: v.size,
        uColorsCount: colorsCount,
        uColor1: v.c1,
        uColor2: v.c2,
        uColor3: v.c3,
        uColor4: v.c4,
        uColor5: v.c5,
        uColor6: v.c6,
        uColor7: v.c7,
        uColor8: v.c8,
        uBackground: v.background,
        ...(fountain ? { uBigSize: v.bigSize } : {}),
      }}
      fields={[
        {
          kind: "select",
          key: "style",
          label: "Style",
          options: [
            { value: "cluster", label: "Cluster" },
            { value: "fountain", label: "Fountain" },
          ],
        },
        { kind: "color", key: "background", label: "Background" },
        { kind: "color", key: "c1", label: "Color 1" },
        { kind: "color", key: "c2", label: "Color 2" },
        { kind: "color", key: "c3", label: "Color 3" },
        { kind: "slider", key: "count", label: "Count", min: 1, max: fountain ? 99 : 8, step: 1 },
        { kind: "slider", key: "size", label: "Size", min: 0, max: 1, step: 0.01 },
        ...(fountain
          ? ([{ kind: "slider" as const, key: "bigSize", label: "Big Ball Size", min: 0, max: 1, step: 0.01 }] as const)
          : []),
        { kind: "slider", key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
