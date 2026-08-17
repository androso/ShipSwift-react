import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion, useAnimate } from "motion/react";
import { demoSrc } from "./demoSrc";

export function SWShakingIcon({
  image,
  height = 80,
  cornerRadius = 0,
  idleDelay = 1.5,
  className,
  style,
}: {
  image: string | ReactNode;
  height?: number;
  cornerRadius?: number;
  idleDelay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let cancelled = false;
    const loop = async () => {
      while (!cancelled) {
        await animate(el, { scale: 1, rotate: 10 }, { duration: 0.01, ease: "easeInOut" });
        if (cancelled) return;
        await animate(
          el,
          { scale: 1.1, rotate: 10 },
          { duration: 0.2, delay: idleDelay, ease: "easeInOut" },
        );
        if (cancelled) return;
        await animate(el, { rotate: 12 }, { duration: 0.08, ease: "easeInOut" });
        await animate(el, { rotate: 8 }, { duration: 0.08, ease: "easeInOut" });
        await animate(el, { rotate: 15 }, { duration: 0.08, ease: "easeInOut" });
        await animate(el, { rotate: 5 }, { duration: 0.08, ease: "easeInOut" });
        await animate(el, { rotate: 12 }, { duration: 0.08, ease: "easeInOut" });
        await animate(el, { rotate: 8 }, { duration: 0.08, ease: "easeInOut" });
        if (cancelled) return;
        await animate(el, { scale: 1, rotate: 10 }, { duration: 0.2, ease: "easeInOut" });
      }
    };
    void loop();
    return () => {
      cancelled = true;
    };
  }, [animate, idleDelay, scope]);

  const visual =
    typeof image === "string" ? (
      <img
        src={demoSrc(image)}
        alt=""
        style={{
          height,
          width: "auto",
          objectFit: "contain",
          borderRadius: cornerRadius,
          display: "block",
        }}
      />
    ) : (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {image}
      </div>
    );

  return (
    <motion.div
      ref={scope}
      className={className}
      style={{
        display: "inline-flex",
        transformOrigin: "center",
        ...style,
      }}
    >
      {visual}
    </motion.div>
  );
}
