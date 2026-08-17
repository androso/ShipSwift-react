import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimate } from "motion/react";

export function SWGlowSweep({
  baseColor = "#8e8e93",
  glowColor = "#ffffff",
  duration = 2,
  bandWidth = 150,
  children,
  className,
  style,
}: {
  baseColor?: string;
  glowColor?: string;
  duration?: number;
  bandWidth?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        const parent = el.parentElement;
        const total = parent?.clientWidth ?? 0;
        await animate(
          el,
          { x: [-total / 2 - bandWidth, total / 2 + bandWidth] },
          { duration, ease: "linear" },
        );
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [animate, bandWidth, duration, scope]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", ...style }}>
      <div style={{ visibility: "hidden" }}>{children}</div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          color: baseColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "inherit", position: "relative", zIndex: 0 }}>{children}</div>
        <motion.div
          ref={scope}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: bandWidth,
            background: `linear-gradient(to right, transparent, ${glowColor}, transparent)`,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
}
