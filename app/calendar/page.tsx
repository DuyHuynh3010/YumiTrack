import { AppShell } from "@/components/AppShell";
import { CalendarView } from "@/components/CalendarView";
import { SessionCard } from "@/components/SessionCard";
import { StatCard } from "@/components/StatCard";
import { mockSessions } from "@/lib/mock-data";
import { calculateSessionStats } from "@/lib/practice";

export default function CalendarPage() {
  const selectedSession = mockSessions[0];
  const stats = calculateSessionStats(selectedSession);

  return (
    <AppShell activePath="/calendar">
      <header className="topbar">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>Practice history</h1>
        </div>
      </header>

      <section className="two-column-grid" style={{ marginTop: 32 }}>
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">May 2026</p>
              <h2>Month view</h2>
            </div>
          </div>
          <CalendarView />
        </section>

        <section className="stack">
          <div className="stats-grid" style={{ margin: 0 }}>
            <StatCard detail="selected day" label="Date" value="May 3" />
            <StatCard detail={`${stats.totalHits} / ${stats.totalArrows} hits`} label="Hit rate" value={`${stats.hitRate}%`} />
          </div>
          <section className="panel stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selected day</p>
                <h2>Sessions</h2>
              </div>
            </div>
            <SessionCard session={selectedSession} />
            <p className="hint-text">{selectedSession.overallNote}</p>
          </section>
        </section>
      </section>
    </AppShell>
  );
}
