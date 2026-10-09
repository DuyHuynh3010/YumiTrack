import { describe, expect, it } from "vitest";
import { calculateEndHits, calculateHitRate, calculateSessionStats, summarizeSessions, groupByDay, formatArrowResult } from "../../lib/practice";
import { session } from "../fixtures";

describe("practice calculations", () => {
  it.each([[0, 0, 0], [0, 4, 0], [4, 4, 100], [1, 3, 33], [2, 3, 67]])(
    "%i hits out of %i arrows gives %i percent", (hits, arrows, rate) => {
      expect(calculateHitRate(hits, arrows)).toBe(rate);
    },
  );
  it("counts individual arrows and preserves their order", () => {
    const end = session("2026-01-01", [2]).ends[0];
    end.arrows = [true, false, true, false];
    expect(calculateEndHits(end)).toBe(2);
    expect(formatArrowResult(end)).toBe("O X O X");
  });
  it("handles a session without ends", () => {
    expect(calculateSessionStats(session("2026-01-01", []))).toEqual({
      totalArrows: 0, totalHits: 0, totalMisses: 0, hitRate: 0, averageHitsPerEnd: 0,
    });
  });
  it("calculates totals and rounds average hits per end", () => {
    expect(calculateSessionStats(session("2026-01-01", [1, 2, 2]))).toEqual({
      totalArrows: 12, totalHits: 5, totalMisses: 7, hitRate: 42, averageHitsPerEnd: 1.7,
    });
  });
  it("weights overall hit rate by arrow count, not by session count", () => {
    expect(summarizeSessions([session("2026-01-01", [4]), session("2026-01-02", [0, 0, 0])]))
      .toEqual({ totalArrows: 16, totalHits: 4, totalMisses: 12, hitRate: 25 });
    expect(summarizeSessions([]).hitRate).toBe(0);
  });
  it("groups multiple sessions on the same practice date", () => {
    const sessions = [session("2026-01-01", [4]), session("2026-01-01", [0]), session("2026-01-02", [])];
    expect(groupByDay(sessions)["2026-01-01"]).toEqual(sessions.slice(0, 2));
    expect(Object.keys(groupByDay(sessions))).toHaveLength(2);
  });
});
