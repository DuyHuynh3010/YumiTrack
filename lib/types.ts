export type ArrowResult = boolean;

export type PracticeEnd = {
  id: string;
  sessionId: string;
  arrows: [ArrowResult, ArrowResult, ArrowResult, ArrowResult];
  note: string;
  createdAt: string;
};

export type PracticeSession = {
  id: string;
  practiceDate: string;
  overallNote: string;
  ends: PracticeEnd[];
  createdAt: string;
};

export type SessionStats = {
  totalArrows: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  averageHitsPerEnd: number;
};
