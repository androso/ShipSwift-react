/**
 * Horizontal divider with a center-fade gradient (clear -> color -> clear).
 *
 * Usage:
 *   <SWGradientDivider />
 *   <SWGradientDivider color="var(--sw-purple)" opacity={0.5} />
 *   <SWGradientDivider color="var(--sw-mint)" height={2} />
 */
export function SWGradientDivider({
  color = "var(--sw-cyan)",
  opacity = 0.3,
  height = 1,
}: {
  color?: string;
  opacity?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        height,
        width: "100%",
        background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} ${opacity * 100}%, transparent), transparent)`,
      }}
    />
  );
}
