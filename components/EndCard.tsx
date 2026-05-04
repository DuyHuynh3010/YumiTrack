import { calculateEndHits } from "@/lib/practice";
import type { PracticeEnd } from "@/lib/types";

type EndCardProps = {
  end: PracticeEnd;
  index: number;
};

export function EndCard({ end, index }: EndCardProps) {
  return (
    <article className="end-card">
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
    </article>
  );
}
