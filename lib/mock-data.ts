import type { PracticeSession } from "./types";

export const mockSessions: PracticeSession[] = [
  {
    id: "session-2026-05-03",
    practiceDate: "2026-05-03",
    overallNote: "Need to improve breathing and keep the second shot calmer.",
    createdAt: "2026-05-03T17:00:00.000Z",
    ends: [
      {
        id: "end-1",
        sessionId: "session-2026-05-03",
        arrows: [true, false, true, true],
        note: "Second shot rushed",
        createdAt: "2026-05-03T17:02:00.000Z",
      },
      {
        id: "end-2",
        sessionId: "session-2026-05-03",
        arrows: [false, false, true, true],
        note: "Keep the shoulders softer",
        createdAt: "2026-05-03T17:09:00.000Z",
      },
      {
        id: "end-3",
        sessionId: "session-2026-05-03",
        arrows: [true, true, true, false],
        note: "Better release rhythm",
        createdAt: "2026-05-03T17:16:00.000Z",
      },
      {
        id: "end-4",
        sessionId: "session-2026-05-03",
        arrows: [true, false, true, true],
        note: "Breathing improved",
        createdAt: "2026-05-03T17:23:00.000Z",
      },
    ],
  },
  {
    id: "session-2026-05-02",
    practiceDate: "2026-05-02",
    overallNote: "Release felt uneven after the third end.",
    createdAt: "2026-05-02T16:00:00.000Z",
    ends: [
      {
        id: "end-5",
        sessionId: "session-2026-05-02",
        arrows: [true, false, false, true],
        note: "Slow start",
        createdAt: "2026-05-02T16:02:00.000Z",
      },
      {
        id: "end-6",
        sessionId: "session-2026-05-02",
        arrows: [true, true, false, true],
        note: "More settled",
        createdAt: "2026-05-02T16:09:00.000Z",
      },
      {
        id: "end-7",
        sessionId: "session-2026-05-02",
        arrows: [false, true, false, true],
        note: "Grip changed",
        createdAt: "2026-05-02T16:16:00.000Z",
      },
      {
        id: "end-8",
        sessionId: "session-2026-05-02",
        arrows: [true, true, false, false],
        note: "Tired finish",
        createdAt: "2026-05-02T16:23:00.000Z",
      },
    ],
  },
  {
    id: "session-2026-05-01",
    practiceDate: "2026-05-01",
    overallNote: "Best rhythm of the week.",
    createdAt: "2026-05-01T15:00:00.000Z",
    ends: [
      {
        id: "end-9",
        sessionId: "session-2026-05-01",
        arrows: [true, true, true, true],
        note: "Calm set",
        createdAt: "2026-05-01T15:02:00.000Z",
      },
      {
        id: "end-10",
        sessionId: "session-2026-05-01",
        arrows: [true, true, false, true],
        note: "One rushed shot",
        createdAt: "2026-05-01T15:09:00.000Z",
      },
      {
        id: "end-11",
        sessionId: "session-2026-05-01",
        arrows: [true, true, true, true],
        note: "Clean finish",
        createdAt: "2026-05-01T15:16:00.000Z",
      },
      {
        id: "end-12",
        sessionId: "session-2026-05-01",
        arrows: [true, true, true, false],
        note: "Good posture",
        createdAt: "2026-05-01T15:23:00.000Z",
      },
    ],
  },
];
