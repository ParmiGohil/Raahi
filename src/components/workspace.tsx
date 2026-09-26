"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Compass,
  FlaskConical,
  GitBranch,
  History,
  MapPin,
  Plane,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { Plan, Recovery, Scenario, TripState } from "../domain/types";
import { formatMoney } from "../engine/recover";
import { Timeline } from "./timeline";
import { PlanCard } from "./plan-card";
import { Review } from "./review";
type ResponseData = {
  state: Omit<TripState, "requests">;
  recovery: Recovery;
  quote: string;
};
export default function Workspace() {
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [budget, setBudget] = useState("3000");
  const applyKey = useRef("");
  function receive(next: ResponseData) {
    setData(next);
    setBudget(String(next.state.preferences.budget / 100));
  }
  async function load(signal?: AbortSignal) {
    const response = await fetch("/api/trip", { signal, cache: "no-store" });
    const next = await response.json();
    if (!response.ok) throw new Error(next.error ?? "Could not load the trip.");
    receive(next);
  }
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).catch((e) => {
      if (e.name !== "AbortError") setError(e.message);
    });
    return () => controller.abort();
  }, []);
  async function mutate(command: Record<string, unknown>) {
    if (!data || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...command,
          expectedRevision: data.state.revision,
        }),
      });
      const next = await response.json();
      if (!response.ok) {
        await load();
        setSelected(null);
        throw new Error(next.error ?? "Could not update the trip.");
      }
      receive(next);
      setSelected(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection interrupted. Retry the action.",
      );
    } finally {
      setBusy(false);
    }
  }
  const state = data?.state;
  const recovery = data?.recovery;
  const applied = state?.applied;
  const isDisrupted = !!state && state.scenario !== "original";
  const blocked =
    recovery?.impacts.filter((i) => i.state === "blocked").length ?? 0;
  const timeline = applied?.segments ?? recovery?.timeline ?? [];
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Raahi home">
          <span className="brand-symbol">
            <Compass size={24} />
          </span>
          raahi<span className="brand-dot">.</span>
        </a>
        <nav>
          <a href="#journey" className="active">
            My journey
          </a>
          <a href="#recovery">Recovery workspace</a>
          <a href="#about">How it works</a>
        </nav>
        <span className="demo-badge">
          <FlaskConical size={14} /> Demo workspace
        </span>
      </header>
      <main>
        <div className="breadcrumb">
          Your travels <span>/</span> Mumbai to Goa <span>/</span> Trip
          workspace
        </div>
        <section className="trip-header">
          <div>
            <p className="eyebrow">
              <span className="live-dot" /> A little less worry. A lot more
              journey.
            </p>
            <h1>Goa, still on the cards.</h1>
            <p className="trip-meta">
              <MapPin size={15} /> Mumbai → Goa · GOI <span>•</span> 26–27 Sep
              2026 <span>•</span> 1 traveler
            </p>
          </div>
          <button
            className="button reset"
            onClick={() => mutate({ action: "reset" })}
            disabled={!state || busy}
          >
            <RefreshCw size={15} /> Reset demo
          </button>
        </section>
        <section
          className={`journey-banner ${applied ? "recovered" : isDisrupted ? "disrupted" : ""}`}
        >
          <div className="banner-copy">
            <span className="small-label">
              {applied
                ? "A WAY FORWARD, FOUND"
                : isDisrupted
                  ? "WHEN PLANS CHANGE"
                  : "YOUR CONNECTED JOURNEY"}
            </span>
            <h2>
              {applied
                ? "Your recovery itinerary is ready."
                : isDisrupted
                  ? "One disruption. A whole trip to protect."
                  : "A clear plan for every connection."}
            </h2>
            <p>
              {applied
                ? "Saved to this demo session. Supplier actions are simulated and pending."
                : isDisrupted
                  ? "See what needs attention, explore the tradeoffs, and keep what matters."
                  : "Your flight, transfers, stay and concert — connected in one place."}
            </p>
            <a
              href={isDisrupted ? "#recovery" : "#journey"}
              className="banner-link"
            >
              {isDisrupted
                ? "Explore your way forward"
                : "Explore your itinerary"}{" "}
              <ArrowDown size={16} />
            </a>
          </div>
          <div
            className="route-illustration"
            aria-label="Route diagram from Mumbai to Goa, not a geographic map"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="route-origin">
              <span className="route-dot" />
              <strong>BOM</strong>
              <small>Mumbai</small>
            </div>
            <div className="flight-path">
              <Plane size={27} />
            </div>
            <div className="route-destination">
              <MapPin size={28} />
              <strong>GOI</strong>
              <small>Goa</small>
            </div>
            <span className="route-caption">THE DESTINATION IS WORTH IT.</span>
          </div>
        </section>
        {error ? (
          <div className="notice error" role="alert">
            {error}
            {!data ? (
              <button
                className="button outline"
                onClick={() => {
                  setError("");
                  load().catch((e) => setError(e.message));
                }}
              >
                Retry loading
              </button>
            ) : null}
          </div>
        ) : null}
        {!data ? (
          <div className="loading" role="status">
            <Compass size={28} /> Connecting your journey…
          </div>
        ) : (
          <>
            <div className="workspace-grid">
              <aside id="journey" className="journey-column">
                <section className="panel itinerary">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">The full picture</p>
                      <h2>Your itinerary</h2>
                    </div>
                    <span className="revision">v{state!.revision}</span>
                  </div>
                  <div className="date-strip">
                    <span>Saturday, 26 September</span>
                    <span>IST</span>
                  </div>
                  <Timeline
                    segments={timeline}
                    impacts={recovery!.impacts}
                    applied={!!applied}
                  />
                  <p className="timeline-footnote">
                    Select an item to inspect its connection and evidence.
                  </p>
                </section>
                <section className="proactive">
                  <span className="proactive-icon">
                    <ShieldCheck size={21} />
                  </span>
                  <div>
                    <h3>A heads-up before takeoff</h3>
                    <p>{recovery!.warning}</p>
                    <small>
                      Authored advisory · not a probability forecast
                    </small>
                  </div>
                </section>
              </aside>
              <div id="recovery" className="recovery-column">
                <section className="panel simulator">
                  <div className="section-heading">
                    <div className="heading-with-icon">
                      <FlaskConical size={18} />
                      <h2>Explore a disruption</h2>
                    </div>
                    <span className="fixture-label">Fictional scenario</span>
                  </div>
                  <p className="muted">
                    A fixed 09:00 IST scenario clock. No real bookings are
                    affected.
                  </p>
                  <fieldset
                    disabled={busy || !!applied}
                    className="scenario-buttons"
                  >
                    {(
                      [
                        {
                          id: "delay",
                          label: "Flight delayed 3 hours",
                          icon: Plane,
                        },
                        {
                          id: "activity-cancelled",
                          label: "Concert session cancelled",
                          icon: TriangleAlert,
                        },
                        {
                          id: "delay-later-cancelled",
                          label: "Delay + later session cancelled",
                          icon: GitBranch,
                        },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        className={`scenario-button ${state!.scenario === id ? "selected" : ""}`}
                        onClick={() =>
                          mutate({
                            action: "scenario",
                            scenario: id as Scenario,
                          })
                        }
                      >
                        <Icon size={16} />
                        {label}
                        {state!.scenario === id ? <Check size={15} /> : null}
                      </button>
                    ))}
                  </fieldset>
                </section>
                {applied ? (
                  <section className="panel success-panel" aria-live="polite">
                    <div className="success-icon">
                      <Check size={28} />
                    </div>
                    <p className="eyebrow">Recovery itinerary updated</p>
                    <h2>More journey. Less juggling.</h2>
                    <p>
                      You chose <strong>{applied.title}</strong>. Your revised
                      route is saved and will remain here when you refresh.
                    </p>
                    <div className="success-metrics">
                      <div>
                        <strong>{formatMoney(applied.ledger.cashNow)}</strong>
                        <span>Planned cash needed</span>
                      </div>
                      <div>
                        <strong>
                          {applied.originalEvent ? "16:00" : "18:00"}
                        </strong>
                        <span>Concert session</span>
                      </div>
                    </div>
                    <p className="notice amber">
                      Provider actions pending. No ticket, taxi, room or refund
                      has been purchased or confirmed.
                    </p>
                    <details className="validation">
                      <summary>
                        <History size={16} /> View recovery record
                      </summary>
                      {state!.history.map((entry) => (
                        <div key={entry.revision}>
                          <p>
                            Revision {entry.revision} · {entry.label}
                          </p>
                          <ul>
                            {entry.actions.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </details>
                    <button
                      className="button outline"
                      onClick={() => mutate({ action: "reset" })}
                      disabled={busy}
                    >
                      Try another scenario <RefreshCw size={15} />
                    </button>
                  </section>
                ) : (
                  <>
                    {!isDisrupted ? (
                      <section className="panel ready-panel">
                        <div className="ready-icon">
                          <Sparkles size={27} />
                        </div>
                        <p className="eyebrow">Ready when plans aren’t</p>
                        <h2>Find your way forward.</h2>
                        <p>
                          Simulate a disruption above. Raahi traces its impact
                          across the trip and compares repairs around your time,
                          budget and priorities.
                        </p>
                        <div className="flow-steps">
                          <span>
                            01 <strong>Understand</strong>
                          </span>
                          <ArrowRight size={16} />
                          <span>
                            02 <strong>Compare</strong>
                          </span>
                          <ArrowRight size={16} />
                          <span>
                            03 <strong>Recover</strong>
                          </span>
                        </div>
                        <button
                          className="button primary"
                          disabled={busy}
                          onClick={() =>
                            mutate({ action: "scenario", scenario: "delay" })
                          }
                        >
                          Simulate flight delay <ArrowRight size={16} />
                        </button>
                      </section>
                    ) : (
                      <>
                        <section className="impact-banner">
                          <TriangleAlert size={22} />
                          <div>
                            <h3>
                              {state!.scenario === "activity-cancelled"
                                ? "Your original concert session is unavailable."
                                : "Arrival moved to 14:00. Your shuttle won’t wait."}
                            </h3>
                            <p>
                              {state!.scenario === "activity-cancelled"
                                ? "The 18:00 session is available in the fixture catalog. Protecting 16:00 will leave no feasible repair."
                                : `${blocked} connected itinerary items need repair. Airport-ready at 14:30 is after the shuttle’s 11:50 cutoff.`}
                            </p>
                            {state!.scenario === "delay-later-cancelled" ? (
                              <p>
                                The later concert is also cancelled; only the
                                original-session route can work.
                              </p>
                            ) : null}
                            <details>
                              <summary>See how the impact travels</summary>
                              <ol>
                                {recovery!.impacts
                                  .filter(
                                    (i) =>
                                      i.state === "blocked" ||
                                      i.state === "direct",
                                  )
                                  .map((i) => (
                                    <li key={i.id}>
                                      <strong>
                                        {
                                          timeline.find((s) => s.id === i.id)
                                            ?.title
                                        }
                                      </strong>
                                      <span>{i.reason}</span>
                                    </li>
                                  ))}
                              </ol>
                            </details>
                          </div>
                        </section>
                        <section className="panel preferences">
                          <div className="section-heading">
                            <div>
                              <p className="eyebrow">
                                Your priorities lead the way
                              </p>
                              <h2>What matters most?</h2>
                            </div>
                            <ShieldCheck size={21} />
                          </div>
                          <fieldset disabled={busy}>
                            <label className="protect-control">
                              <span>
                                <strong>
                                  Protect the original 16:00 concert
                                </strong>
                                <small>
                                  Keep this session as a hard requirement.
                                </small>
                              </span>
                              <input
                                type="checkbox"
                                checked={state!.preferences.protectOriginal}
                                onChange={(e) =>
                                  mutate({
                                    action: "preferences",
                                    preferences: {
                                      ...state!.preferences,
                                      protectOriginal: e.target.checked,
                                    },
                                  })
                                }
                              />
                            </label>
                            <form
                              className="budget-control"
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (Number.isFinite(Number(budget)))
                                  mutate({
                                    action: "preferences",
                                    preferences: {
                                      ...state!.preferences,
                                      budget: Math.round(Number(budget) * 100),
                                    },
                                  });
                              }}
                            >
                              <label htmlFor="budget">
                                Cash available now{" "}
                                <span>
                                  Refunds later don’t increase this limit.
                                </span>
                              </label>
                              <div>
                                <span>₹</span>
                                <input
                                  id="budget"
                                  aria-label="Cash available now"
                                  type="number"
                                  min="0"
                                  max="100000"
                                  step="1"
                                  required
                                  value={budget}
                                  onChange={(e) => setBudget(e.target.value)}
                                />
                                <button
                                  className="button outline"
                                  type="submit"
                                >
                                  Update
                                </button>
                              </div>
                            </form>
                          </fieldset>
                        </section>
                        <section className="options" aria-busy={busy}>
                          <div className="section-heading">
                            <div>
                              <p className="eyebrow">
                                Different routes. Clear tradeoffs.
                              </p>
                              <h2>Your recovery options</h2>
                            </div>
                            <span className="count-badge" aria-live="polite">
                              {recovery!.plans.length} feasible
                            </span>
                          </div>
                          {recovery!.plans.length ? (
                            <>
                              <div className="plan-grid">
                                {recovery!.plans.map((plan) => (
                                  <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    disabled={busy}
                                    onReview={(p) => {
                                      applyKey.current = crypto.randomUUID();
                                      setSelected(p);
                                    }}
                                  />
                                ))}
                              </div>
                              <p className="comparison-footnote">
                                *Changed items include added, removed and
                                modified services versus the original itinerary.
                                Cash excludes already-paid losses. All inventory
                                and policies are fixtures.
                              </p>
                            </>
                          ) : (
                            <div className="panel no-solution">
                              <ShieldCheck size={28} />
                              <h3>No plan meets all your requirements.</h3>
                              <p>
                                We kept your hard constraints. Increase the cash
                                limit, unprotect the original session, or reset
                                to explore another disruption.
                              </p>
                            </div>
                          )}
                          {recovery!.rejections.length ? (
                            <details className="rejections">
                              <summary>
                                Why {recovery!.rejections.length}{" "}
                                {recovery!.rejections.length === 1
                                  ? "option was"
                                  : "options were"}{" "}
                                ruled out
                              </summary>
                              {recovery!.rejections.map((rejection) => (
                                <div key={rejection.title}>
                                  <strong>{rejection.title}</strong>
                                  <ul>
                                    {rejection.reasons.map((reason) => (
                                      <li key={reason}>{reason}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </details>
                          ) : null}
                        </section>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <section id="about" className="about-strip">
              <div>
                <Compass size={21} />
                <strong>Built around the whole trip.</strong>
              </div>
              <p>
                Connected dependencies → timing & policy checks → feasible
                alternatives → a revised itinerary. Deterministic decisions,
                with evidence you can inspect.
              </p>
              <span>
                Fixture data · Local demo persistence · Simulated actions
              </span>
            </section>
          </>
        )}
      </main>
      <footer>
        <span className="brand footer-brand">raahi.</span>
        <p>A way forward, wherever you’re headed.</p>
        <span>Travel resilience · PS ID 2</span>
      </footer>
      <Review
        plan={selected}
        before={recovery?.timeline ?? []}
        busy={busy}
        onClose={() => setSelected(null)}
        onApply={() => {
          if (selected && data)
            mutate({
              action: "apply",
              planId: selected.id,
              idempotencyKey: applyKey.current,
              quote: data.quote,
            });
        }}
      />
      {busy ? (
        <div className="saving" role="status">
          <RefreshCw size={14} /> Updating your journey…
        </div>
      ) : null}
    </div>
  );
}
