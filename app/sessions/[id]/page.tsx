import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EndCard } from "@/components/EndCard";
import { StatCard } from "@/components/StatCard";
import { mockSessions } from "@/lib/mock-data";
import { calculateSessionStats } from "@/lib/practice";

type SessionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params;
  const session = mockSessions.find((item) => item.id === id);

  if (!session) {
    notFound();
  }

  const stats = calculateSessionStats(session);

  return (
    <AppShell activePath="/">
      <header className="topbar">
        <div>
          <p className="eyebrow">Session detail</p>
          <h1>{session.practiceDate}</h1>
        </div>
        <Link className="ghost-action" href="/">
          Back to dashboard
        </Link>
      </header>

      <section className="stats-grid" aria-label="Session statistics">
        <StatCard detail="session performance" label="Hit rate" value={`${stats.hitRate}%`} />
        <StatCard detail="all recorded arrows" label="Total arrows" value={`${stats.totalArrows}`} />
        <StatCard detail="successful shots" label="Hits" value={`${stats.totalHits}`} />
        <StatCard detail="hits per end" label="Average end" value={stats.averageHitsPerEnd.toFixed(1)} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Notes</p>
            <h2>Practice record</h2>
          </div>
          <span className="pill">{stats.totalMisses} misses</span>
        </div>
        <p className="hint-text" style={{ marginTop: 16 }}>
          {session.overallNote}
        </p>
        <div className="end-list">
          {session.ends.map((end, index) => (
            <EndCard end={end} index={index} key={end.id} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
