"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { EndCard } from "@/components/EndCard";
import { calculateSessionStats } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createPracticeEnd,
  createPracticeSession,
  loadLatestSessionForDate,
  updatePracticeSessionNote,
} from "@/lib/supabase/practice-data";
import type { PracticeSession } from "@/lib/types";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PracticeBuilder() {
  const practiceDate = getLocalDate();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<[boolean, boolean, boolean, boolean]>([true, false, true, true]);
  const [note, setNote] = useState("");
  const [overallNote, setOverallNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => (session ? calculateSessionStats(session) : null), [session]);
  const livePreview = draft.map((arrow) => (arrow ? "O" : "X")).join(" ");

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          throw userError ?? new Error("You must be logged in to record practice.");
        }

        const loadedSession = await loadLatestSessionForDate(supabase, data.user.id, practiceDate);

        if (!isMounted) {
          return;
        }

        setUserId(data.user.id);
        setSession(loadedSession);
        setOverallNote(loadedSession?.overallNote ?? "");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load today's practice.");
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
  }, [practiceDate]);

  async function startNewSession() {
    if (!userId) {
      return null;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const newSession = await createPracticeSession(supabase, userId, practiceDate);
      setSession(newSession);
      setOverallNote("");
      setMessage("New practice session started.");
      return newSession;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not start a new session.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function ensureSession() {
    return session ?? startNewSession();
  }

  async function saveOverallNote() {
    const currentSession = await ensureSession();

    if (!currentSession) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      await updatePracticeSessionNote(supabase, currentSession.id, overallNote);
      setSession((current) => (current ? { ...current, overallNote } : current));
      setMessage("Session note saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the session note.");
    } finally {
      setIsSaving(false);
    }
  }

  async function addEnd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      return;
    }

    const currentSession = await ensureSession();

    if (!currentSession) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const newEnd = await createPracticeEnd(supabase, userId, currentSession.id, draft, note.trim());

      setSession((current) => (current ? { ...current, ends: [...current.ends, newEnd] } : current));
      setNote("");
      setMessage("End saved to Supabase.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this end.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="panel">
        <p className="eyebrow">Loading practice</p>
        <h2>Checking today's session...</h2>
      </section>
    );
  }

  return (
    <section className="panel session-builder">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{session ? "Current session" : "No session yet"}</p>
          <h2>{practiceDate}</h2>
        </div>
        <div className="session-actions">
          {stats ? <span className="pill">{stats.hitRate}% hit rate</span> : null}
          <button className="ghost-action" disabled={isSaving || !userId} onClick={startNewSession} type="button">
            Start new session
          </button>
        </div>
      </div>

      <label className="field">
        <span>Overall note</span>
        <textarea
          onChange={(event) => setOverallNote(event.target.value)}
          placeholder="Write a note about today's practice"
          rows={3}
          value={overallNote}
        />
      </label>
      <button className="ghost-action note-save-action" disabled={isSaving || !userId} onClick={saveOverallNote} type="button">
        Save note
      </button>

      {error ? <p className="form-alert error">{error}</p> : null}
      {message ? <p className="form-alert success">{message}</p> : null}

      {session?.ends.length ? (
        <div className="end-list">
          {session.ends.map((end, index) => (
            <EndCard end={end} index={index} key={end.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No ends recorded yet</h3>
          <p className="hint-text">Set the four arrow results below and save your first end.</p>
        </div>
      )}

      <form className="end-form" onSubmit={addEnd}>
        <div className="form-heading">
          <h3>Add end</h3>
          <span className="live-preview">{livePreview}</span>
        </div>

        <div className="arrow-toggle-group" aria-label="Arrow result inputs">
          {draft.map((arrow, index) => (
            <button
              className={`arrow-toggle${arrow ? " active" : ""}`}
              disabled={isSaving}
              key={index}
              onClick={() =>
                setDraft((current) => {
                  const next = [...current] as [boolean, boolean, boolean, boolean];
                  next[index] = !next[index];
                  return next;
                })
              }
              type="button"
            >
              {index + 1}
              <span>{arrow ? "O" : "X"}</span>
            </button>
          ))}
        </div>

        <label className="field compact">
          <span>End note</span>
          <input onChange={(event) => setNote(event.target.value)} placeholder="Example: second shot rushed" type="text" value={note} />
        </label>

        <button className="secondary-action" disabled={isSaving || !userId} type="submit">
          {isSaving ? "Saving..." : "Save end"}
        </button>
      </form>
    </section>
  );
}
