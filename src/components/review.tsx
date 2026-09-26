import { useEffect, useId, useRef } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import type { Plan, Segment } from "../domain/types";
import { formatMoney, time } from "../engine/recover";
function segmentChanged(before: Segment, after: Segment) {
  return (
    (Object.keys(after) as (keyof Segment)[]).some((key) => {
      if (key === "requires") {
        return (
          before.requires.length !== after.requires.length ||
          before.requires.some((id) => !after.requires.includes(id))
        );
      }
      return before[key] !== after[key];
    }) ||
    (Object.keys(before) as (keyof Segment)[]).some((key) => !(key in after))
  );
}
export function Review({
  plan,
  before,
  busy,
  onClose,
  onApply,
  error,
}: {
  plan: Plan | null;
  before: Segment[];
  busy: boolean;
  onClose: () => void;
  onApply: () => void;
  error?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (plan && !ref.current?.open) ref.current?.showModal();
    else if (!plan) ref.current?.close();
  }, [plan]);
  return (
    <dialog
      ref={ref}
      className="review-dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else onClose();
      }}
      onClose={onClose}
    >
      {plan ? (
        <>
          <div className="review-heading">
            <div>
              <p className="eyebrow">Before you continue</p>
              <h2 id={titleId}>{plan.title}</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Close review"
              onClick={onClose}
              disabled={busy}
            >
              <X />
            </button>
          </div>
          <div className="review-body">
            <p className="muted">
              Review the full route and costs. Applying updates this demo
              itinerary; supplier actions remain simulated and pending.
            </p>
            <div className="review-route">
              {plan.segments
                .filter((s) => s.id !== "walk")
                .map((s) => {
                  const old = before.find((item) => item.id === s.id);
                  const changed = !old || segmentChanged(old, s);
                  return (
                    <div key={s.id}>
                      <span className="route-dot" />
                      <div>
                        <strong>{s.title}</strong>
                        {changed ? (
                          <span
                            className={`change-badge ${old ? "changed" : "added"}`}
                          >
                            {old ? "Changed" : "Added"}
                          </span>
                        ) : null}
                        <small>
                          {s.from.toUpperCase()} → {s.to.toUpperCase()}
                        </small>
                      </div>
                      <span>
                        {old && (old.start !== s.start || old.end !== s.end) ? (
                          <del>
                            {time(old.start)}–{time(old.end)}{" "}
                          </del>
                        ) : null}
                        {time(s.start)}–{time(s.end)}
                      </span>
                    </div>
                  );
                })}
            </div>
            {before
              .filter((old) => !plan.segments.some((s) => s.id === old.id))
              .map((s) => (
                <p className="removed-segment" key={s.id}>
                  <span className="change-badge removed">Removed</span>{" "}
                  {s.title} ({time(s.start)})
                </p>
              ))}
            <section className="ledger">
              <h3>Your cost breakdown</h3>
              {plan.ledger.items.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{formatMoney(item.amount)}</strong>
                </div>
              ))}
              <div className="ledger-total">
                <span>Cash needed now</span>
                <strong>{formatMoney(plan.ledger.cashNow)}</strong>
              </div>
              <div>
                <span>Future refunds</span>
                <span>{formatMoney(plan.ledger.futureRefund)}</span>
              </div>
              <div>
                <span>Already-paid loss · excluded from cash above</span>
                <span>{formatMoney(plan.ledger.prepaidLoss)}</span>
              </div>
            </section>
            <details className="validation">
              <summary>Why this plan works</summary>
              <ul>
                {plan.checks.map((check) => (
                  <li key={check}>
                    <CheckCircle2 size={14} />
                    {check}
                  </li>
                ))}
              </ul>
            </details>
            {plan.warnings.map((warning) => (
              <p className="notice amber" key={warning}>
                {warning}
              </p>
            ))}
            <p className="review-provenance">
              {plan.id === 'reschedule' ? 'User-entered timings · provider fees unverified' : 'Fixture inventory'} · review valid for 10 minutes
            </p>
          </div>
          <div className="review-footer">
            {error ? (
              <p className="notice error review-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="review-cash">
              <span>Cash needed now</span>
              <strong>{formatMoney(plan.ledger.cashNow)}</strong>
            </div>
            <button
              className="button primary"
              disabled={busy}
              onClick={onApply}
            >
              {busy ? "Updating…" : "Apply simulated recovery"}
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
