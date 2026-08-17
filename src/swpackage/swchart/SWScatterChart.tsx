import {
  CartesianFrame,
  categoryOrder,
  seriesColor,
  type SWClosedRange,
} from "./chartShared";

export type SWScatterChartDataPoint = {
  id?: string;
  date: Date;
  value: number;
  category: string;
};

export type SWScatterChartProps = {
  dataPoints: SWScatterChartDataPoint[];
  colorMapping: Record<string, string>;
  yDomain?: SWClosedRange;
  scrollableDaysBack?: number;
  scrollableDaysForward?: number;
  visibleDays?: number;
  chartHeight?: number;
  title?: string | null;
};

export function SWScatterChart({
  dataPoints,
  colorMapping,
  yDomain = { min: 0, max: 100 },
  scrollableDaysBack = 30,
  scrollableDaysForward = 7,
  visibleDays = 7,
  chartHeight = 180,
  title = null,
}: SWScatterChartProps) {
  const categories = categoryOrder(dataPoints, colorMapping);

  return (
    <CartesianFrame
      title={title}
      chartHeight={chartHeight}
      yDomain={yDomain}
      categories={categories}
      colorMapping={colorMapping}
      scrollableDaysBack={scrollableDaysBack}
      scrollableDaysForward={scrollableDaysForward}
      visibleDays={visibleDays}
      initialScroll="center"
    >
      {(layout) =>
        dataPoints.map((point, index) => (
          <circle
            key={point.id ?? `${point.category}-${index}`}
            cx={layout.xAt(point.date)}
            cy={layout.yAt(point.value)}
            r={4}
            fill={seriesColor(point.category, colorMapping)}
          />
        ))
      }
    </CartesianFrame>
  );
}
