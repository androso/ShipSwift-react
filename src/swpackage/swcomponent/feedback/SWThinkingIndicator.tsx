/**
 * Animated thinking/typing indicator with three bouncing dots.
 * Commonly used in chat interfaces to show that the AI or remote user is typing.
 *
 * Usage:
 *   <SWThinkingIndicator />
 *   <SWThinkingIndicator dotSize={8} dotColor="var(--sw-blue)" spacing={5} />
 */
import { useEffect, useState } from "react";

export function SWThinkingIndicator({
  dotSize = 5,
  dotColor = "var(--sw-secondary-label)",
  spacing = 3,
}: {
  /** Diameter of each dot (default: 5). */
  dotSize?: number;
  /** Fill color of the dots (default: secondary label). */
  dotColor?: string;
  /** Horizontal spacing between dots (default: 3). */
  spacing?: number;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((current) => (current + 1) % 3);
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: spacing,
        height: dotSize * 2,
      }}
      aria-hidden
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: dotColor,
            display: "block",
            transform: `translateY(${phase === index ? -(dotSize * 0.6) : 0}px)`,
            transition: "transform 0.2s ease-in-out",
          }}
        />
      ))}
    </span>
  );
}
