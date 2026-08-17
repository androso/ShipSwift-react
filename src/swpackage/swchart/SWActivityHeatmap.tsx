import { addingDays, daysFrom, isToday, startOfDay } from "@/swpackage/swutil";
import "./swchart.css";

export type SWStreakInfo = {
  currentStreak: number;
  startDate: Date | null;
  displayText: (options?: {
    noRecordsText?: string;
    startedTodayText?: string;
    recordedYesterdayText?: string;
  }) => string;
};

export type SWStreakCardProps = {
  streaks: Date[];
  currentStreakTitle?: string;
  dayText?: string;
  daysText?: string;
  noRecordsText?: string;
  startedTodayText?: string;
  recordedYesterdayText?: string;
  colors?: string[];
};

export type SWHeatmapGridProps = {
  timestamps: Date[];
  days?: number;
  baseColor?: string;
  itemSize?: number;
  spacing?: number;
};

export type SWHeatmapLegendProps = {
  baseColor?: string;
  lessText?: string;
  moreText?: string;
};

export function calculateStreak(timestamps: Date[]): SWStreakInfo {
  if (timestamps.length === 0) {
    return makeStreakInfo(0, null);
  }

  const today = startOfDay(new Date());
  const recordsByDay = new Set<number>();
  for (const timestamp of timestamps) {
    recordsByDay.add(startOfDay(timestamp).getTime());
  }

  const validDays = Array.from(recordsByDay)
    .filter((day) => day <= today.getTime())
    .sort((a, b) => b - a);

  if (validDays.length === 0) {
    return makeStreakInfo(0, null);
  }

  const mostRecentDay = new Date(validDays[0]);
  const daysSinceMostRecent = daysFrom(today, mostRecentDay);
  if (daysSinceMostRecent > 1) {
    return makeStreakInfo(0, null);
  }

  let currentStreak = 1;
  let streakStartDate = mostRecentDay;
  let expected = addingDays(mostRecentDay, -1);

  for (const dayTime of validDays.slice(1)) {
    const day = new Date(dayTime);
    if (startOfDay(day).getTime() === startOfDay(expected).getTime()) {
      currentStreak += 1;
      streakStartDate = day;
      expected = addingDays(expected, -1);
    } else {
      break;
    }
  }

  return makeStreakInfo(currentStreak, streakStartDate);
}

function makeStreakInfo(currentStreak: number, startDate: Date | null): SWStreakInfo {
  return {
    currentStreak,
    startDate,
    displayText(options = {}) {
      const noRecordsText = options.noRecordsText ?? "No records yet. Start today!";
      const startedTodayText = options.startedTodayText ?? "Started today. Keep it up!";
      const recordedYesterdayText =
        options.recordedYesterdayText ??
        "You recorded yesterday. Continue today to keep the streak!";

      if (currentStreak <= 0) return noRecordsText;
      if (currentStreak === 1) {
        if (startDate && isToday(startDate)) return startedTodayText;
        return recordedYesterdayText;
      }
      if (!startDate) {
        return `Current streak started ${currentStreak} days ago.`;
      }
      const days = daysFrom(new Date(), startDate);
      if (days === 0) return "Current streak started today.";
      if (days === 1) return "Current streak started yesterday.";
      if (days < 7) return `Current streak started ${days} days ago.`;
      if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `Current streak started ${weeks} week${weeks === 1 ? "" : "s"} ago.`;
      }
      const months = Math.floor(days / 30);
      return `Current streak started ${months} month${months === 1 ? "" : "s"} ago.`;
    },
  };
}

function StreakCard({
  streaks,
  currentStreakTitle = "Current Streak",
  dayText = "Day",
  daysText = "Days",
  noRecordsText = "No records yet. Start today!",
  startedTodayText = "Started today. Keep it up!",
  recordedYesterdayText = "You recorded yesterday. Continue today!",
  colors = ["var(--sw-blue)", "var(--sw-purple)"],
}: SWStreakCardProps) {
  const streakInfo = calculateStreak(streaks);
  return (
    <div
      className="sw-streak-card"
      style={{
        background: `linear-gradient(to bottom right, ${colors[0] ?? "var(--sw-blue)"}, ${colors[1] ?? colors[0] ?? "var(--sw-purple)"})`,
      }}
    >
      <div className="sw-streak-card-inner">
        <div className="sw-streak-title">{currentStreakTitle}</div>
        <div className="sw-streak-number">{streakInfo.currentStreak}</div>
        <div className="sw-streak-unit">
          {streakInfo.currentStreak === 1 ? dayText : daysText}
        </div>
        <div className="sw-streak-caption">
          {streakInfo.displayText({
            noRecordsText,
            startedTodayText,
            recordedYesterdayText,
          })}
        </div>
      </div>
    </div>
  );
}

function colorForRecordCount(count: number, baseColor: string): string {
  const opacity = count === 0 ? 0.2 : count === 1 ? 0.4 : count === 2 ? 0.7 : 1;
  return `color-mix(in srgb, ${baseColor} ${Math.round(opacity * 100)}%, transparent)`;
}

function HeatmapGrid({
  timestamps,
  days = 60,
  baseColor = "var(--sw-green)",
  itemSize = 20,
  spacing = 3,
}: SWHeatmapGridProps) {
  const today = startOfDay(new Date());
  const counts = new Map<number, number>();
  for (const timestamp of timestamps) {
    const key = startOfDay(timestamp).getTime();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const targetDays: Date[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    targetDays.push(addingDays(today, -i));
  }

  return (
    <div className="sw-heatmap-grid">
      <div className="sw-heatmap-flow" style={{ gap: spacing }}>
        {targetDays.map((date) => {
          const count = counts.get(date.getTime()) ?? 0;
          return (
            <div
              key={date.toISOString()}
              title={`${date.toDateString()}: ${count}`}
              style={{
                width: itemSize,
                height: itemSize,
                borderRadius: 2,
                background: colorForRecordCount(count, baseColor),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function HeatmapLegend({
  baseColor = "var(--sw-green)",
  lessText = "Less",
  moreText = "More",
}: SWHeatmapLegendProps) {
  return (
    <div className="sw-heatmap-legend">
      <span>{lessText}</span>
      <div className="sw-heatmap-legend-swatches">
        {[0, 1, 2, 3].map((count) => (
          <div
            key={count}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: colorForRecordCount(count, baseColor),
            }}
          />
        ))}
      </div>
      <span>{moreText}</span>
    </div>
  );
}

export const SWActivityHeatmap = {
  StreakCard,
  HeatmapGrid,
  HeatmapLegend,
  calculateStreak,
};
