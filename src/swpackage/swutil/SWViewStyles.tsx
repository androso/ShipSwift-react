import type { CSSProperties, ReactNode } from "react";

export function SWButton({
  children,
  variant = "primary",
  showBorder = false,
  cornerRadius = 16,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  showBorder?: boolean;
  cornerRadius?: number;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const className = [
    "sw-btn",
    variant === "primary" ? "sw-btn-primary" : "sw-btn-secondary",
    showBorder ? (variant === "primary" ? "sw-btn-border-primary" : "sw-btn-border-secondary") : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={{ borderRadius: cornerRadius }}
    >
      {children}
    </button>
  );
}

export function SWCard({
  children,
  strokeColor = "var(--sw-accent)",
  background = "color-mix(in srgb, #fff 10%, transparent)",
  cornerRadius = 16,
  padding = 16,
  strokeWidth = 0.6,
  style,
  className,
}: {
  children: ReactNode;
  strokeColor?: string;
  background?: string;
  cornerRadius?: number;
  padding?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={["sw-card", className].filter(Boolean).join(" ")}
      style={
        {
          padding,
          borderRadius: cornerRadius,
          background,
          ["--sw-accent" as string]: strokeColor,
          borderWidth: strokeWidth,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
