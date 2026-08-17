/**
 * Dashboard KPI card with icon, title, value, and a customizable trailing slot.
 * Designed for revenue dashboards, analytics summaries, and admin panels.
 *
 * Usage:
 *   <SWKPICard title="Today's Revenue" value="$1,234" icon="dollarsign.circle.fill" tint="var(--sw-brown)">
 *     <SWKPIDeltaTag delta={12.5} />
 *   </SWKPICard>
 */
import type { ReactNode } from "react";
import { SWSymbol } from "@/swpackage/swutil";

export function SWKPICard({
  title,
  value,
  icon,
  tint,
  trailing,
  children,
}: {
  /** Card title, rendered in caption.secondary above the value. */
  title: string;
  /** Pre-formatted metric value (e.g. "$1,234", "1.2K", "42 cups"). */
  value: string;
  /** SF Symbol name displayed alongside the title. */
  icon: string;
  /** Tint color used for the icon, value text, and outer stroke. */
  tint: string;
  /** Trailing slot rendered below the value (delta tags, unit labels, etc.). */
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "var(--sw-surface)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        border: `1px solid color-mix(in srgb, ${tint} 15%, transparent)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
        }}
      >
        <SWSymbol name={icon} size={12} color={tint} />
        <span
          style={{
            fontSize: 12,
            color: "var(--sw-secondary-label)",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: tint,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {trailing ?? children}
    </div>
  );
}

/**
 * Period-over-period delta indicator designed to drop into a `SWKPICard`
 * trailing slot. Renders an up/down arrow plus the signed percentage.
 * When `delta` is `null` / `undefined`, it degrades to a "No data" placeholder.
 */
export function SWKPIDeltaTag({
  delta,
  comparisonLabel = "vs yesterday",
  upColor = "var(--sw-green)",
  downColor = "var(--sw-red)",
  emptyLabel = "No data",
}: {
  /** Signed percentage change. `null` triggers the "No data" placeholder. */
  delta: number | null | undefined;
  /** Label appended after the formatted percentage. */
  comparisonLabel?: string;
  upColor?: string;
  downColor?: string;
  emptyLabel?: string;
}) {
  if (delta == null) {
    return (
      <span style={{ fontSize: 11, color: "var(--sw-secondary-label)" }}>
        {emptyLabel}
      </span>
    );
  }
  const isUp = delta >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: isUp ? upColor : downColor,
      }}
    >
      <SWSymbol
        name={isUp ? "arrow.up.right" : "arrow.down.right"}
        size={11}
        color={isUp ? upColor : downColor}
      />
      {`${isUp ? "+" : ""}${delta.toFixed(1)}% ${comparisonLabel}`}
    </span>
  );
}
