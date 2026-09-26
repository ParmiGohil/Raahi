import {
  Plane,
  CarFront,
  Hotel,
  Music2,
  Luggage,
  Footprints,
  ChevronDown,
  TrainFront,
} from "lucide-react";
import type { Impact, Segment } from "../domain/types";
import { time, formatMoney } from "../engine/recover";
const icons = {
  flight: Plane,
  train: TrainFront,
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
      {[...segments].sort((a, b) => Date.parse(a.start) - Date.parse(b.start)).map((segment) => {
        const impact = impacts.find((i) => i.id === segment.id);
        const state = applied ? "unaffected" : (impact?.state ?? "unaffected");
        const Icon = segment.id === "walk" ? Footprints : icons[segment.kind];
        return (
          <li key={segment.id} className={`timeline-item ${state}`}>
            <div className="timeline-time">
              {time(segment.start)}
              <span>
                {time(segment.end)}
              </span>
              <small>{new Date(segment.start).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' })}</small>
            </div>
            <span className="timeline-icon">
              <Icon size={17} />
            </span>
            <details>
              <summary>
                <div>
                  <strong>{segment.title}</strong>
                  <span className={`status ${state}`}>
                    {applied
                      ? segment.id === "walk"
                        ? "Unchanged"
                        : "In your revised plan"
                      : labels[state]}
                  </span>
                </div>
                <ChevronDown size={14} className="disclosure-chevron" />
              </summary>
              <p>{applied ? segment.evidence : impact?.reason}</p>
              <p className="muted">
                {segment.from.toUpperCase()} → {segment.to.toUpperCase()}
                {segment.cutoff ? ` · cutoff ${time(segment.cutoff)}` : ""}
                {segment.windowEnd
                  ? ` · check-in by ${time(segment.windowEnd)}`
                  : ""}
              </p>
              {segment.reference && <p className="muted">Reference: {segment.reference}</p>}
              {segment.cost !== undefined && <p className="muted">Already-paid cost: {formatMoney(segment.cost)}</p>}
              {segment.priority && <p className="muted">Must-save commitment · original timing protected</p>}
              {segment.changeDeadline && <p className="muted">Your change deadline: {new Date(segment.changeDeadline).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })} IST. Provider policy unverified.</p>}
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
