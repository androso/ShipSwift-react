import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { addingDays, startOfDay } from "@/swpackage/swutil";
import {
  SWActivityHeatmap,
  SWAreaChart,
  SWBarChart,
  SWDonutChart,
  SWLineChart,
  SWNetworkGraph,
  SWNetworkGraphData,
  SWRadarChart,
  SWRingChart,
  SWScatterChart,
} from "@/swpackage/swchart";
import { CatalogList, DemoPage } from "./DemoPage";
import type { ReactNode } from "react";

const ITEMS = [
  { id: "line", title: "Line Chart", icon: "chart.xyaxis.line", description: "Multi-series line chart with scrolling, reference lines, and interpolation." },
  { id: "bar", title: "Bar Chart", icon: "chart.bar.fill", description: "Grouped or stacked bar chart with horizontal scrolling." },
  { id: "area", title: "Area Chart", icon: "chart.line.uptrend.xyaxis", description: "Standard or stacked area chart with smooth interpolation." },
  { id: "scatter", title: "Scatter Chart", icon: "chart.dots.scatter", description: "Horizontally scrollable scatter chart with category colors." },
  { id: "donut", title: "Donut Chart", icon: "chart.pie.fill", description: "Interactive donut with tap-to-select categories." },
  { id: "radar", title: "Radar Chart", icon: "pentagon", description: "Animated spider chart with grid rings and labels." },
  { id: "ring", title: "Ring Chart", icon: "circle.circle", description: "Activity-style concentric progress rings." },
  { id: "heatmap", title: "Activity Heatmap", icon: "square.grid.3x3.fill", description: "GitHub-style heatmap with streak tracking." },
  { id: "network", title: "Network Graph", icon: "point.3.connected.trianglepath.dotted", description: "Interactive 3D knowledge graph (Marble taxonomy)." },
];

export function ChartListView() {
  return <CatalogList title="Charts" base="/charts" items={ITEMS} />;
}

function daysBack(count: number): Date[] {
  const today = startOfDay();
  return Array.from({ length: count }, (_, i) => addingDays(today, -i));
}

function LineDemo() {
  const sales = useMemo(() => {
    return daysBack(14).flatMap((date) => [
      { date, value: 40 + Math.random() * 50, category: "Revenue" },
      { date, value: 20 + Math.random() * 40, category: "Cost" },
    ]);
  }, []);
  const temp = useMemo(() => {
    return daysBack(10).map((date) => ({
      date,
      value: 35.5 + Math.random() * 3,
      category: "Temperature",
    }));
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <SWLineChart dataPoints={sales} colorMapping={{ Revenue: "var(--sw-blue)", Cost: "var(--sw-red)" }} title="Revenue vs Cost" />
      <SWLineChart
        dataPoints={temp}
        colorMapping={{ Temperature: "var(--sw-orange)" }}
        referenceLines={[
          { value: 37, label: "Normal", color: "var(--sw-green)" },
          { value: 38, label: "Fever", color: "var(--sw-red)" },
        ]}
        interpolationMethod="catmullRom"
        showPointMarkers
        yDomain={{ min: 35, max: 40 }}
        visibleDays={10}
        chartHeight={220}
        title="Body Temperature"
      />
    </div>
  );
}

function BarDemo() {
  const grouped = useMemo(
    () =>
      daysBack(10).flatMap((date) => [
        { date, value: 50 + Math.random() * 100, category: "Online" },
        { date, value: 30 + Math.random() * 70, category: "Offline" },
      ]),
    [],
  );
  const stacked = useMemo(
    () =>
      daysBack(7).flatMap((date) => [
        { date, value: 30 + Math.random() * 50, category: "Food" },
        { date, value: 20 + Math.random() * 30, category: "Transport" },
        { date, value: 10 + Math.random() * 30, category: "Entertainment" },
      ]),
    [],
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <SWBarChart dataPoints={grouped} colorMapping={{ Online: "var(--sw-blue)", Offline: "var(--sw-orange)" }} title="Sales by Channel (Grouped)" />
      <SWBarChart
        dataPoints={stacked}
        colorMapping={{ Food: "var(--sw-green)", Transport: "var(--sw-blue)", Entertainment: "var(--sw-purple)" }}
        stackMode="stacked"
        yDomain={{ min: 0, max: 200 }}
        visibleDays={7}
        chartHeight={250}
        title="Daily Expenses (Stacked)"
      />
    </div>
  );
}

function AreaDemo() {
  const traffic = useMemo(
    () =>
      daysBack(14).flatMap((date) => [
        { date, value: 100 + Math.random() * 200, category: "Organic" },
        { date, value: 50 + Math.random() * 150, category: "Paid" },
      ]),
    [],
  );
  return (
    <SWAreaChart
      dataPoints={traffic}
      colorMapping={{ Organic: "var(--sw-green)", Paid: "var(--sw-blue)" }}
      title="Website Traffic"
    />
  );
}

function ScatterDemo() {
  const today = startOfDay();
  const data = [
    { date: addingDays(today, 0), value: 85, category: "Teeth" },
    { date: addingDays(today, 0), value: 52, category: "Food" },
    { date: addingDays(today, -1), value: 72, category: "Teeth" },
    { date: addingDays(today, -2), value: 90, category: "Teeth" },
    { date: addingDays(today, -3), value: 45, category: "Food" },
  ];
  return <SWScatterChart dataPoints={data} colorMapping={{ Teeth: "var(--sw-blue)", Food: "var(--sw-orange)" }} title="Scan Trends" />;
}

function DonutDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const work = { name: "Work" };
  const personal = { name: "Personal" };
  const health = { name: "Health" };
  return (
    <SWDonutChart
      selectedCategory={selected}
      onSelectedCategoryChange={setSelected}
      subjects={[
        { name: "Meeting", category: work },
        { name: "Report", category: work },
        { name: "Email", category: work },
        { name: "Shopping", category: personal },
        { name: "Reading", category: personal },
        { name: "Exercise", category: health },
        { name: "Meditation", category: health },
        { name: "Running", category: health },
        { name: "Uncategorized Task", category: null },
      ]}
    />
  );
}

