import { AppShell } from "@/components/AppShell";
import { ProgressChart } from "@/components/ProgressChart";
import { StatCard } from "@/components/StatCard";
import { mockSessions } from "@/lib/mock-data";
import { calculateSessionStats, summarizeSessions } from "@/lib/practice";

export default function StatsPage() {
  const total = summarizeSessions(mockSessions);
  const today = calculateSessionStats(mockSessions[0]);
  const best = [...mockSessions].sort((a, b) => calculateSessionStats(b).hitRate - calculateSessionStats(a).hitRate)[0];
  const worst = [...mockSessions].sort((a, b) => calculateSessionStats(a).hitRate - calculateSessionStats(b).hitRate)[0];

  return (
    <AppShell activePath="/stats">
      <header className="topbar">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Progress charts</h1>
        </div>
        <select aria-label="Chart range" defaultValue="daily" style={{ maxWidth: 180 }}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </header>

      <section className="stats-grid" aria-label="Analytics summary">
        <StatCard detail={`${total.totalHits} hits / ${total.totalArrows} arrows`} label="All practice" value={`${total.hitRate}%`} />
        <StatCard detail="hits per 4 arrows" label="Today avg" value={today.averageHitsPerEnd.toFixed(1)} />
        <StatCard detail={best.practiceDate} label="Best session" value={`${calculateSessionStats(best).hitRate}%`} />
        <StatCard detail={worst.practiceDate} label="Worst session" value={`${calculateSessionStats(worst).hitRate}%`} />
      </section>

      <section className="two-column-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Line chart</p>
              <h2>Hit rate over time</h2>
            </div>
          </div>
          <ProgressChart />
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Bar chart</p>
              <h2>Arrows per day</h2>
            </div>
          </div>
          <div className="chart" aria-label="Arrows per day chart">
            {[16, 20, 16, 0, 24, 12, 16].map((value, index) => (
              <span key={`${value}-${index}`} style={{ height: `${Math.max(8, value * 4)}%` }} />
            ))}
          </div>
          <div className="chart-labels">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
