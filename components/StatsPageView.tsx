"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { StatsCharts } from "@/components/StatsCharts";
import { buildChartData, type ChartRange } from "@/lib/stats";
import { calculateSessionStats, summarizeSessions } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadAllPracticeSessions } from "@/lib/supabase/practice-data";
import type { PracticeSession } from "@/lib/types";

export function StatsPageView() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [range, setRange] = useState<ChartRange>("daily");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          throw userError ?? new Error("You must be logged in to view stats.");
        }

        const loadedSessions = await loadAllPracticeSessions(supabase, data.user.id);

        if (isMounted) {
          setSessions(loadedSessions);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load stats.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = useMemo(() => summarizeSessions(sessions), [sessions]);
  const chartData = useMemo(() => buildChartData(sessions, range), [sessions, range]);
  const best = useMemo(
    () =>
      sessions.length
        ? [...sessions].sort((a, b) => calculateSessionStats(b).hitRate - calculateSessionStats(a).hitRate)[0]
        : null,
    [sessions],
  );
  const worst = useMemo(
    () =>
      sessions.length
        ? [...sessions].sort((a, b) => calculateSessionStats(a).hitRate - calculateSessionStats(b).hitRate)[0]
        : null,
    [sessions],
  );
  const totalEnds = sessions.reduce((sum, session) => sum + session.ends.length, 0);
  const averageHitsPerEnd = totalEnds ? Number((total.totalHits / totalEnds).toFixed(1)) : 0;

  return (
    <AppShell activePath="/stats">
      <header className="topbar">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Progress charts</h1>
        </div>
        <select
          aria-label="Chart range"
          onChange={(event) => setRange(event.target.value as ChartRange)}
          style={{ maxWidth: 180 }}
          value={range}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </header>

      {error ? <p className="form-alert error">{error}</p> : null}

      <section className="stats-grid" aria-label="Analytics summary">
        <StatCard
          detail={`${total.totalHits} hits / ${total.totalArrows} arrows`}
          label="All practice"
          value={isLoading ? "..." : `${total.hitRate}%`}
        />
        <StatCard detail="hits per 4 arrows" label="Average end" value={averageHitsPerEnd.toFixed(1)} />
        <StatCard
          detail={best?.practiceDate ?? "No sessions yet"}
          label="Best session"
          value={best ? `${calculateSessionStats(best).hitRate}%` : "0%"}
        />
        <StatCard
          detail={worst?.practiceDate ?? "No sessions yet"}
          label="Worst session"
          value={worst ? `${calculateSessionStats(worst).hitRate}%` : "0%"}
        />
      </section>

      <StatsCharts data={chartData} />
    </AppShell>
  );
}
