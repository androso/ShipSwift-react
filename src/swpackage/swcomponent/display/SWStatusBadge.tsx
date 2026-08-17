/**
 * Capsule-shaped status badge with five preset semantic styles. Designed for
 * list rows, headers, and detail screens where a short status label needs to
 * pop visually without dominating the layout.
 *
 * Usage:
 *   <SWStatusBadge text="In Stock" style="success" />
 *   <SWStatusBadge text="Pending Review" style="warning" />
 */
export type SWStatusBadgeStyle = "info" | "success" | "warning" | "error" | "neutral";

const TINT: Record<SWStatusBadgeStyle, string> = {
  info: "var(--sw-blue)",
  success: "var(--sw-green)",
  warning: "var(--sw-orange)",
  error: "var(--sw-red)",
  neutral: "var(--sw-secondary-label)",
};

export function SWStatusBadge({
  text,
  style,
}: {
  text: string;
  style: SWStatusBadgeStyle;
}) {
  const tint = TINT[style];
  const backgroundOpacity = style === "success" ? 0.2 : 0.18;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        color: tint,
        background: `color-mix(in srgb, ${tint} ${backgroundOpacity * 100}%, transparent)`,
        boxShadow: `inset 0 0 0 0.5px color-mix(in srgb, ${tint} 35%, transparent)`,
      }}
    >
      {text}
    </span>
  );
}
