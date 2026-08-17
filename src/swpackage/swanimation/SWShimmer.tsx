import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimate } from "motion/react";

export function SWShimmer({
  duration = 2,
  delay = 1,
  children,
  className,
  style,
}: {
  duration?: number;
  delay?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [scope, animate] = useAnimate();
  const delayRef = useRef(delay);
  const durationRef = useRef(duration);
  delayRef.current = delay;
  durationRef.current = duration;

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      while (!cancelled) {
        const parent = el.parentElement;
        const width = parent?.clientWidth ?? 0;
        const bandWidth = width * 0.5;
        el.style.width = `${bandWidth}px`;
        await animate(
          el,
          { x: [-bandWidth * 1.5, width + bandWidth] },
          { duration: durationRef.current, ease: "linear", delay: delayRef.current },
        );
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [animate, scope]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      >
        <motion.div
          ref={scope}
          style={{
            height: "100%",
            background:
              "linear-gradient(to bottom right, transparent, transparent, rgba(255,255,255,0.2), transparent, transparent)",
          }}
        />
      </div>
    </div>
  );
}