function HeatmapDemo() {
  const timestamps = useMemo(() => {
    const today = new Date();
    const out: Date[] = [];
    for (let i = 0; i < 60; i++) {
      if (Math.random() < 0.7) {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) out.push(addingDays(today, -i));
      }
    }
    return out;
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SWActivityHeatmap.StreakCard streaks={timestamps} colors={["var(--sw-blue)", "var(--sw-purple)"]} />
      <SWActivityHeatmap.HeatmapGrid timestamps={timestamps} days={60} baseColor="var(--sw-green)" />
      <SWActivityHeatmap.HeatmapLegend baseColor="var(--sw-green)" />
    </div>
  );
}

const DEMOS: Record<string, () => ReactNode> = {
  line: () => <LineDemo />,
  bar: () => <BarDemo />,
  area: () => <AreaDemo />,
  scatter: () => <ScatterDemo />,
  donut: () => <DonutDemo />,
  radar: () => (
    <div className="sw-demo-stack">
      <SWRadarChart
        data={[
          { label: "Tolerance", value: 75 },
          { label: "Ambition", value: 50 },
          { label: "Acuity", value: 50 },
          { label: "Creativity", value: 85 },
          { label: "Stability", value: 85 },
        ]}
      />
    </div>
  ),
  ring: () => (
    <div className="sw-demo-stack">
      <SWRingChart
        data={[
          { label: "Move", value: 75, color: "var(--sw-red)" },
          { label: "Exercise", value: 50, color: "var(--sw-green)" },
          { label: "Stand", value: 90, color: "var(--sw-cyan)" },
        ]}
      >
        <div style={{ textAlign: "center" }}>Activity</div>
      </SWRingChart>
    </div>
  ),
  heatmap: () => <HeatmapDemo />,
  network: () => (
    <div className="sw-shader-stage">
      <SWNetworkGraph nodes={SWNetworkGraphData.nodes} edges={SWNetworkGraphData.edges} />
    </div>
  ),
};

export function ChartDemo() {
  const { id = "" } = useParams();
  const item = ITEMS.find((i) => i.id === id);
  const Demo = DEMOS[id];
  return (
    <DemoPage title={item?.title ?? id} pad={id !== "network"}>
      {Demo ? Demo() : <p>Unknown demo</p>}
    </DemoPage>
  );
}
