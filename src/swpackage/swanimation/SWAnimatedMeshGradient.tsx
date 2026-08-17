import type { CSSProperties } from "react";
import { SWShaderView } from "@/swpackage/swutil";
import source from "./SWAnimatedMeshGradient.frag?raw";

const DEFAULT_A = [
  "rgba(88,86,214,0.9)",
  "rgba(0,122,255,0.85)",
  "rgba(50,173,230,0.8)",
  "rgba(0,122,255,0.85)",
  "rgba(88,86,214,0.9)",
  "rgba(0,122,255,0.85)",
  "rgba(50,173,230,0.8)",
  "rgba(0,122,255,0.85)",
  "rgba(88,86,214,0.9)",
];

const DEFAULT_B = [
  "rgba(50,173,230,0.8)",
  "rgba(88,86,214,0.9)",
  "rgba(0,122,255,0.85)",
  "rgba(88,86,214,0.85)",
  "rgba(0,122,255,0.9)",
  "rgba(50,173,230,0.85)",
  "rgba(0,122,255,0.85)",
  "rgba(50,173,230,0.8)",
  "rgba(88,86,214,0.9)",
];

function pad9(colors: string[] | undefined, fallback: string[]): string[] {
  const src = colors && colors.length ? colors : fallback;
  const out = [...src];
  while (out.length < 9) out.push(out[out.length - 1] ?? fallback[0]!);
  return out.slice(0, 9);
}

export function SWAnimatedMeshGradient({
  paletteA,
  paletteB,
  duration = 5,
  className,
  style,
}: {
  paletteA?: string[];
  paletteB?: string[];
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const a = pad9(paletteA, DEFAULT_A);
  const b = pad9(paletteB, DEFAULT_B);
  const uniforms: Record<string, string | number> = { uDuration: duration };
  for (let i = 0; i < 9; i++) {
    uniforms[`uA${i}`] = a[i]!;
    uniforms[`uB${i}`] = b[i]!;
  }

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 220, ...style }}
    >
      <SWShaderView source={source} uniforms={uniforms} />
    </div>
  );
}
