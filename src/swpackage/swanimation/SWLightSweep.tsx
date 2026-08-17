import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimate } from "motion/react";

export function SWLightSweep({
  lineWidth = 80,
  duration = 1.5,
  lineColor = "rgba(255,255,255,0.6)",
  cornerRadius = 16,
  children,
  className,
  style,
}: {
  lineWidth?: number;
  duration?: number;
  lineColor?: string;
  cornerRadius?: number;
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
        const width = parent?.clientWidth ?? 0;
        await animate(el, { x: [-lineWidth, width] }, { duration, ease: "linear" });
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [animate, duration, lineWidth, scope]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        borderRadius: cornerRadius,
        ...style,
      }}
    >
      {children}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: cornerRadius,
          pointerEvents: "none",
        }}
      >
        <motion.div
          ref={scope}
          style={{
            height: "100%",
            width: lineWidth,
            background: `linear-gradient(to right, transparent, ${lineColor}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
