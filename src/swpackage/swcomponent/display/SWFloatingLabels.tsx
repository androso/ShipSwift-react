/**
 * Displays an image with animated floating capsule labels that fade in
 * and out at specified positions around the image. Useful for showcasing
 * feature callouts, AI analysis results, or point-of-interest annotations.
 *
 * Usage:
 *   <SWFloatingLabels
 *     image="/demo/face-picture.png"
 *     labels={[
 *       { text: "Teeth mapping", position: { x: 0.3, y: 0.5 } },
 *     ]}
 *   />
 */
import { useEffect, useState } from "react";

export type SWFloatingLabelItem = {
  text: string;
  /** Normalized position 0-1 where 0.5 is center. */
  position: { x: number; y: number };
};

export function SWFloatingLabels({
  image = "/demo/face-picture.png",
  size = 360,
  cornerRadius = 24,
  cycleDuration = 3,
  labels = [],
}: {
  image?: string;
  size?: number;
  cornerRadius?: number;
  cycleDuration?: number;
  labels?: SWFloatingLabelItem[];
}) {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setCycle(((t % cycleDuration) + cycleDuration) % cycleDuration);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [cycleDuration]);

  const borderOpacity = cycle < 0.5 ? cycle * 2 : 1;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <img
        src={image}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: cornerRadius,
          display: "block",
          boxShadow: `inset 0 0 0 2px color-mix(in srgb, var(--sw-cyan) ${borderOpacity * 80}%, transparent)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: cornerRadius,
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 2px color-mix(in srgb, var(--sw-blue) ${borderOpacity * 60}%, transparent)`,
        }}
      />
      {labels.map((label, index) => {
        const delay = index * 0.3;
        let labelCycle = (cycle - delay) % cycleDuration;
        if (labelCycle < 0) labelCycle += cycleDuration;
        const opacity =
          labelCycle > 0.5 && labelCycle < cycleDuration - 0.5 ? 1 : 0;
        return (
          <span
            key={`${label.text}-${index}`}
            className="sw-ultra-thin"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${(label.position.x - 0.5) * (size * 0.78)}px, ${(label.position.y - 0.5) * (size * 0.78)}px) scale(${opacity > 0 ? 1 : 0.8})`,
              opacity,
              transition: "opacity 0.3s ease, transform 0.3s ease",
              color: "#fff",
              fontSize: 13,
              padding: "6px 12px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              background: "rgba(20,20,20,0.35)",
            }}
          >
            {label.text}
          </span>
        );
      })}
    </div>
  );
}
