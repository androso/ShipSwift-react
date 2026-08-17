import { useEffect, useState, type ReactNode } from "react";
import "./swchart.css";

export type SWRingChartDataPoint = {
  id?: string;
  label: string;
  value: number;
  color: string;
};

export type SWRingChartProps = {
  data: SWRingChartDataPoint[];
  maxValue?: number;
  size?: number;
  ringWidth?: number;
  spacing?: number;
  children?: ReactNode;
};

export function SWRingChart({
  data,
  maxValue = 100,
  size = 250,
  ringWidth = 25,
  spacing = 10,
  children,
}: SWRingChartProps) {
  const [animated, setAnimated] = useState(() => data.map(() => 0));

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setAnimated(data.map((item) => item.value));
      return;
    }
    setAnimated(data.map(() => 0));
    const delay = 200;
    const duration = 1200;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - started - delay;
      if (elapsed <= 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) ** 3;
      setAnimated(data.map((item) => item.value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data]);

  return (
    <div className="sw-ring">
      <div className="sw-ring-stage" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const ringIndex = data.length - 1 - index;
            const ringSize = size - ringIndex * (ringWidth + spacing) * 2;
            const r = ringSize / 2;
            const cx = size / 2;
            const cy = size / 2;
            const c = 2 * Math.PI * r;
            const value = animated[index] ?? 0;
            const offset = c * (1 - Math.min(1, Math.max(0, value / maxValue)));
            return (
              <g key={item.id ?? item.label}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={item.color}
                  strokeOpacity={0.15}
                  strokeWidth={ringWidth}
                  strokeLinecap="round"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={ringWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${c} ${c}`}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              </g>
            );
          })}
        </svg>
        {children ? <div className="sw-ring-center">{children}</div> : null}
      </div>
      <div className="sw-ring-legend">
        {data.map((item) => (
          <div key={item.id ?? item.label} className="sw-ring-legend-item">
            <span
              className="sw-radar-bullet-mark"
              style={{ background: item.color }}
            />
            <span>{item.label}</span>
            <strong>{Math.round(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
