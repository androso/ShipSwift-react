import { type ReactNode } from "react";
import type { SWControlField } from "@/swpackage/swutil";
import { LayerShader, useControlState } from "./shaderHost";
import dotsSource from "./SWHalftoneDots.frag?raw";
import cmykSource from "./SWHalftoneCmyk.frag?raw";

export const SWHalftoneStyles = [
  "dotsClassic",
  "dotsGooey",
  "dotsHoles",
  "dotsSoft",
  "cmyk",
] as const;
export type SWHalftoneStyle = (typeof SWHalftoneStyles)[number];

export const SWHalftoneGrids = ["square", "hex"] as const;
export type SWHalftoneGrid = (typeof SWHalftoneGrids)[number];

const TYPE_INDEX: Record<SWHalftoneStyle, number> = {
  dotsClassic: 0,
  dotsGooey: 1,
  dotsHoles: 2,
  dotsSoft: 3,
  cmyk: 0,
};

export function SWHalftone({
  style = "dotsGooey",
  grid = "square",
  size = 0.5,
  radius = 1,
  contrast = 0.5,
  inverted = false,
  originalColors = false,
  grainMixer = 0,
  grainOverlay = 0,
  grainSize = 0.5,
  colorFront = "#000000",
  colorBack = "#ffffff",
  colorC = "#00aef0",
  colorM = "#ec008c",
  colorY = "#fff200",
  colorK = "#000000",
  showsControls = false,
  children,
}: {
  style?: SWHalftoneStyle;
  grid?: SWHalftoneGrid;
  size?: number;
  radius?: number;
  contrast?: number;
  inverted?: boolean;
  originalColors?: boolean;
  grainMixer?: number;
  grainOverlay?: number;
  grainSize?: number;
  colorFront?: string;
  colorBack?: string;
  colorC?: string;
  colorM?: string;
  colorY?: string;
  colorK?: string;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    {
      style,
      grid,
      size,
      radius,
      contrast,
      inverted,
      originalColors,
      grainMixer,
      grainOverlay,
      grainSize,
      colorFront,
      colorBack,
      colorC,
      colorM,
      colorY,
      colorK,
    },
    showsControls,
  );
  const st = (
    SWHalftoneStyles.includes(v.style as SWHalftoneStyle) ? v.style : "dotsGooey"
  ) as SWHalftoneStyle;
  const isDots = st !== "cmyk";
  const fields: SWControlField[] = [
    {
      kind: "select",
      key: "style",
      label: "Style",
      options: [
        { value: "dotsClassic", label: "Classic" },
        { value: "dotsGooey", label: "Gooey" },
        { value: "dotsHoles", label: "Holes" },
        { value: "dotsSoft", label: "Soft" },
        { value: "cmyk", label: "CMYK" },
      ],
    },
    { kind: "slider", key: "size", label: "Size", min: 0, max: 1, step: 0.01 },
    { kind: "slider", key: "contrast", label: "Contrast", min: 0, max: 1, step: 0.01 },
  ];
  if (isDots) {
    fields.splice(
      1,
      0,
      {
        kind: "select",
        key: "grid",
        label: "Grid",
        options: [
          { value: "square", label: "Square" },
          { value: "hex", label: "Hex" },
        ],
      },
      { kind: "toggle", key: "inverted", label: "Inverted" },
      { kind: "toggle", key: "originalColors", label: "Original Colors" },
    );
    fields.push(
      { kind: "color", key: "colorFront", label: "Front" },
      { kind: "color", key: "colorBack", label: "Back" },
      { kind: "slider", key: "radius", label: "Radius", min: 0, max: 2, step: 0.01 },
      { kind: "slider", key: "grainMixer", label: "Mixer", min: 0, max: 1, step: 0.01 },
      { kind: "slider", key: "grainOverlay", label: "Overlay", min: 0, max: 1, step: 0.01 },
      { kind: "slider", key: "grainSize", label: "Grain Size", min: 0, max: 1, step: 0.01 },
    );
  } else {
    fields.push(
      { kind: "color", key: "colorC", label: "Cyan" },
      { kind: "color", key: "colorM", label: "Magenta" },
      { kind: "color", key: "colorY", label: "Yellow" },
      { kind: "color", key: "colorK", label: "Black" },
      { kind: "color", key: "colorBack", label: "Paper" },
    );
  }
  return (
    <LayerShader
      source={isDots ? dotsSource : cmykSource}
      title="Halftone"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={
        isDots
          ? {
              uType: TYPE_INDEX[st],
              uGrid: v.grid === "hex" ? 1 : 0,
              uSize: v.size,
              uRadius: v.radius,
              uContrast: v.contrast,
              uInverted: v.inverted ? 1 : 0,
              uOriginalColors: v.originalColors ? 1 : 0,
              uGrainMixer: v.grainMixer,
              uGrainOverlay: v.grainOverlay,
              uGrainSize: v.grainSize,
              uColorFront: v.colorFront,
              uColorBack: v.colorBack,
            }
          : {
              uSize: v.size,
              uContrast: v.contrast,
              uColorBack: v.colorBack,
              uColorC: v.colorC,
              uColorM: v.colorM,
              uColorY: v.colorY,
              uColorK: v.colorK,
            }
      }
      fields={fields}
    >
      {children}
    </LayerShader>
  );
}
