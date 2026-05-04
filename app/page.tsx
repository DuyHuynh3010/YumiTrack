import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CalendarView } from "@/components/CalendarView";
import { ProgressChart } from "@/components/ProgressChart";
import { SessionCard } from "@/components/SessionCard";
import { StatCard } from "@/components/StatCard";
import { mockSessions } from "@/lib/mock-data";
import { calculateSessionStats, summarizeSessions } from "@/lib/practice";

export default function DashboardPage() {
  const today = mockSessions[0];
  const todayStats = calculateSessionStats(today);
  const weekStats = summarizeSessions(mockSessions);
  const bestSession = [...mockSessions].sort(
    (a, b) => calculateSessionStats(b).hitRate - calculateSessionStats(a).hitRate,
  )[0];

  return (
    <AppShell activePath="/">
      <header className="topbar">
        <div>
          <p className="eyebrow">Practice overview</p>
          <h1>Kyudo training journal</h1>
        </div>
        <Link className="primary-action" href="/practice">
          Start practice
        </Link>
      </header>

      <section className="stats-grid" aria-label="Practice statistics">
        <StatCard
          detail={`${todayStats.totalHits} hits / ${todayStats.totalArrows} arrows`}
          label="Today"
          value={`${todayStats.hitRate}%`}
        />
        <StatCard
          detail={`${weekStats.totalHits} hits / ${weekStats.totalArrows} arrows`}
          label="This week"
          value={`${weekStats.hitRate}%`}
        />
        <StatCard
          detail="hits per 4 arrows"
          label="Average end"
          value={todayStats.averageHitsPerEnd.toFixed(1)}
        />
        <StatCard detail={bestSession.practiceDate} label="Best session" value={`${calculateSessionStats(bestSession).hitRate}%`} />
      </section>

      <section className="content-grid">
        <div className="stack">
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Current session</p>
                <h2>{today.practiceDate}</h2>
              </div>
              <span className="pill">{todayStats.hitRate}% hit rate</span>
            </div>
            <p className="hint-text" style={{ marginTop: 16 }}>
              {today.overallNote}
            </p>
            <div className="end-list">
              {today.ends.map((end, index) => (
                <SessionEndSummary endId={end.id} index={index} key={end.id} />
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Progress</p>
                <h2>Hit rate trend</h2>
              </div>
              <Link className="ghost-action" href="/stats">
                View stats
              </Link>
            </div>
            <ProgressChart />
          </section>
        </div>

        <aside className="side-column">
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">May 2026</p>
                <h2>Calendar</h2>
              </div>
            </div>
            <CalendarView />
          </section>

          <section className="panel stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">History</p>
                <h2>Recent sessions</h2>
              </div>
            </div>
            {mockSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

function SessionEndSummary({ endId, index }: { endId: string; index: number }) {
  const end = mockSessions[0].ends.find((item) => item.id === endId);

  if (!end) {
    return null;
  }

  const hits = end.arrows.filter(Boolean).length;

  return (
    <article className="end-card">
      <span className="end-number">{index + 1}</span>
      <div className="arrow-row">
        {end.arrows.map((arrow, arrowIndex) => (
          <span className={`arrow-result${arrow ? " hit" : ""}`} key={arrowIndex}>
            {arrow ? "O" : "X"}
          </span>
        ))}
      </div>
      <span className="end-note">
        {hits}/4 - {end.note}
      </span>
    </article>
  );
}
