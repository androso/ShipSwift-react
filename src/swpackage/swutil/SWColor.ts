export type SWColor = [number, number, number, number];

const NAMED: Record<string, SWColor> = {
  white: [1, 1, 1, 1],
  black: [0, 0, 0, 1],
  red: [1, 0.231, 0.188, 1],
  green: [0.204, 0.78, 0.349, 1],
  blue: [0, 0.478, 1, 1],
  orange: [1, 0.584, 0, 1],
  yellow: [1, 0.8, 0, 1],
  pink: [1, 0.176, 0.333, 1],
  purple: [0.686, 0.322, 0.871, 1],
  cyan: [0.196, 0.678, 0.902, 1],
  teal: [0.353, 0.784, 0.98, 1],
  mint: [0, 0.78, 0.745, 1],
  indigo: [0.345, 0.337, 0.839, 1],
  brown: [0.635, 0.518, 0.369, 1],
  accent: [49 / 255, 70 / 255, 62 / 255, 1],
};

export function parseCssColor(input: string | SWColor): SWColor {
  if (Array.isArray(input)) return input;
  const trimmed = input.trim().toLowerCase();
  if (NAMED[trimmed]) return NAMED[trimmed];
  const hex = trimmed.replace("#", "");
  if (hex.length === 3 || hex.length === 4) {
    const r = parseInt(hex[0] + hex[0], 16) / 255;
    const g = parseInt(hex[1] + hex[1], 16) / 255;
    const b = parseInt(hex[2] + hex[2], 16) / 255;
    const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
    return [r, g, b, a];
  }
  if (hex.length === 6 || hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  const rgb = trimmed.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/,
  );
  if (rgb) {
    const r = Number(rgb[1]) > 1 ? Number(rgb[1]) / 255 : Number(rgb[1]);
    const g = Number(rgb[2]) > 1 ? Number(rgb[2]) / 255 : Number(rgb[2]);
    const b = Number(rgb[3]) > 1 ? Number(rgb[3]) / 255 : Number(rgb[3]);
    const a = rgb[4] !== undefined ? Number(rgb[4]) : 1;
    return [r, g, b, a];
  }
  return [1, 1, 1, 1];
}

export function colorToCss(c: SWColor): string {
  return `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3]})`;
}
