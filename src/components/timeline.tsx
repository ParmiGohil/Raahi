import {
  Plane,
  CarFront,
  Hotel,
  Music2,
  Luggage,
  Footprints,
  ArrowUpRight,
} from "lucide-react";
import type { Impact, Segment } from "../domain/types";
import { time } from "../engine/recover";
const icons = {
  flight: Plane,
  exit: Luggage,
  transfer: CarFront,
  checkin: Hotel,
  activity: Music2,
  storage: Luggage,
};
const labels = {
  direct: "Changed",
  blocked: "Needs repair",
  "at-risk": "Tight connection",
  unaffected: "On schedule",
};
export function Timeline({
  segments,
  impacts,
  applied,
}: {
  segments: Segment[];
  impacts: Impact[];
  applied: boolean;
}) {
  return (
    <ol className="timeline">
      {segments.map((segment) => {
        const impact = impacts.find((i) => i.id === segment.id);
        const state = applied ? "unaffected" : (impact?.state ?? "unaffected");
        const Icon = segment.id === "walk" ? Footprints : icons[segment.kind];
        return (
          <li key={segment.id} className={`timeline-item ${state}`}>
            <div className="timeline-time">
              {time(segment.start)}
              <span>
                {segment.id === "walk" ? "27 SEP" : time(segment.end)}
              </span>
            </div>
            <span className="timeline-icon">
              <Icon size={17} />
            </span>
            <details>
              <summary>
                <div>
                  <strong>{segment.title}</strong>
                  <span className={`status ${state}`}>
                    {applied ? "Updated itinerary" : labels[state]}
                  </span>
                </div>
                <ArrowUpRight size={14} />
              </summary>
              <p>{applied ? segment.evidence : impact?.reason}</p>
              <p className="muted">
                {segment.from.toUpperCase()} → {segment.to.toUpperCase()}
                {segment.cutoff ? ` · cutoff ${time(segment.cutoff)}` : ""}
                {segment.windowEnd
                  ? ` · check-in by ${time(segment.windowEnd)}`
                  : ""}
              </p>
              {!applied && impact?.causes.length ? (
                <p className="muted">
                  Depends on:{" "}
                  {impact.causes
                    .map((id) => segments.find((s) => s.id === id)?.title ?? id)
                    .join(", ")}
                </p>
              ) : null}
            </details>
          </li>
        );
      })}
    </ol>
  );
}
