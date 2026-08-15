"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EditableEndCard } from "@/components/EditableEndCard";
import { StatCard } from "@/components/StatCard";
import { calculateSessionStats } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deletePracticeEnd,
  deletePracticeSession,
  loadPracticeSessionById,
  updatePracticeEnd,
  updatePracticeSession,
} from "@/lib/supabase/practice-data";
import type { PracticeEnd, PracticeSession } from "@/lib/types";

type SessionDetailViewProps = {
  sessionId: string;
};

export function SessionDetailView({ sessionId }: SessionDetailViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [draftDate, setDraftDate] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
          setDraftDate(loadedSession?.practiceDate ?? "");
          setDraftNote(loadedSession?.overallNote ?? "");
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

  async function saveSessionDetails() {
    if (!session) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      await updatePracticeSession(supabase, session.id, {
        overallNote: draftNote,
        practiceDate: draftDate,
      });
      setSession((current) => (current ? { ...current, overallNote: draftNote, practiceDate: draftDate } : current));
      setMessage("Session details saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save session details.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleFinished() {
    if (!session) {
      return;
    }

    const nextFinishedAt = session.finishedAt ? null : new Date().toISOString();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      await updatePracticeSession(supabase, session.id, { finishedAt: nextFinishedAt });
      setSession((current) => (current ? { ...current, finishedAt: nextFinishedAt } : current));
      setMessage(nextFinishedAt ? "Session marked finished." : "Session reopened.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update session status.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeSession() {
    if (!session || !window.confirm("Delete this session and all of its ends?")) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      await deletePracticeSession(supabase, session.id);
      router.push("/");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete this session.");
      setIsSaving(false);
    }
  }

  async function saveEnd(end: PracticeEnd, arrows: [boolean, boolean, boolean, boolean], note: string) {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const updatedEnd = await updatePracticeEnd(supabase, end.id, arrows, note);
      setSession((current) =>
        current ? { ...current, ends: current.ends.map((item) => (item.id === end.id ? updatedEnd : item)) } : current,
      );
      setMessage("End updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update this end.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEnd(end: PracticeEnd) {
    if (!window.confirm("Delete this end?")) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      await deletePracticeEnd(supabase, end.id);
      setSession((current) => (current ? { ...current, ends: current.ends.filter((item) => item.id !== end.id) } : current));
      setMessage("End deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete this end.");
    } finally {
      setIsSaving(false);
    }
  }

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
        <section className="panel skeleton-panel" style={{ marginTop: 32 }}>
          <span />
          <span />
          <span />
        </section>
      ) : null}

      {error ? <p className="form-alert error">{error}</p> : null}
      {message ? <p className="form-alert success">{message}</p> : null}

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
            <StatCard detail={session.finishedAt ? "complete" : "active"} label="Status" value={session.finishedAt ? "Done" : "Open"} />
          </section>

          <section className="panel stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Manage session</p>
                <h2>Details</h2>
              </div>
              <span className="pill">{stats.totalMisses} misses</span>
            </div>
            <label className="field">
              <span>Practice date</span>
              <input onChange={(event) => setDraftDate(event.target.value)} type="date" value={draftDate} />
            </label>
            <label className="field">
              <span>Overall note</span>
              <textarea onChange={(event) => setDraftNote(event.target.value)} rows={3} value={draftNote} />
            </label>
            <div className="inline-actions">
              <button className="secondary-action small-action" disabled={isSaving} onClick={saveSessionDetails} type="button">
                Save details
              </button>
              <button className="ghost-action small-action" disabled={isSaving} onClick={toggleFinished} type="button">
                {session.finishedAt ? "Reopen session" : "Finish session"}
              </button>
              <button className="danger-action small-action" disabled={isSaving} onClick={removeSession} type="button">
                Delete session
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Ends</p>
                <h2>Practice record</h2>
              </div>
            </div>
            <div className="end-list">
              {session.ends.map((end, index) => (
                <EditableEndCard end={end} index={index} isSaving={isSaving} key={end.id} onDelete={removeEnd} onSave={saveEnd} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
