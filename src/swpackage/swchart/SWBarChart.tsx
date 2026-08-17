import { startOfDay } from "@/swpackage/swutil";
import {
  CartesianFrame,
  categoryOrder,
  seriesColor,
  type SWClosedRange,
} from "./chartShared";

export type SWBarStackMode = "grouped" | "stacked";

export type SWBarChartDataPoint = {
  id?: string;
  date: Date;
  value: number;
  category: string;
};

export type SWBarChartProps = {
  dataPoints: SWBarChartDataPoint[];
  colorMapping: Record<string, string>;
  stackMode?: SWBarStackMode;
  showValueLabels?: boolean;
  barCornerRadius?: number;
  yDomain?: SWClosedRange | null;
  scrollableDaysBack?: number;
  scrollableDaysForward?: number;
  visibleDays?: number;
  chartHeight?: number;
  title?: string | null;
};

export function SWBarChart({
  dataPoints,
  colorMapping,
  stackMode = "grouped",
  showValueLabels = false,
  barCornerRadius = 3,
  yDomain = null,
  scrollableDaysBack = 30,
  scrollableDaysForward = 7,
  visibleDays = 7,
  chartHeight = 200,
  title = null,
}: SWBarChartProps) {
  const categories = categoryOrder(dataPoints, colorMapping);
  const buckets = bucketByDay(dataPoints);
  const effectiveYDomain = resolveBarYDomain(dataPoints, stackMode, yDomain);

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
      initialScroll="center"
    >
      {(layout) => {
        const baseline = layout.yAt(Math.max(0, layout.yMin));
        return (
          <>
            {Array.from(buckets.entries()).map(([dayKey, items]) => {
              const day = new Date(Number(dayKey));
              const slotX = layout.xAt(day);
              const slotW = layout.pixelsPerDay;
              if (stackMode === "stacked") {
                const barW = slotW * 0.5;
                const x = slotX + (slotW - barW) / 2;
                let acc = 0;
                return (
                  <g key={dayKey}>
                    {categories.map((category) => {
                      const point = items.find((p) => p.category === category);
                      if (!point) return null;
                      const start = acc;
                      acc += point.value * layout.reveal;
                      const y0 = layout.yAt(start);
                      const y1 = layout.yAt(acc);
                      const h = Math.max(0, y0 - y1);
                      return (
                        <g key={point.id ?? `${dayKey}-${category}`}>
                          <rect
                            x={x}
                            y={y1}
                            width={barW}
                            height={h}
                            rx={barCornerRadius}
                            ry={barCornerRadius}
                            fill={seriesColor(category, colorMapping)}
                          />
                          {showValueLabels ? (
                            <text
                              x={x + barW / 2}
                              y={y1 - 3}
                              textAnchor="middle"
                              fill="var(--sw-secondary-label)"
                              fontSize={10}
                            >
                              {Math.round(point.value)}
                            </text>
                          ) : null}
                        </g>
                      );
                    })}
                  </g>
                );
              }

              const count = Math.max(1, categories.length);
              const groupW = slotW * 0.72;
              const barW = groupW / count;
              const origin = slotX + (slotW - groupW) / 2;
              return (
                <g key={dayKey}>
                  {categories.map((category, index) => {
                    const point = items.find((p) => p.category === category);
                    if (!point) return null;
                    const x = origin + index * barW;
                    const value = point.value * layout.reveal;
                    const y = layout.yAt(value);
                    const h = Math.max(0, baseline - y);
                    return (
                      <g key={point.id ?? `${dayKey}-${category}`}>
                        <rect
                          x={x + 1}
                          y={y}
                          width={Math.max(1, barW - 2)}
                          height={h}
                          rx={barCornerRadius}
                          ry={barCornerRadius}
                          fill={seriesColor(category, colorMapping)}
                        />
                        {showValueLabels ? (
                          <text
                            x={x + barW / 2}
                            y={y - 3}
                            textAnchor="middle"
                            fill="var(--sw-secondary-label)"
                            fontSize={10}
                          >
                            {Math.round(point.value)}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </>
        );
      }}
    </CartesianFrame>
  );
}

function bucketByDay(
  dataPoints: SWBarChartDataPoint[],
): Map<number, SWBarChartDataPoint[]> {
  const buckets = new Map<number, SWBarChartDataPoint[]>();
  for (const point of dataPoints) {
    const key = startOfDay(point.date).getTime();
    const list = buckets.get(key) ?? [];
    list.push(point);
    buckets.set(key, list);
  }
  return buckets;
}

function resolveBarYDomain(
  dataPoints: SWBarChartDataPoint[],
  stackMode: SWBarStackMode,
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
