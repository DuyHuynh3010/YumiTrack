"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EndCard } from "@/components/EndCard";
import { StatCard } from "@/components/StatCard";
import { calculateSessionStats } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadPracticeSessionById } from "@/lib/supabase/practice-data";
import type { PracticeSession } from "@/lib/types";

type SessionDetailViewProps = {
  sessionId: string;
};

export function SessionDetailView({ sessionId }: SessionDetailViewProps) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stats = useMemo(() => (session ? calculateSessionStats(session) : null), [session]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          throw userError ?? new Error("You must be logged in to view this session.");
        }

        const loadedSession = await loadPracticeSessionById(supabase, data.user.id, sessionId);

        if (isMounted) {
          setSession(loadedSession);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load this session.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <AppShell activePath="/">
      <header className="topbar">
        <div>
          <p className="eyebrow">Session detail</p>
          <h1>{session?.practiceDate ?? "Practice record"}</h1>
        </div>
        <Link className="ghost-action" href="/">
          Back to dashboard
        </Link>
      </header>

      {isLoading ? (
        <section className="panel" style={{ marginTop: 32 }}>
          <p className="eyebrow">Loading session</p>
          <h2>Checking your practice record...</h2>
        </section>
      ) : null}

      {error ? <p className="form-alert error">{error}</p> : null}

      {!isLoading && !session ? (
        <section className="panel" style={{ marginTop: 32 }}>
          <div className="empty-state">
            <h3>Session not found</h3>
            <p className="hint-text">This record may not exist, or it may belong to another user.</p>
          </div>
        </section>
      ) : null}

      {session && stats ? (
        <>
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
              {session.overallNote || "No session note yet."}
            </p>
            <div className="end-list">
              {session.ends.map((end, index) => (
                <EndCard end={end} index={index} key={end.id} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
