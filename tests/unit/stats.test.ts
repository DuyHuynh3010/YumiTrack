import { describe, expect, it } from "vitest";
import { buildChartData } from "../../lib/stats";
import { session } from "../fixtures";

describe("stats range selection", () => {
  it.each(["daily", "weekly", "monthly"] as const)("handles empty %s data", (range) => {
    expect(buildChartData([], range)).toEqual([]);
  });
  it("combines daily sessions, sorts dates and weights their hit rates", () => {
    const sessions = [session("2026-01-02", [2]), session("2026-01-01", [4]), session("2026-01-01", [0, 0, 0])];
    expect(buildChartData(sessions, "daily")).toEqual([
      { label: "Jan 1", hitRate: 25, totalArrows: 16, averageHitsPerEnd: 1 },
      { label: "Jan 2", hitRate: 50, totalArrows: 4, averageHitsPerEnd: 2 },
    ]);
    expect(sessions[0].practiceDate).toBe("2026-01-02");
  });
  it("starts weeks on Monday, including across a year boundary", () => {
    expect(buildChartData([
      session("2025-12-29", [4]), session("2026-01-04", [0]), session("2026-01-05", [2]),
    ], "weekly")).toEqual([
      { label: "Week Dec 29", hitRate: 50, totalArrows: 8, averageHitsPerEnd: 2 },
      { label: "Week Jan 5", hitRate: 50, totalArrows: 4, averageHitsPerEnd: 2 },
    ]);
  });
  it("separates months and years, including leap day", () => {
    const data = buildChartData([
      session("2025-02-01", [4]), session("2024-03-01", [2]),
      session("2024-02-29", [0]), session("2024-02-01", [4]),
    ], "monthly");
    expect(data.map((point) => point.label)).toEqual(["Feb 24", "Mar 24", "Feb 25"]);
    expect(data[0]).toMatchObject({ hitRate: 50, totalArrows: 8 });
  });
  it("handles a group containing only an empty session", () => {
    expect(buildChartData([session("2026-01-01", [])], "daily")[0])
      .toMatchObject({ hitRate: 0, totalArrows: 0, averageHitsPerEnd: 0 });
  });
});
