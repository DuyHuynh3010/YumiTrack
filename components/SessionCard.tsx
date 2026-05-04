import Link from "next/link";
import { calculateSessionStats } from "@/lib/practice";
import type { PracticeSession } from "@/lib/types";

type SessionCardProps = {
  session: PracticeSession;
};

export function SessionCard({ session }: SessionCardProps) {
  const stats = calculateSessionStats(session);

  return (
    <Link className="session-card" href={`/sessions/${session.id}`}>
      <strong>{session.practiceDate}</strong>
      <span>
        {stats.totalHits} / {stats.totalArrows} hits
      </span>
    </Link>
  );
}
