import type { PracticeEnd, PracticeSession, SessionStats } from "./types";

export function calculateEndHits(end: PracticeEnd): number {
  return end.arrows.filter(Boolean).length;
}

export function calculateHitRate(totalHits: number, totalArrows: number): number {
  if (totalArrows === 0) {
    return 0;
  }

  return Math.round((totalHits / totalArrows) * 100);
}

export function calculateSessionStats(session: PracticeSession): SessionStats {
  const totalArrows = session.ends.length * 4;
  const totalHits = session.ends.reduce((sum, end) => sum + calculateEndHits(end), 0);
  const totalMisses = totalArrows - totalHits;

  return {
    totalArrows,
    totalHits,
    totalMisses,
    hitRate: calculateHitRate(totalHits, totalArrows),
    averageHitsPerEnd: session.ends.length ? Number((totalHits / session.ends.length).toFixed(1)) : 0,
  };
}

export function formatArrowResult(end: PracticeEnd): string {
  return end.arrows.map((arrow) => (arrow ? "O" : "X")).join(" ");
}

export function summarizeSessions(sessions: PracticeSession[]) {
  const totalArrows = sessions.reduce((sum, session) => sum + session.ends.length * 4, 0);
  const totalHits = sessions.reduce(
    (sum, session) => sum + session.ends.reduce((endSum, end) => endSum + calculateEndHits(end), 0),
    0,
  );

  return {
    totalArrows,
    totalHits,
    totalMisses: totalArrows - totalHits,
    hitRate: calculateHitRate(totalHits, totalArrows),
  };
}

export function groupByDay(sessions: PracticeSession[]) {
  return sessions.reduce<Record<string, PracticeSession[]>>((groups, session) => {
    groups[session.practiceDate] = groups[session.practiceDate] ?? [];
    groups[session.practiceDate].push(session);
    return groups;
  }, {});
}
