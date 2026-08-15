"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { calculateEndHits } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadAllPracticeSessions } from "@/lib/supabase/practice-data";
import type { PracticeSession } from "@/lib/types";

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function buildCsv(sessions: PracticeSession[]) {
  const rows = [
    ["session_id", "practice_date", "finished_at", "end_number", "arrow_1", "arrow_2", "arrow_3", "arrow_4", "hits", "end_note", "session_note"],
  ];

  sessions.forEach((session) => {
    if (!session.ends.length) {
      rows.push([session.id, session.practiceDate, session.finishedAt ?? "", "", "", "", "", "", "", "", session.overallNote]);
      return;
    }

    session.ends.forEach((end, index) => {
      rows.push([
        session.id,
        session.practiceDate,
        session.finishedAt ?? "",
        String(index + 1),
        end.arrows[0] ? "O" : "X",
        end.arrows[1] ? "O" : "X",
        end.arrows[2] ? "O" : "X",
        end.arrows[3] ? "O" : "X",
        String(calculateEndHits(end)),
        end.note,
        session.overallNote,
      ]);
    });
  });

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function ExportPageView() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          throw userError ?? new Error("You must be logged in to export data.");
        }

        setSessions(await loadAllPracticeSessions(supabase, data.user.id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load export data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, []);

  function downloadCsv() {
    const csv = buildCsv(sessions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `yumitrack-export-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell activePath="/export">
      <header className="topbar">
        <div>
          <p className="eyebrow">Export</p>
          <h1>Practice data</h1>
        </div>
        <button className="primary-action" disabled={isLoading || !sessions.length} onClick={downloadCsv} type="button">
          Download CSV
        </button>
      </header>

      {error ? <p className="form-alert error">{error}</p> : null}

      <section className="panel" style={{ marginTop: 32 }}>
        {isLoading ? (
          <div className="skeleton-panel">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className="empty-state">
            <h3>{sessions.length ? `${sessions.length} sessions ready` : "No sessions to export"}</h3>
            <p className="hint-text">CSV includes session date, finished status, each end, arrow results, hits, and notes.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
