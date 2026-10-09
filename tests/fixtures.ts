import type { PracticeSession } from "../lib/types";

export function session(practiceDate: string, hitsPerEnd: number[]): PracticeSession {
  return {
    id: practiceDate,
    practiceDate,
    overallNote: "",
    createdAt: `${practiceDate}T12:00:00Z`,
    ends: hitsPerEnd.map((hits, index) => ({
      id: `${practiceDate}-${index}`,
      sessionId: practiceDate,
      arrows: [hits > 0, hits > 1, hits > 2, hits > 3],
      note: "",
      createdAt: `${practiceDate}T12:00:00Z`,
    })),
  };
}
