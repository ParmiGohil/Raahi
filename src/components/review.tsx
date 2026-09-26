import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import type { Plan, Segment } from "../domain/types";
import { formatMoney, time } from "../engine/recover";
export function Review({
  plan,
  before,
  busy,
  onClose,
  onApply,
}: {
  plan: Plan | null;
  before: Segment[];
  busy: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (plan && !ref.current?.open) ref.current?.showModal();
    else if (!plan) ref.current?.close();
  }, [plan]);
  return (
    <dialog
      ref={ref}
      className="review-dialog"
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
              <h2>{plan.title}</h2>
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
          <p className="muted">
            Review the full route and costs. Applying updates this demo
            itinerary; supplier actions remain simulated and pending.
          </p>
          <div className="review-route">
            {plan.segments
              .filter((s) => s.id !== "walk")
              .map((s) => {
                const old = before.find((item) => item.id === s.id);
                const changed =
                  !old || old.start !== s.start || old.title !== s.title;
                return (
                  <div key={s.id}>
                    <span className="route-dot" />
                    <div>
                      <strong>{s.title}</strong>
                      <small>
                        {s.from.toUpperCase()} → {s.to.toUpperCase()}
                      </small>
                    </div>
                    <span>
                      {changed && old ? <del>{time(old.start)} </del> : null}
                      {time(s.start)}–{time(s.end)}
                    </span>
                  </div>
                );
              })}
          </div>
          {before
            .filter((old) => !plan.segments.some((s) => s.id === old.id))
            .map((s) => (
              <p className="muted" key={s.id}>
                Removed: {s.title} ({time(s.start)})
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
          <div className="review-footer">
            <span>Fixture inventory · review valid for 10 minutes</span>
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
