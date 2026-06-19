"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CalendarDayData, CalendarView } from "@/components/CalendarView";
import { SessionCard } from "@/components/SessionCard";
import { StatCard } from "@/components/StatCard";
import { calculateHitRate, summarizeSessions } from "@/lib/practice";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadPracticeSessionsInRange } from "@/lib/supabase/practice-data";
import type { PracticeSession } from "@/lib/types";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatSelectedDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function getMonthRange(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    startDate: toDateKey(first),
    endDate: toDateKey(last),
  };
}

function getStatusForRate(hitRate: number) {
  if (hitRate >= 70) {
    return "good";
  }

  if (hitRate >= 50) {
    return "warn";
  }

  return "danger";
}

export function CalendarPageView() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCalendar() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user) {
          throw userError ?? new Error("You must be logged in to view your calendar.");
        }

        const range = getMonthRange(monthDate);
        const loadedSessions = await loadPracticeSessionsInRange(supabase, data.user.id, range.startDate, range.endDate);

        if (isMounted) {
          setSessions(loadedSessions);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load calendar data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCalendar();

    return () => {
      isMounted = false;
    };
  }, [monthDate]);

  const sessionsByDate = useMemo(
    () =>
      sessions.reduce<Record<string, PracticeSession[]>>((groups, session) => {
        groups[session.practiceDate] = groups[session.practiceDate] ?? [];
        groups[session.practiceDate].push(session);
        return groups;
      }, {}),
    [sessions],
  );

  const dayData = useMemo(
    () =>
      Object.entries(sessionsByDate).reduce<Record<string, CalendarDayData>>((data, [date, dateSessions]) => {
        const stats = summarizeSessions(dateSessions);
        data[date] = {
          date,
          status: getStatusForRate(calculateHitRate(stats.totalHits, stats.totalArrows)),
        };
        return data;
      }, {}),
    [sessionsByDate],
  );

  const selectedSessions = sessionsByDate[selectedDate] ?? [];
  const selectedStats = summarizeSessions(selectedSessions);

  function changeMonth(offset: number) {
    setMonthDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      setSelectedDate(toDateKey(next));
      return next;
    });
  }

  return (
    <AppShell activePath="/calendar">
      <header className="topbar">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>Practice history</h1>
        </div>
        <div className="session-actions">
          <button className="ghost-action" onClick={() => changeMonth(-1)} type="button">
            Previous
          </button>
          <button className="ghost-action" onClick={() => changeMonth(1)} type="button">
            Next
          </button>
        </div>
      </header>

      {error ? <p className="form-alert error">{error}</p> : null}

      <section className="two-column-grid" style={{ marginTop: 32 }}>
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{isLoading ? "Loading" : formatMonthLabel(monthDate)}</p>
              <h2>Month view</h2>
            </div>
          </div>
          <CalendarView dayData={dayData} monthDate={monthDate} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </section>

        <section className="stack">
          <div className="stats-grid" style={{ margin: 0 }}>
            <StatCard detail="selected day" label="Date" value={formatSelectedDate(selectedDate)} />
            <StatCard
              detail={`${selectedStats.totalHits} / ${selectedStats.totalArrows} hits`}
              label="Hit rate"
              value={`${selectedStats.hitRate}%`}
            />
          </div>
          <section className="panel stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selected day</p>
                <h2>Sessions</h2>
              </div>
            </div>
            {selectedSessions.length ? (
              selectedSessions.map((session) => (
                <div className="stack" key={session.id}>
                  <SessionCard session={session} />
                  <p className="hint-text">{session.overallNote || "No session note."}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No practice on this day</h3>
                <p className="hint-text">Days with saved sessions will be colored by hit rate.</p>
              </div>
            )}
          </section>
        </section>
      </section>
    </AppShell>
  );
}
