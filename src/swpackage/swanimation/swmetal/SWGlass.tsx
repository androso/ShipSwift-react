import { type ReactNode } from "react";
import { LayerShader, rgb3, useControlState } from "./shaderHost";
import source from "./SWGlass.frag?raw";

export const SWGlassShapes = ["circle", "roundedRect"] as const;
export type SWGlassShape = (typeof SWGlassShapes)[number];

function glassDemoBackground(): ReactNode {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 320,
        background:
          "linear-gradient(135deg, #ff9500, #ff2d55, #af52de, #007aff, #5ac8fa)",
      }}
    />
  );
}

export function SWGlass({
  shape = "circle",
  center = { x: 0.5, y: 0.5 },
  scale = 1,
  cornerRadius = 0.12,
  cutout = false,
  refraction = 1,
  edgeSoftness = 0.1,
  blur = 0,
  thickness = 0.2,
  aberration = 0.5,
  innerZoom = 1,
  lightAngle = 300,
  highlight = 0.05,
  highlightColor = "#ffffff",
  highlightSoftness = 0.5,
  fresnel = 0.1,
  fresnelSoftness = 0.1,
  fresnelColor = "#ffffff",
  tintColor = "#ffffff",
  tintIntensity = 0,
  tintPreserveLuminosity = true,
  showsControls = false,
  children,
}: {
  shape?: SWGlassShape;
  center?: { x: number; y: number };
  scale?: number;
  cornerRadius?: number;
  cutout?: boolean;
  refraction?: number;
  edgeSoftness?: number;
  blur?: number;
  thickness?: number;
  aberration?: number;
  innerZoom?: number;
  lightAngle?: number;
  highlight?: number;
  highlightColor?: string;
  highlightSoftness?: number;
  fresnel?: number;
  fresnelSoftness?: number;
  fresnelColor?: string;
  tintColor?: string;
  tintIntensity?: number;
  tintPreserveLuminosity?: boolean;
  showsControls?: boolean;
  children?: ReactNode;
}) {
  const [v, onChange] = useControlState(
    {
      shape,
      centerX: center.x,
      centerY: center.y,
      scale,
      cornerRadius,
      cutout,
      refraction,
      edgeSoftness,
      blur,
      thickness,
      aberration,
      innerZoom,
      lightAngle,
      highlight,
      highlightColor,
      highlightSoftness,
      fresnel,
      fresnelSoftness,
      fresnelColor,
      tintColor,
      tintIntensity,
      tintPreserveLuminosity,
    },
    showsControls,
  );
  const rad = (v.lightAngle * Math.PI) / 180;
  const sh = (SWGlassShapes.includes(v.shape as SWGlassShape) ? v.shape : "circle") as SWGlassShape;
  return (
    <LayerShader
      source={source}
      title="Glass"
      showsControls={showsControls}
      values={v}
      onChange={onChange}
      uniforms={{
        uShape: sh === "roundedRect" ? 1 : 0,
        uCenter: [v.centerX, v.centerY],
        uScale: v.scale,
        uCornerRadius: v.cornerRadius,
        uCutout: v.cutout ? 1 : 0,
        uRefraction: v.refraction,
        uEdgeSoftness: v.edgeSoftness,
        uBlur: v.blur,
        uThickness: v.thickness,
        uAberration: v.aberration,
        uInnerZoom: v.innerZoom,
        uLightDir: [Math.cos(rad), Math.sin(rad)],
        uHighlight: v.highlight,
        uHighlightColor: rgb3(v.highlightColor),
        uHighlightSoftness: v.highlightSoftness,
        uFresnel: v.fresnel,
        uFresnelSoftness: v.fresnelSoftness,
        uFresnelColor: rgb3(v.fresnelColor),
        uTintColor: rgb3(v.tintColor),
        uTintIntensity: v.tintIntensity,
        uTintPreserveLuminosity: v.tintPreserveLuminosity ? 1 : 0,
      }}
      fields={[
        {
          kind: "select",
          key: "shape",
          label: "Shape",
          options: [
            { value: "circle", label: "Circle" },
            { value: "roundedRect", label: "Rounded Rect" },
          ],
        },
        { kind: "toggle", key: "cutout", label: "Cutout" },
        { kind: "slider", key: "centerX", label: "Center X", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "centerY", label: "Center Y", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "scale", label: "Scale", min: 0.3, max: 2, step: 0.01 },
        { kind: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 0.5, step: 0.01 },
        { kind: "slider", key: "refraction", label: "Refraction", min: 0, max: 2, step: 0.01 },
        { kind: "slider", key: "edgeSoftness", label: "Edge Softness", min: 0, max: 0.5, step: 0.01 },
        { kind: "slider", key: "blur", label: "Blur", min: 0, max: 20, step: 0.5 },
        { kind: "slider", key: "thickness", label: "Thickness", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "aberration", label: "Aberration", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "innerZoom", label: "Inner Zoom", min: 0.5, max: 2, step: 0.01 },
        { kind: "slider", key: "lightAngle", label: "Light Angle", min: 0, max: 360, step: 1 },
        { kind: "slider", key: "highlight", label: "Highlight", min: 0, max: 1, step: 0.01 },
        { kind: "color", key: "highlightColor", label: "Highlight Color" },
        { kind: "slider", key: "highlightSoftness", label: "Highlight Softness", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "fresnel", label: "Fresnel", min: 0, max: 1, step: 0.01 },
        { kind: "slider", key: "fresnelSoftness", label: "Fresnel Softness", min: 0, max: 1, step: 0.01 },
        { kind: "color", key: "fresnelColor", label: "Fresnel Color" },
        { kind: "color", key: "tintColor", label: "Tint" },
        { kind: "slider", key: "tintIntensity", label: "Tint Intensity", min: 0, max: 1, step: 0.01 },
        { kind: "toggle", key: "tintPreserveLuminosity", label: "Preserve Luminosity" },
      ]}
    >
      {children ?? (showsControls ? glassDemoBackground() : undefined)}
    </LayerShader>
  );
}
