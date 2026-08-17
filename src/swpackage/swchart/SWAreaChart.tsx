import { startOfDay } from "@/swpackage/swutil";
import {
  CartesianFrame,
  categoryOrder,
  closeAreaPath,
  groupByCategory,
  seriesColor,
  seriesPath,
  type PlotPoint,
  type SWClosedRange,
  type SWInterpolationMethod,
} from "./chartShared";

export type SWAreaStackMode = "standard" | "stacked";

export type SWAreaChartDataPoint = {
  id?: string;
  date: Date;
  value: number;
  category: string;
};

export type SWAreaChartProps = {
  dataPoints: SWAreaChartDataPoint[];
  colorMapping: Record<string, string>;
  stackMode?: SWAreaStackMode;
  showLineOverlay?: boolean;
  interpolationMethod?: SWInterpolationMethod;
  gradientOpacity?: number;
  yDomain?: SWClosedRange | null;
  scrollableDaysBack?: number;
  scrollableDaysForward?: number;
  visibleDays?: number;
  chartHeight?: number;
  title?: string | null;
};

export function SWAreaChart({
  dataPoints,
  colorMapping,
  stackMode = "standard",
  showLineOverlay = true,
  interpolationMethod = "catmullRom",
  gradientOpacity = 0.15,
  yDomain = null,
  scrollableDaysBack = 30,
  scrollableDaysForward = 7,
  visibleDays = 7,
  chartHeight = 200,
  title = null,
}: SWAreaChartProps) {
  const categories = categoryOrder(dataPoints, colorMapping);
  const grouped = groupByCategory(dataPoints);
  const effectiveYDomain = resolveAreaYDomain(dataPoints, stackMode, yDomain);

  return (
    <CartesianFrame
      title={title}
      chartHeight={chartHeight}
      yDomain={effectiveYDomain}
      categories={categories}
      colorMapping={colorMapping}
      scrollableDaysBack={scrollableDaysBack}
      scrollableDaysForward={scrollableDaysForward}
      visibleDays={visibleDays}
      initialScroll="end"
    >
      {(layout) => {
        const stacked = stackMode === "stacked" ? stackedSeries(categories, grouped, layout) : null;
        return (
          <>
            {categories.map((category) => {
              const color = seriesColor(category, colorMapping);
              if (stacked) {
                const band = stacked.get(category);
                if (!band) return null;
                const topPath = seriesPath(band.top, interpolationMethod);
                const area = closeAreaPath(topPath, [...band.bottom].reverse());
                return (
                  <g key={category}>
                    <path d={area} fill={color} opacity={gradientOpacity} />
                    {showLineOverlay ? (
                      <path
                        d={topPath}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ) : null}
                  </g>
                );
              }

              const series = grouped.get(category) ?? [];
              const top = series.map((point) => ({
                x: layout.xAt(point.date),
                y: layout.yAt(point.value),
              }));
              const baseline = series.map((point) => ({
                x: layout.xAt(point.date),
                y: layout.yAt(layout.yMin),
              }));
              const topPath = seriesPath(top, interpolationMethod);
              const area = closeAreaPath(topPath, [...baseline].reverse());
              return (
                <g key={category}>
                  <path d={area} fill={color} opacity={gradientOpacity} />
                  {showLineOverlay ? (
                    <path
                      d={topPath}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ) : null}
                </g>
              );
            })}
          </>
        );
      }}
    </CartesianFrame>
  );
}

function stackedSeries(
  categories: string[],
  grouped: Map<string, SWAreaChartDataPoint[]>,
  layout: { xAt: (date: Date) => number; yAt: (value: number) => number },
): Map<string, { top: PlotPoint[]; bottom: PlotPoint[] }> {
  const dates = new Set<number>();
  for (const series of grouped.values()) {
    for (const point of series) dates.add(startOfDay(point.date).getTime());
  }
  const sortedDates = Array.from(dates).sort((a, b) => a - b);
  const result = new Map<string, { top: PlotPoint[]; bottom: PlotPoint[] }>();
  const acc = sortedDates.map(() => 0);

  for (const category of categories) {
    const byDay = new Map<number, number>();
    for (const point of grouped.get(category) ?? []) {
      byDay.set(startOfDay(point.date).getTime(), point.value);
    }
    const top: PlotPoint[] = [];
    const bottom: PlotPoint[] = [];
    sortedDates.forEach((time, index) => {
      const date = new Date(time);
      const x = layout.xAt(date);
      const start = acc[index];
      const next = start + (byDay.get(time) ?? 0);
      acc[index] = next;
      bottom.push({ x, y: layout.yAt(start) });
      top.push({ x, y: layout.yAt(next) });
    });
    result.set(category, { top, bottom });
  }
  return result;
}

function resolveAreaYDomain(
  dataPoints: SWAreaChartDataPoint[],
  stackMode: SWAreaStackMode,
  yDomain: SWClosedRange | null,
): SWClosedRange {
  if (yDomain) return yDomain;
  if (dataPoints.length === 0) return { min: 0, max: 1 };
  let maxVal = 0;
  if (stackMode === "stacked") {
    const sums = new Map<number, number>();
    for (const point of dataPoints) {
      const key = startOfDay(point.date).getTime();
      sums.set(key, (sums.get(key) ?? 0) + point.value);
    }
    maxVal = Math.max(0, ...sums.values());
  } else {
    maxVal = Math.max(0, ...dataPoints.map((p) => p.value));
  }
  return { min: 0, max: maxVal > 0 ? maxVal : 1 };
}
