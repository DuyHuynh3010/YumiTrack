"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { EndCard } from "@/components/EndCard";
import { calculateSessionStats } from "@/lib/practice";
import type { PracticeEnd, PracticeSession } from "@/lib/types";

type PracticeBuilderProps = {
  initialSession: PracticeSession;
};

export function PracticeBuilder({ initialSession }: PracticeBuilderProps) {
  const [session, setSession] = useState(initialSession);
  const [draft, setDraft] = useState<[boolean, boolean, boolean, boolean]>([true, false, true, true]);
  const [note, setNote] = useState("");

  const stats = useMemo(() => calculateSessionStats(session), [session]);
  const livePreview = draft.map((arrow) => (arrow ? "O" : "X")).join(" ");

  function addEnd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newEnd: PracticeEnd = {
      id: `end-${Date.now()}`,
      sessionId: session.id,
      arrows: [draft[0], draft[1], draft[2], draft[3]],
      note,
      createdAt: new Date().toISOString(),
    };

    setSession((current) => ({
      ...current,
      ends: [...current.ends, newEnd],
    }));
    setNote("");
  }

  return (
    <section className="panel session-builder">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Current session</p>
          <h2>{session.practiceDate}</h2>
        </div>
        <span className="pill">{stats.hitRate}% hit rate</span>
      </div>

      <label className="field">
        <span>Overall note</span>
        <textarea
          rows={3}
          value={session.overallNote}
          onChange={(event) => setSession((current) => ({ ...current, overallNote: event.target.value }))}
        />
      </label>

      <div className="end-list">
        {session.ends.map((end, index) => (
          <EndCard end={end} index={index} key={end.id} />
        ))}
      </div>

      <form className="end-form" onSubmit={addEnd}>
        <div className="form-heading">
          <h3>Add end</h3>
          <span className="live-preview">{livePreview}</span>
        </div>

        <div className="arrow-toggle-group" aria-label="Arrow result inputs">
          {draft.map((arrow, index) => (
            <button
              className={`arrow-toggle${arrow ? " active" : ""}`}
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

        <button className="secondary-action" type="submit">
          Add end
        </button>
      </form>
    </section>
  );
}
