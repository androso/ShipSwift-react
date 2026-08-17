import { useEffect, useState } from "react";
import "./swchart.css";

export type SWRadarChartDataPoint = {
  id?: string;
  label: string;
  value: number;
};

export type SWRadarChartProps = {
  data: SWRadarChartDataPoint[];
  maxValue?: number;
  showLabels?: boolean;
};

export function SWRadarChart({
  data,
  maxValue = 100,
  showLabels = true,
}: SWRadarChartProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 1200);
      setProgress(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data]);

  if (data.length === 0) return null;

  const width = 300;
  const height = 300;
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const radiusFactor = showLabels ? 0.55 : 0.8;
  const radius = (size / 2) * radiusFactor;
  const step = (Math.PI * 2) / data.length;
  const rings = [20, 40, 60, 80, 100];

  const pointAt = (index: number, ratio: number) => {
    const angle = step * index - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const ringPath = (level: number) => {
    const ratio = level / maxValue;
    return data
      .map((_, i) => {
        const p = pointAt(i, ratio);
        return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
      })
      .join(" ") + " Z";
  };

  const dataPath = data
    .map((point, i) => {
      const ratio = (point.value / maxValue) * progress;
      const p = pointAt(i, ratio);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    })
    .join(" ") + " Z";

  return (
    <svg
      className="sw-radar"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      {rings.map((level) => (
        <path
          key={level}
          d={ringPath(level)}
          fill="none"
          stroke="color-mix(in srgb, var(--sw-secondary-label) 30%, transparent)"
          strokeWidth={level === 100 ? 1.5 : 1}
          strokeDasharray={level === 100 ? undefined : "4 4"}
        />
      ))}
      {data.map((_, index) => {
        const end = pointAt(index, 1);
        return (
          <line
            key={`spoke-${index}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="color-mix(in srgb, var(--sw-secondary-label) 30%, transparent)"
            strokeWidth={1}
          />
        );
      })}
      <path d={dataPath} fill="color-mix(in srgb, var(--sw-accent) 20%, transparent)" />
      <path
        d={dataPath}
        fill="none"
        stroke="var(--sw-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {showLabels
        ? data.map((point, index) => {
            const p = pointAt(index, 1.3);
            return (
              <foreignObject
                key={point.id ?? point.label}
                x={p.x - 48}
                y={p.y - 22}
                width={96}
                height={44}
              >
                <div className="sw-radar-label">
                  <div className="sw-radar-bullet">
                    <span className="sw-radar-bullet-mark" />
                    {point.label}
                  </div>
                  <strong style={{ fontSize: 13 }}>{Math.round(point.value)}</strong>
                </div>
              </foreignObject>
            );
          })
        : null}
    </svg>
  );
}
