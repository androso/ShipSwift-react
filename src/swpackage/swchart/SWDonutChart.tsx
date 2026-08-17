import { useState } from "react";
import { makeId } from "./chartShared";
import "./swchart.css";

const NO_CATEGORY_KEY = "__no_category__";

const PALETTE = [
  "var(--sw-blue)",
  "var(--sw-green)",
  "var(--sw-orange)",
  "var(--sw-purple)",
  "var(--sw-red)",
  "var(--sw-teal)",
  "var(--sw-pink)",
  "var(--sw-indigo)",
  "var(--sw-yellow)",
  "var(--sw-mint)",
];

export type SWDonutChartCategory = {
  id?: string;
  name: string;
};

export type SWDonutChartSubject = {
  id?: string;
  name: string;
  category?: SWDonutChartCategory | null;
};

export type SWDonutChartProps = {
  subjects: SWDonutChartSubject[];
  selectedCategory?: string | null;
  onSelectedCategoryChange?: (category: string | null) => void;
};

type CategoryItem = { name: string; count: number };

export function SWDonutChart({
  subjects,
  selectedCategory: selectedCategoryProp,
  onSelectedCategoryChange,
}: SWDonutChartProps) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(null);
  const categoryData = groupSubjects(subjects);
  const totalCount = subjects.length;
  const selectedCategory =
    selectedCategoryProp !== undefined ? selectedCategoryProp : uncontrolled;
  const setSelectedCategory = (next: string | null) => {
    onSelectedCategoryChange?.(next);
    if (selectedCategoryProp === undefined) setUncontrolled(next);
  };

  if (categoryData.length === 0) return null;

  const selectedCount = selectedCategory
    ? (categoryData.find((item) => item.name === selectedCategory)?.count ?? 0)
    : totalCount;
  const selectedDisplayName = selectedCategory
    ? displayName(selectedCategory)
    : "All Items";

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 4;
  const innerR = maxR * 0.6;

  let cumulative = 0;

  return (
    <div className="sw-donut">
      <div className="sw-donut-chart">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {categoryData.map((item, index) => {
            const start = (cumulative / totalCount) * Math.PI * 2 - Math.PI / 2;
            cumulative += item.count;
            const end = (cumulative / totalCount) * Math.PI * 2 - Math.PI / 2;
            const isSelected = selectedCategory === item.name;
            const dimmed = selectedCategory != null && !isSelected;
            const outerR = maxR * (isSelected ? 1 : 0.9);
            const inset = isSelected ? 0.04 : 0.02;
            const color = PALETTE[index % PALETTE.length];
            return (
              <path
                key={item.name}
                d={annularSector(cx, cy, innerR, outerR, start + inset, end - inset)}
                fill={color}
                opacity={dimmed ? 0.3 : 1}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.25s ease, d 0.25s ease",
                }}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : item.name);
                }}
              />
            );
          })}
        </svg>
        <div className="sw-donut-center">
          <div className="sw-donut-count">{selectedCount}</div>
          <div className="sw-donut-name">{selectedDisplayName}</div>
        </div>
      </div>
      <div className="sw-donut-legend">
        {categoryData.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className="sw-chart-legend-item"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              opacity: selectedCategory == null || selectedCategory === item.name ? 1 : 0.35,
              cursor: "pointer",
            }}
            onClick={() =>
              setSelectedCategory(selectedCategory === item.name ? null : item.name)
            }
          >
            <span
              className="sw-chart-legend-swatch"
              style={{ background: PALETTE[index % PALETTE.length] }}
            />
            {displayName(item.name)}
          </button>
        ))}
      </div>
    </div>
  );
}

function groupSubjects(subjects: SWDonutChartSubject[]): CategoryItem[] {
  const grouped = new Map<string, number>();
  for (const subject of subjects) {
    const key = subject.category ? subject.category.name : NO_CATEGORY_KEY;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  return Array.from(grouped.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (a.count !== b.count ? b.count - a.count : a.name.localeCompare(b.name)));
}

function displayName(categoryName: string): string {
  if (categoryName === NO_CATEGORY_KEY) return "No Category";
  if (categoryName.length === 0) return "Unnamed Category";
  return categoryName;
}

function annularSector(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
): string {
  const large = end - start > Math.PI ? 1 : 0;
  const ox1 = cx + Math.cos(start) * outer;
  const oy1 = cy + Math.sin(start) * outer;
  const ox2 = cx + Math.cos(end) * outer;
  const oy2 = cy + Math.sin(end) * outer;
  const ix1 = cx + Math.cos(end) * inner;
  const iy1 = cy + Math.sin(end) * inner;
  const ix2 = cx + Math.cos(start) * inner;
  const iy2 = cy + Math.sin(start) * inner;
  return [
    `M ${ox1} ${oy1}`,
    `A ${outer} ${outer} 0 ${large} 1 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2}`,
    "Z",
  ].join(" ");
}

export function createDonutCategory(name: string, id = makeId()): SWDonutChartCategory {
  return { id, name };
}

export function createDonutSubject(
  name: string,
  category: SWDonutChartCategory | null = null,
  id = makeId(),
): SWDonutChartSubject {
  return { id, name, category };
}
