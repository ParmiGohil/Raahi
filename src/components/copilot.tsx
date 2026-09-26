"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  FlaskConical,
  GitBranch,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { demoRequests, previewRequest } from "../demo/copilot";
import type { Preferences, Scenario } from "../domain/types";
import { formatMoney } from "../engine/recover";

const stages = [
  {
    title: "Read the connected journey",
    detail: "Flight, transfers, hotel and concert dependencies",
    icon: GitBranch,
  },
  {
    title: "Translate the request",
    detail: "Map the authored request to explicit trip constraints",
    icon: Sparkles,
  },
  {
    title: "Check what actually works",
    detail: "Run timing, cash and protected-event checks",
    icon: ShieldCheck,
  },
];
export function Copilot({
  scenario,
  busy,
  onApply,
}: {
  scenario: Scenario;
  busy: boolean;
  onApply: (draft: {
    scenario: Scenario;
    preferences: Preferences;
  }) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState(0);
  const [step, setStep] = useState(-1);
  const [failure, setFailure] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const result = useRef<HTMLElement>(null);
  const request = demoRequests[choice];
  const preview = previewRequest(request, scenario);
  const complete = step === stages.length;
  const running = step >= 0 && !complete;
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (!open || !running) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), 900);
    return () => window.clearTimeout(timer);
  }, [open, running, step]);
  useEffect(() => {
    if (complete)
      result.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [complete]);
  function close() {
    if (!busy) {
      setOpen(false);
      setStep(-1);
      setFailure("");
    }
  }
  return (
    <>
      <button
        className="copilot-launch"
        onClick={() => {
          setOpen(true);
          setStep(-1);
        }}
        disabled={busy}
      >
        <span className="copilot-symbol">
          <Sparkles size={21} />
        </span>
        <span className="copilot-launch-copy">
          <strong>A little help. A better way forward.</strong>
          <span>Tell Raahi what matters. Explore the AI copilot demo.</span>
        </span>
        <span className="copilot-launch-action">
          Try copilot <ArrowRight size={17} />
        </span>
      </button>
      <dialog
        className="copilot-dialog"
        ref={dialog}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        aria-labelledby="copilot-title"
      >
        <header className="copilot-header">
          <span>
            <Sparkles size={18} /> RAAHI COPILOT
          </span>
          <button
            className="icon-button"
            aria-label="Close copilot"
            onClick={close}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </header>
        <div className="copilot-scroll">
          <div className="copilot-intro">
            <span className="copilot-demo-label">
              <FlaskConical size={12} /> SIMULATED AI · LIVE ENGINE CHECKS
            </span>
            <h2 id="copilot-title">
              Plans changed.
              <br />
              <em>You’re still going.</em>
            </h2>
            <p>
              A preview of conversational trip recovery. Choose an example and
              watch your priorities become a plan.
            </p>
          </div>
          <div className="copilot-choices" aria-label="Example requests">
            {demoRequests.map((item, index) => (
              <button
                key={item.id}
                aria-pressed={choice === index}
                disabled={running || busy}
                onClick={() => {
                  setChoice(index);
                  setStep(-1);
                  setFailure("");
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <blockquote className="copilot-prompt">
            <span>YOUR REQUEST</span>
            <p>“{request.prompt}”</p>
          </blockquote>
          {step < 0 ? (
            <div className="copilot-start">
              <button className="button primary" onClick={() => setStep(0)}>
                <Sparkles size={16} /> Run demo request <ArrowRight size={16} />
              </button>
              <small>
                Authored examples. No model or supplier is connected.
              </small>
            </div>
          ) : (
            <>
              <ol className="copilot-pipeline">
                {stages.map((stage, index) => (
                  <li
                    key={stage.title}
                    className={
                      step > index
                        ? "complete"
                        : step === index
                          ? "working"
                          : "waiting"
                    }
                  >
                    <span className="copilot-stage-icon">
                      {step > index ? (
                        <Check size={17} />
                      ) : step === index ? (
                        <LoaderCircle size={17} />
                      ) : (
                        <stage.icon size={17} />
                      )}
                    </span>
                    <span>
                      <strong>{stage.title}</strong>
                      <small>{stage.detail}</small>
                    </span>
                    <span className="copilot-stage-status">
                      {step > index
                        ? "Done"
                        : step === index
                          ? "Demo replay"
                          : "Next"}
                    </span>
                  </li>
                ))}
              </ol>
              <div
                className="copilot-progress"
                role="progressbar"
                aria-label="Demo walkthrough progress"
                aria-valuenow={step}
                aria-valuemin={0}
                aria-valuemax={3}
              >
                <span style={{ width: `${(step / 3) * 100}%` }} />
              </div>
              <div role="status" className="sr-only">
                {complete
                  ? `${preview.recovery.plans.length} feasible recovery options found.`
                  : stages[step]?.title}
              </div>
              {complete && (
                <section ref={result} className="copilot-result">
                  <div className="copilot-result-title">
                    {preview.recovery.plans.length ? (
                      <CheckCheck size={21} />
                    ) : (
                      <ShieldCheck size={21} />
                    )}
                    <div>
                      <span>ENGINE-VERIFIED PREVIEW</span>
                      <h3>
                        {preview.recovery.plans.length
                          ? "There’s a way through."
                          : "These priorities don’t fit together."}
                      </h3>
                    </div>
                  </div>
                  <p>
                    {preview.recovery.plans.length
                      ? `${preview.recovery.plans.length} feasible ${preview.recovery.plans.length === 1 ? "option" : "options"} within your constraints. Review the details before applying a recovery.`
                      : "No option satisfies both priorities in this scenario. Raahi keeps your constraints intact; change the budget or event priority to explore alternatives."}
                  </p>
                  {preview.recovery.plans[0] && (
                    <div className="copilot-plan-preview">
                      <span>
                        <small>FEASIBLE RECOVERY</small>
                        <strong>{preview.recovery.plans[0].title}</strong>
                      </span>
                      <span>
                        <strong>
                          {formatMoney(
                            preview.recovery.plans[0].ledger.cashNow,
                          )}
                        </strong>
                        <small>extra cash needed</small>
                      </span>
                    </div>
                  )}
                  <div className="copilot-constraints">
                    <span>
                      <Wallet size={15} /> Cash limit{" "}
                      <strong>{formatMoney(preview.preferences.budget)}</strong>
                    </span>
                    <span>
                      <ShieldCheck size={15} /> 16:00 concert{" "}
                      <strong>
                        {preview.preferences.protectOriginal
                          ? "Protected"
                          : "May move"}
                      </strong>
                    </span>
                  </div>
                  {scenario === "original" && (
                    <small className="copilot-scenario-note">
                      This example also activates the three-hour flight-delay
                      scenario.
                    </small>
                  )}
                  <small className="copilot-scenario-note">
                    Preview only. Your itinerary has not changed.
                  </small>
                </section>
              )}
            </>
          )}
          {failure && (
            <p className="notice error" role="alert">
              {failure}
            </p>
          )}
        </div>
        <footer className="copilot-footer">
          <span>
            Model interpretation simulated.
            <br />
            Feasibility calculated by Raahi.
          </span>
          {complete ? (
            <button
              className="button primary"
              disabled={busy}
              onClick={async () => {
                setFailure("");
                if (
                  await onApply({
                    scenario: preview.scenario,
                    preferences: preview.preferences,
                  })
                ) {
                  setOpen(false);
                  setStep(-1);
                } else
                  setFailure(
                    "Could not apply this preview. Close and retry with the latest trip.",
                  );
              }}
            >
              {busy ? "Updating…" : "Use these preferences"}
              <ChevronRight size={16} />
            </button>
          ) : (
            <button className="button outline" onClick={close} disabled={busy}>
              {running ? "Cancel demo" : "Back to trip"}
            </button>
          )}
        </footer>
      </dialog>
    </>
  );
}
