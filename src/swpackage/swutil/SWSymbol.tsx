import type { CSSProperties } from "react";

const ICONS: Record<string, string> = {
  sparkles:
    "M12 2l1.2 4.8L18 8l-4.8 1.2L12 14l-1.2-4.8L6 8l4.8-1.2zM18 14l.7 2.8L21.5 17.5 18.7 18.2 18 21l-.7-2.8L14.5 17.5l2.8-.7z",
  "slider.horizontal.3": "M4 8h16M4 12h16M4 16h16M8 6v4m6 0v4m-4 0v4",
  "apple.logo":
    "M16 7c1.5-2 4-2 4-2s-.2 3-2 4.5C16.5 11 15 11 14 10c-1.5 2.5-4 6-4 9 0 3 2 4 4 4s3-1 4-3c1 2 3 3 5 2-2-3-1-7 1-10-2 0-4-2-4-5 0-1 .5-3 .5-3S15.5 5 16 7zM12 4c.5-1.5 2-3 2-3s-2 .2-3 2C10 4.5 10 6 11 6c0-1 .5-2 1-2z",
  "wand.and.stars": "M4 20l8-8M14 6l4 4M15 3v3M21 9h-3M19 4l-2 2M8 15l2 2",
  swift: "M4 16c6-2 10-8 14-12-2 6-2 10 2 14-6-1-11 0-16-2z",
};

export function SWSymbol({
  name,
  size = 18,
  color = "currentColor",
  style,
  className,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const d = ICONS[name] ?? ICONS[name.replace(".fill", "")] ?? ICONS.sparkles;
  const fill = name.includes(".fill") || name === "apple.logo" ? color : "none";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill === "none" ? "none" : color}
      stroke={color}
      strokeWidth={fill === "none" ? 1.7 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
