import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Music2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Plan } from "../domain/types";
import { formatMoney, time } from "../engine/recover";
export function PlanCard({
  plan,
  onReview,
  disabled,
}: {
  plan: Plan;
  onReview: (plan: Plan) => void;
  disabled: boolean;
}) {
  const event = plan.segments.find((s) => s.id === "event" || s.priority || s.kind === 'activity');
  const personal = ['reschedule', 'simulated-cab', 'simulated-priority'].includes(plan.id);
  const simulated = plan.id.startsWith('simulated-');
  return (
    <article className={`plan-card ${plan.originalEvent ? "featured" : ""}`}>
      <div className="plan-tag">
        {plan.originalEvent ? (
          <ShieldCheck size={14} />
        ) : plan.restMinutes > 0 ? (
          <Clock3 size={14} />
        ) : (
          <Wallet size={14} />
        )}
        {simulated ? 'Simulated transfer · fixed event kept' : personal ? 'Flexible schedule repair' : plan.originalEvent
          ? "Original moment saved · earliest concert"
          : plan.restMinutes > 0
            ? "More breathing room"
            : "Lowest cash option"}
      </div>
      <h3>{plan.title}</h3>
      <p className="plan-subtitle">{plan.subtitle}</p>
      <div className="price">
        {formatMoney(plan.ledger.cashNow)}
        <span>{simulated ? 'simulated cash estimate' : 'cash needed now'}</span>
      </div>
      <dl className="plan-key-metrics">
        <div>
          <dt>
            <Music2 size={14} aria-hidden="true" /> {personal ? 'Event / activity' : 'Concert session'}
          </dt>
          <dd>{event ? time(event.start) : 'No event'}</dd>
        </div>
        <div>
          <dt>
            <Clock3 size={14} aria-hidden="true" /> {personal ? 'Commitments moved' : 'Rest at hotel'}
          </dt>
          <dd>{personal ? plan.changedIds.length : `${plan.restMinutes} min`}</dd>
        </div>
      </dl>
      {simulated && <details className="plan-details"><summary>Simulation assumptions</summary>{plan.warnings.slice(1).map(w => <p key={w}>{w}</p>)}</details>}
      <details className="plan-details">
        <summary>
          Changes & finances <ChevronDown size={14} aria-hidden="true" />
        </summary>
        <dl className="comparison">
          <div>
            <dt>Itinerary items changed*</dt>
            <dd>{plan.changedIds.length}</dd>
          </div>
          <div>
            <dt>Later refund</dt>
            <dd>{formatMoney(plan.ledger.futureRefund)}</dd>
          </div>
          <div>
            <dt>Prepaid loss</dt>
            <dd>{formatMoney(plan.ledger.prepaidLoss)}</dd>
          </div>
        </dl>
        <p className="plan-details-note">
          *Counts added, removed and modified services versus the original trip.
          Already-paid losses are separate from cash needed now.
        </p>
      </details>
      <p className={plan.warnings.length ? "plan-warning" : "plan-valid"}>
        {plan.warnings.length ? (
          plan.warnings[0]
        ) : (
          <>
            <Check size={14} /> All required timing checks pass
          </>
        )}
      </p>
      <button
        className={plan.originalEvent ? "button primary" : "button outline"}
        onClick={() => onReview(plan)}
        disabled={disabled}
      >
        Review this plan <ArrowRight size={16} />
      </button>
    </article>
  );
}
