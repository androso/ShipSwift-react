import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { addingDays, formatMonthDay, startOfDay } from "@/swpackage/swutil";
import "./swchart.css";

export const DAY_MS = 86_400_000;
export const Y_AXIS_WIDTH = 44;
export const X_AXIS_HEIGHT = 28;
export const PLOT_PAD_TOP = 10;

export type SWInterpolationMethod =
  | "linear"
  | "catmullRom"
  | "stepCenter"
  | "monotone";

export type SWClosedRange = { min: number; max: number };

export type PlotPoint = { x: number; y: number };

export type PlotLayout = {
  totalWidth: number;
  chartHeight: number;
  plotHeight: number;
  pixelsPerDay: number;
  xStart: Date;
  yMin: number;
  yMax: number;
  xAt: (date: Date) => number;
  yAt: (value: number) => number;
  reveal: number;
  clipId: string;
};

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sw-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function seriesColor(
  category: string,
  colorMapping: Record<string, string>,
): string {
  return colorMapping[category] ?? "var(--sw-blue)";
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function chartXDomain(
  scrollableDaysBack: number,
  scrollableDaysForward: number,
): { start: Date; end: Date } {
  const today = startOfToday();
  return {
    start: addingDays(today, -scrollableDaysBack),
    end: addingDays(today, scrollableDaysForward),
  };
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (min === max) {
    const pad = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;
    return niceTicks(min - pad, max + pad, count);
  }
  const span = max - min;
  const step = niceNumber(span / Math.max(1, count - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  const safety = count * 4;
  for (let v = niceMin, i = 0; v <= niceMax + step * 0.5 && i < safety; v += step, i += 1) {
    const rounded = Number(v.toFixed(10));
    if (rounded >= min - step * 0.01 && rounded <= max + step * 0.01) {
      ticks.push(rounded);
    }
  }
  return ticks.length > 0 ? ticks : [min, max];
}

function niceNumber(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(Math.max(Math.abs(range), 1e-9)));
  const frac = range / 10 ** exp;
  let nice: number;
  if (round) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else if (frac <= 1) nice = 1;
  else if (frac <= 2) nice = 2;
  else if (frac <= 5) nice = 5;
  else nice = 10;
  return nice * 10 ** exp;
}

export function formatYTick(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 10000) {
    return `${Math.round(value / 1000)}k`;
  }
  if (Math.abs(value - Math.round(value)) < 1e-6) {
    return String(Math.round(value));
  }
  if (Math.abs(value) < 10) return value.toFixed(1);
  return String(Math.round(value * 10) / 10);
}

export function groupByCategory<T extends { category: string; date: Date }>(
  points: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const point of points) {
    const list = groups.get(point.category) ?? [];
    list.push(point);
    groups.set(point.category, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  return groups;
}

export function categoryOrder(
  points: { category: string }[],
  colorMapping: Record<string, string>,
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const key of Object.keys(colorMapping)) {
    if (!seen.has(key)) {
      seen.add(key);
      order.push(key);
    }
  }
  for (const point of points) {
    if (!seen.has(point.category)) {
      seen.add(point.category);
      order.push(point.category);
    }
  }
  return order;
}

export function seriesPath(
  points: PlotPoint[],
  method: SWInterpolationMethod,
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (method === "catmullRom") return catmullRomPath(points);
  if (method === "stepCenter") return stepCenterPath(points);
  if (method === "monotone") return monotonePath(points);
  return linearPath(points);
}

export function linearPath(points: PlotPoint[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
}

export function catmullRomPath(points: PlotPoint[]): string {
  if (points.length < 2) return linearPath(points);
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function stepCenterPath(points: PlotPoint[]): string {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const mid = (points[i].x + points[i + 1].x) / 2;
    d += ` L ${mid} ${points[i].y} L ${mid} ${points[i + 1].y} L ${points[i + 1].x} ${points[i + 1].y}`;
  }
  return d;
}

function monotonePath(points: PlotPoint[]): string {
  const n = points.length;
  if (n < 3) return linearPath(points);
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = points[i + 1].x - points[i].x;
    m[i] = dx[i] === 0 ? 0 : (points[i + 1].y - points[i].y) / dx[i];
  }
  const d = new Array<number>(n);
  d[0] = m[0];
  d[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    d[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  }
  for (let i = 0; i < n - 1; i += 1) {
    if (Math.abs(m[i]) < 1e-12) {
      d[i] = 0;
      d[i + 1] = 0;
    } else {
      const a = d[i] / m[i];
      const b = d[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        d[i] = t * a * m[i];
        d[i + 1] = t * b * m[i];
      }
    }
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i += 1) {
    const x1 = points[i].x + dx[i] / 3;
    const y1 = points[i].y + (d[i] * dx[i]) / 3;
    const x2 = points[i + 1].x - dx[i] / 3;
    const y2 = points[i + 1].y - (d[i + 1] * dx[i]) / 3;
    path += ` C ${x1} ${y1}, ${x2} ${y2}, ${points[i + 1].x} ${points[i + 1].y}`;
  }
  return path;
}

export function closeAreaPath(top: string, bottomReversed: PlotPoint[]): string {
  if (!top || bottomReversed.length === 0) return "";
  const bottom = bottomReversed
    .map((p) => `L ${p.x} ${p.y}`)
    .join(" ");
  return `${top} ${bottom} Z`;
}

export function useRevealProgress(delayMs = 200, durationMs = 1200): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProgress(1);
      return;
    }
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - started - delayMs;
      if (elapsed <= 0) {
        setProgress(0);
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setProgress(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [delayMs, durationMs]);

  return progress;
}

export function useElementWidth<T extends HTMLElement>(): [
  RefObject<T | null>,
  number,
] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (next: number) => {
      if (next > 0) setWidth(next);
    };
    apply(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      apply(entries[0]?.contentRect.width ?? el.clientWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export function CartesianFrame({
  title,
  chartHeight,
  yDomain,
  categories,
  colorMapping,
  scrollableDaysBack,
  scrollableDaysForward,
  visibleDays,
  initialScroll,
  children,
}: {
  title?: string | null;
  chartHeight: number;
  yDomain: SWClosedRange;
  categories: string[];
  colorMapping: Record<string, string>;
  scrollableDaysBack: number;
  scrollableDaysForward: number;
  visibleDays: number;
  initialScroll: "end" | "center";
  children: (layout: PlotLayout) => ReactNode;
}) {
  const clipId = useId().replace(/:/g, "");
  const reveal = useRevealProgress();
  const [frameRef, frameWidth] = useElementWidth<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const visiblePlotWidth = Math.max(120, frameWidth - Y_AXIS_WIDTH);
  const totalDays = Math.max(1, scrollableDaysBack + scrollableDaysForward);
  const pixelsPerDay = visiblePlotWidth / Math.max(1, visibleDays);
  const totalWidth = pixelsPerDay * totalDays;
  const plotHeight = Math.max(40, chartHeight - X_AXIS_HEIGHT - PLOT_PAD_TOP);
  const { start: xStart } = chartXDomain(scrollableDaysBack, scrollableDaysForward);
  const yMin = yDomain.min;
  const yMax = yDomain.max === yDomain.min ? yDomain.min + 1 : yDomain.max;
  const ticks = niceTicks(yMin, yMax, 5);

  const xAt = (date: Date) =>
    ((date.getTime() - xStart.getTime()) / DAY_MS) * pixelsPerDay;
  const yAt = (value: number) =>
    PLOT_PAD_TOP + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;

  const layout: PlotLayout = {
    totalWidth,
    chartHeight,
    plotHeight,
    pixelsPerDay,
    xStart,
    yMin,
    yMax,
    xAt,
    yAt,
    reveal,
    clipId: `sw-chart-clip-${clipId}`,
  };

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || frameWidth === 0) return;
    const today = startOfToday();
    const offsetDays =
      initialScroll === "center"
        ? visibleDays / 2
        : visibleDays;
    const leftDate = addingDays(today, -offsetDays);
    scroller.scrollLeft = Math.max(0, xAt(leftDate));
  }, [frameWidth, visibleDays, initialScroll, pixelsPerDay, scrollableDaysBack]);

  const dayTicks: Date[] = [];
  for (let i = 0; i <= totalDays; i += 1) {
    dayTicks.push(addingDays(xStart, i));
  }

  return (
    <div className="sw-chart">
      <div className="sw-chart-header">
        {title ? <h3 className="sw-chart-title">{title}</h3> : <span />}
        {categories.length > 0 ? (
          <div className="sw-chart-legend">
            {categories.map((category) => (
              <span key={category} className="sw-chart-legend-item">
                <span
                  className="sw-chart-legend-swatch"
                  style={{ background: seriesColor(category, colorMapping) }}
                />
                {category}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="sw-chart-frame" ref={frameRef} style={{ height: chartHeight }}>
        <div className="sw-chart-yaxis" style={{ height: chartHeight }}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="sw-chart-y-label"
              style={{ top: yAt(tick) }}
            >
              {formatYTick(tick)}
            </span>
          ))}
        </div>
        <div className="sw-chart-scroll" ref={scrollRef}>
          <svg
            width={totalWidth}
            height={chartHeight}
            viewBox={`0 0 ${totalWidth} ${chartHeight}`}
          >
            {ticks.map((tick) => (
              <line
                key={`h-${tick}`}
                x1={0}
                x2={totalWidth}
                y1={yAt(tick)}
                y2={yAt(tick)}
                stroke="var(--sw-separator)"
                strokeWidth={1}
              />
            ))}
            {dayTicks.map((day) => (
              <line
                key={day.toISOString()}
                x1={xAt(day)}
                x2={xAt(day)}
                y1={PLOT_PAD_TOP}
                y2={PLOT_PAD_TOP + plotHeight}
                stroke="var(--sw-separator)"
                strokeWidth={1}
              />
            ))}
            <defs>
              <clipPath id={layout.clipId}>
                <rect
                  x={0}
                  y={0}
                  width={totalWidth * reveal}
                  height={PLOT_PAD_TOP + plotHeight}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${layout.clipId})`}>{children(layout)}</g>
            {dayTicks.map((day) => (
              <text
                key={`label-${day.toISOString()}`}
                x={xAt(day) + pixelsPerDay * 0.5}
                y={chartHeight - 8}
                textAnchor="middle"
                fill="var(--sw-secondary-label)"
                fontSize={11}
              >
                {formatMonthDay(day)}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
