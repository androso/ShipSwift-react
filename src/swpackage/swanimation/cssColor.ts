import { parseCssColor } from "@/swpackage/swutil";

export function cssRgba(input: string, opacity?: number): string {
  const c = parseCssColor(input);
  const a = opacity === undefined ? c[3] : opacity;
  return `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
}

export function rgbTuple(input: string): [number, number, number] {
  const c = parseCssColor(input);
  return [c[0], c[1], c[2]];
}
