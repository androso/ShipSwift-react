/**
 * Text label with a colored capsule bullet point indicator.
 * Accepts any React children, displayed to the right of the bullet.
 *
 * Usage:
 *   <SWBulletPointText bulletColor="var(--sw-blue)">Wealth</SWBulletPointText>
 */
import type { ReactNode } from "react";

export function SWBulletPointText({
  bulletColor,
  children,
}: {
  bulletColor: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 15,
      }}
    >
      <span
        style={{
          width: 4,
          height: 12,
          borderRadius: 999,
          background: bulletColor,
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  );
}
