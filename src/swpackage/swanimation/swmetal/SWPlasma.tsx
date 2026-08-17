import { ColorShader, useControlState } from "./shaderHost";
import solar from "./SWPlasmaSolar.frag?raw";
import prism from "./SWPlasmaPrism.frag?raw";
import spectrum from "./SWPlasmaSpectrum.frag?raw";
import ember from "./SWPlasmaEmber.frag?raw";
import lilac from "./SWPlasmaLilac.frag?raw";

export const SWPlasmaStyles = ["solar", "prism", "spectrum", "ember", "lilac"] as const;
export type SWPlasmaStyle = (typeof SWPlasmaStyles)[number];

const SOURCES: Record<SWPlasmaStyle, string> = {
  solar,
  prism,
  spectrum,
  ember,
  lilac,
};

const PALETTES: Record<SWPlasmaStyle, [string, string, string, string, string]> = {
  solar: ["#1a0500", "#5a1208", "#c44a20", "#f08a3a", "#ffc57a"],
  prism: ["#1a0033", "#7a1fb8", "#ff1493", "#ffd600", "#00e5ff"],
  spectrum: ["#001a66", "#3b0082", "#6a0dad", "#c71585", "#ff8c2e"],
  ember: ["#050000", "#4a0e00", "#c44a0a", "#ffa82e", "#ffe08a"],
  lilac: ["#2a0a4a", "#6b4fa0", "#c499d9", "#f5c6e0", "#ffeeee"],
};

export function SWPlasma({
  style = "solar",
  c1,
  c2,
  c3,
  c4,
  c5,
  scale = 1,
  intensity = 1,
  distortion = 1,
  showsControls = false,
}: {
  style?: SWPlasmaStyle;
  c1?: string;
  c2?: string;
  c3?: string;
  c4?: string;
  c5?: string;
  scale?: number;
  intensity?: number;
  distortion?: number;
  showsControls?: boolean;
}) {
  const palette = PALETTES[style];
  const [v, onChange] = useControlState(
    {
      style,
      c1: c1 ?? palette[0],
      c2: c2 ?? palette[1],
      c3: c3 ?? palette[2],
      c4: c4 ?? palette[3],
      c5: c5 ?? palette[4],
      scale,
      intensity,
      distortion,
    },
    showsControls,
  );
  const handleChange = (key: string, value: string | number | boolean) => {
    if (key === "style" && typeof value === "string") {
      const next = value as SWPlasmaStyle;
      const p = PALETTES[next] ?? palette;
      onChange("style", next);
      onChange("c1", p[0]);
      onChange("c2", p[1]);
      onChange("c3", p[2]);
      onChange("c4", p[3]);
      onChange("c5", p[4]);
      return;
    }
    onChange(key, value);
  };
  const st = (SWPlasmaStyles.includes(v.style as SWPlasmaStyle) ? v.style : "solar") as SWPlasmaStyle;
  return (
    <ColorShader
      source={SOURCES[st]}
      title="Plasma"
      showsControls={showsControls}
      values={v}
      onChange={handleChange}
      uniforms={{
        uC1: v.c1,
        uC2: v.c2,
        uC3: v.c3,
        uC4: v.c4,
        uC5: v.c5,
        uScale: v.scale,
        uIntensity: v.intensity,
        uDistortion: v.distortion,
      }}
      fields={[
        {
          kind: "select",
          key: "style",
          label: "Style",
          options: SWPlasmaStyles.map((s) => ({
            value: s,
            label: s[0]!.toUpperCase() + s.slice(1),
          })),
        },
        { kind: "color", key: "c1", label: "Color 1" },
        { kind: "color", key: "c2", label: "Color 2" },
        { kind: "color", key: "c3", label: "Color 3" },
        { kind: "color", key: "c4", label: "Color 4" },
        { kind: "color", key: "c5", label: "Color 5" },
        { kind: "slider", key: "scale", label: "Scale", min: 0.2, max: 3, step: 0.05 },
        { kind: "slider", key: "intensity", label: "Intensity", min: 0, max: 2.5, step: 0.05 },
        { kind: "slider", key: "distortion", label: "Distortion", min: 0, max: 3, step: 0.05 },
      ]}
    />
  );
}
