"use client";

import { useState } from "react";
import { calculateEndHits } from "@/lib/practice";
import type { PracticeEnd } from "@/lib/types";

type EditableEndCardProps = {
  end: PracticeEnd;
  index: number;
  isSaving?: boolean;
  onDelete: (end: PracticeEnd) => void;
  onSave: (end: PracticeEnd, arrows: [boolean, boolean, boolean, boolean], note: string) => void;
};

export function EditableEndCard({ end, index, isSaving, onDelete, onSave }: EditableEndCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [arrows, setArrows] = useState<[boolean, boolean, boolean, boolean]>(end.arrows);
  const [note, setNote] = useState(end.note);

  function cancelEdit() {
    setArrows(end.arrows);
    setNote(end.note);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <article className="end-card editable-end-card">
        <span className="end-number">{index + 1}</span>
        <div className="arrow-row">
          {end.arrows.map((arrow, arrowIndex) => (
            <span className={`arrow-result${arrow ? " hit" : ""}`} key={`${end.id}-${arrowIndex}`}>
              {arrow ? "O" : "X"}
            </span>
          ))}
        </div>
        <span className="end-note">
          {calculateEndHits(end)}/4 - {end.note || "No note"}
        </span>
        <div className="inline-actions">
          <button className="ghost-action small-action" disabled={isSaving} onClick={() => setIsEditing(true)} type="button">
            Edit
          </button>
          <button className="danger-action small-action" disabled={isSaving} onClick={() => onDelete(end)} type="button">
            Delete
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="edit-panel">
      <div className="form-heading">
        <h3>Edit end {index + 1}</h3>
        <span className="live-preview">{arrows.map((arrow) => (arrow ? "O" : "X")).join(" ")}</span>
      </div>
      <div className="arrow-toggle-group" aria-label={`Edit end ${index + 1} arrows`}>
        {arrows.map((arrow, arrowIndex) => (
          <button
            className={`arrow-toggle${arrow ? " active" : ""}`}
            disabled={isSaving}
            key={arrowIndex}
            onClick={() =>
              setArrows((current) => {
                const next = [...current] as [boolean, boolean, boolean, boolean];
                next[arrowIndex] = !next[arrowIndex];
                return next;
              })
            }
            type="button"
          >
            {arrowIndex + 1}
            <span>{arrow ? "O" : "X"}</span>
          </button>
        ))}
      </div>
      <label className="field compact">
        <span>End note</span>
        <input onChange={(event) => setNote(event.target.value)} type="text" value={note} />
      </label>
      <div className="inline-actions">
        <button
          className="secondary-action small-action"
          disabled={isSaving}
          onClick={() => {
            onSave(end, arrows, note);
            setIsEditing(false);
          }}
          type="button"
        >
          Save
        </button>
        <button className="ghost-action small-action" disabled={isSaving} onClick={cancelEdit} type="button">
          Cancel
        </button>
      </div>
    </article>
  );
}
