import {
  CartesianFrame,
  categoryOrder,
  groupByCategory,
  seriesColor,
  seriesPath,
  type SWClosedRange,
  type SWInterpolationMethod,
} from "./chartShared";

export type SWLineChartDataPoint = {
  id?: string;
  date: Date;
  value: number;
  category: string;
};

export type SWLineChartReferenceLine = {
  value: number;
  label?: string | null;
  color?: string;
  dash?: number[];
  lineWidth?: number;
};

export type SWLineChartProps = {
  dataPoints: SWLineChartDataPoint[];
  colorMapping: Record<string, string>;
  referenceLines?: SWLineChartReferenceLine[];
  interpolationMethod?: SWInterpolationMethod;
  showPointMarkers?: boolean;
  yDomain?: SWClosedRange | null;
  scrollableDaysBack?: number;
  scrollableDaysForward?: number;
  visibleDays?: number;
  chartHeight?: number;
  title?: string | null;
};

export function SWLineChart({
  dataPoints,
  colorMapping,
  referenceLines = [],
  interpolationMethod = "linear",
  showPointMarkers = false,
  yDomain = null,
  scrollableDaysBack = 30,
  scrollableDaysForward = 7,
  visibleDays = 7,
  chartHeight = 200,
  title = null,
}: SWLineChartProps) {
  const categories = categoryOrder(dataPoints, colorMapping);
  const grouped = groupByCategory(dataPoints);
  const effectiveYDomain = resolveLineYDomain(dataPoints, referenceLines, yDomain);

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
      {(layout) => (
        <>
          {referenceLines.map((line, index) => {
            const y = layout.yAt(line.value);
            const color = line.color ?? "var(--sw-secondary-label)";
            const dash = (line.dash ?? [5, 3]).join(" ");
            return (
              <g key={`ref-${index}`}>
                <line
                  x1={0}
                  x2={layout.totalWidth}
                  y1={y}
                  y2={y}
                  stroke={color}
                  strokeWidth={line.lineWidth ?? 1}
                  strokeDasharray={dash}
                />
                {line.label ? (
                  <text
                    x={4}
                    y={y - 4}
                    fill={color}
                    fontSize={10}
                  >
                    {line.label}
                  </text>
                ) : null}
              </g>
            );
          })}
          {categories.map((category) => {
            const series = grouped.get(category) ?? [];
            const points = series.map((point) => ({
              x: layout.xAt(point.date),
              y: layout.yAt(point.value),
            }));
            const color = seriesColor(category, colorMapping);
            return (
              <g key={category}>
                <path
                  d={seriesPath(points, interpolationMethod)}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {showPointMarkers
                  ? series.map((point) => (
                      <circle
                        key={point.id ?? `${category}-${point.date.getTime()}`}
                        cx={layout.xAt(point.date)}
                        cy={layout.yAt(point.value)}
                        r={3.2}
                        fill={color}
                      />
                    ))
                  : null}
              </g>
            );
          })}
        </>
      )}
    </CartesianFrame>
  );
}

function resolveLineYDomain(
  dataPoints: SWLineChartDataPoint[],
  referenceLines: SWLineChartReferenceLine[],
  yDomain: SWClosedRange | null,
): SWClosedRange {
  if (yDomain) return yDomain;
  const values = [
    ...dataPoints.map((p) => p.value),
    ...referenceLines.map((l) => l.value),
  ];
  if (values.length === 0) return { min: 0, max: 1 };
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  if (maxVal <= 0) return { min: minVal, max: 0 };
  return { min: Math.min(minVal, 0), max: maxVal };
}
