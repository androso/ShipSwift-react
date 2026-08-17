import { useEffect, useId, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

export function SWFullScreenButton({
  title = "ShipSwift",
  subtitle = "Fullstack AI toolkit",
  footer = "FullScreenCard",
  compactSize = { width: 300, height: 300 },
  gradientColors = ["#a2845e", "#ffffff"],
  cornerRadius = 30,
  className,
  style,
}: {
  title?: string;
  subtitle?: string;
  footer?: string;
  compactSize?: { width: number; height: number };
  gradientColors?: string[];
  cornerRadius?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const layoutId = useId();
  const [expanded, setExpanded] = useState(false);
  const gradient = `linear-gradient(to bottom, ${gradientColors.join(", ")})`;

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const card = (isExpanded: boolean) => (
    <motion.div
      layoutId={layoutId}
      role={isExpanded ? "dialog" : "button"}
      tabIndex={0}
      onClick={() => setExpanded(!isExpanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded(!isExpanded);
        }
      }}
      className={isExpanded ? undefined : className}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: gradient,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: isExpanded ? "none" : "0 12px 40px rgba(0,0,0,0.28)",
        ...(isExpanded
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 80,
              width: "100vw",
              height: "100dvh",
              borderRadius: 0,
            }
          : {
              width: compactSize.width,
              height: compactSize.height,
              borderRadius: cornerRadius,
              ...style,
            }),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: 16,
          paddingTop: isExpanded ? 100 : 20,
          paddingBottom: isExpanded ? 100 : 20,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700 }}>{title}</div>
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "color-mix(in srgb, var(--sw-accent) 85%, white)",
            filter: "brightness(1.1)",
          }}
        >
          {footer}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {!expanded && card(false)}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>{expanded && card(true)}</AnimatePresence>,
          document.body,
        )}
    </>
  );
}
