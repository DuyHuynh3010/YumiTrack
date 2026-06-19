"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CalendarView } from "@/components/CalendarView";
import { EndCard } from "@/components/EndCard";
import { ProgressChart } from "@/components/ProgressChart";
import { SessionCard } from "@/components/SessionCard";
import { StatCard } from "@/components/StatCard";
import { calculateSessionStats, summarizeSessions } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadRecentPracticeSessions } from "@/lib/supabase/practice-data";
import type { PracticeSession } from "@/lib/types";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DashboardView() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const todayDate = getLocalDate();

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          throw userError ?? new Error("You must be logged in to view your dashboard.");
        }

        const loadedSessions = await loadRecentPracticeSessions(supabase, data.user.id, 12);

        if (isMounted) {
          setSessions(loadedSessions);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const todaySessions = useMemo(() => sessions.filter((session) => session.practiceDate === todayDate), [sessions, todayDate]);
  const weekSessions = useMemo(() => {
    const weekStart = getDateDaysAgo(6);
    return sessions.filter((session) => session.practiceDate >= weekStart);
  }, [sessions]);
  const todayStats = useMemo(() => summarizeSessions(todaySessions), [todaySessions]);
  const weekStats = useMemo(() => summarizeSessions(weekSessions), [weekSessions]);
  const currentSession = todaySessions[0] ?? sessions[0] ?? null;
  const currentStats = currentSession ? calculateSessionStats(currentSession) : null;
  const bestSession = useMemo(
    () =>
      sessions.length
        ? [...sessions].sort((a, b) => calculateSessionStats(b).hitRate - calculateSessionStats(a).hitRate)[0]
        : null,
    [sessions],
  );
  const bestStats = bestSession ? calculateSessionStats(bestSession) : null;

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

      {error ? <p className="form-alert error">{error}</p> : null}

      <section className="stats-grid" aria-label="Practice statistics">
        <StatCard
          detail={`${todayStats.totalHits} hits / ${todayStats.totalArrows} arrows`}
          label="Today"
          value={isLoading ? "..." : `${todayStats.hitRate}%`}
        />
        <StatCard
          detail={`${weekStats.totalHits} hits / ${weekStats.totalArrows} arrows`}
          label="This week"
          value={isLoading ? "..." : `${weekStats.hitRate}%`}
        />
        <StatCard
          detail="hits per 4 arrows"
          label="Average end"
          value={currentStats ? currentStats.averageHitsPerEnd.toFixed(1) : "0.0"}
        />
        <StatCard detail={bestSession?.practiceDate ?? "No sessions yet"} label="Best session" value={bestStats ? `${bestStats.hitRate}%` : "0%"} />
      </section>

      <section className="content-grid">
        <div className="stack">
          <section className="panel">
            {currentSession && currentStats ? (
              <>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{currentSession.practiceDate === todayDate ? "Current session" : "Latest session"}</p>
                    <h2>{currentSession.practiceDate}</h2>
                  </div>
                  <span className="pill">{currentStats.hitRate}% hit rate</span>
                </div>
                <p className="hint-text" style={{ marginTop: 16 }}>
                  {currentSession.overallNote || "No session note yet."}
                </p>
                <div className="end-list">
                  {currentSession.ends.map((end, index) => (
                    <EndCard end={end} index={index} key={end.id} />
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>No practice sessions yet</h3>
                <p className="hint-text">Start your first session to see live dashboard stats here.</p>
                <Link className="primary-action" href="/practice">
                  Start practice
                </Link>
              </div>
            )}
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
                <p className="eyebrow">This month</p>
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
            {sessions.length ? (
              sessions.slice(0, 5).map((session) => <SessionCard key={session.id} session={session} />)
            ) : (
              <div className="empty-state">
                <h3>No history</h3>
                <p className="hint-text">Saved practice sessions will appear here.</p>
              </div>
            )}
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
