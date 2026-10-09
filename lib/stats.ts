import { summarizeSessions } from "./practice";
import type { PracticeSession } from "./types";

export type ChartRange = "daily" | "weekly" | "monthly";

function getWeekKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getGroupLabel(key: string, range: ChartRange) {
  const [year, month, day = 1] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (range === "monthly") {
    return new Intl.DateTimeFormat("en", { month: "short", year: "2-digit" }).format(date);
  }
  const label = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
  return range === "weekly" ? `Week ${label}` : label;
}

export function buildChartData(sessions: PracticeSession[], range: ChartRange) {
  const grouped = sessions.reduce<Record<string, PracticeSession[]>>((groups, session) => {
    const key = range === "monthly" ? session.practiceDate.slice(0, 7)
      : range === "weekly" ? getWeekKey(session.practiceDate) : session.practiceDate;
    (groups[key] ??= []).push(session);
    return groups;
  }, {});

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, groupSessions]) => {
      const stats = summarizeSessions(groupSessions);
      const totalEnds = groupSessions.reduce((sum, session) => sum + session.ends.length, 0);
      return {
        label: getGroupLabel(key, range),
        hitRate: stats.hitRate,
        totalArrows: stats.totalArrows,
        averageHitsPerEnd: totalEnds ? Number((stats.totalHits / totalEnds).toFixed(1)) : 0,
      };
    });
}
