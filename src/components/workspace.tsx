"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FlaskConical,
  GitBranch,
  History,
  MapPin,
  Music2,
  Plane,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import type { Plan, Recovery, Scenario, TripState } from "../domain/types";
import { formatMoney } from "../engine/recover";
import { Brand } from "./brand";
import { Timeline } from "./timeline";
import { PlanCard } from "./plan-card";
import { Review } from "./review";
import { Copilot } from "./copilot";
type ResponseData = {
  state: Omit<TripState, "requests">;
  recovery: Recovery;
  quote: string;
  persistence?: "browser-session" | "local-server";
};
const scenarios = [
  {
    id: "delay",
    label: "Flight delayed 3 hours",
    short: "Flight delay",
    icon: Plane,
  },
  {
    id: "activity-cancelled",
    label: "Concert session cancelled",
    short: "Concert cancelled",
    icon: Music2,
  },
  {
    id: "delay-later-cancelled",
    label: "Delay + later session cancelled",
    short: "Combined disruption",
    icon: GitBranch,
  },
] as const;
export default function Workspace() {
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [budget, setBudget] = useState("3000");
  const [view, setView] = useState<"recovery" | "journey">("recovery");
  const [scenarioMenu, setScenarioMenu] = useState(false);
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
    if (!data || busy) return false;
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
      setScenarioMenu(false);
      if (command.action === "scenario") setView("recovery");
      if (["reset", "apply", "copilot"].includes(String(command.action)))
        navigate("recovery");
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection interrupted. Retry the action.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  function navigate(next: "recovery" | "journey") {
    setView(next);
    requestAnimationFrame(() => {
      const target = document.getElementById(next);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start" });
    });
  }
  const state = data?.state,
    recovery = data?.recovery,
    applied = state?.applied;
  const isDisrupted = !!state && state.scenario !== "original";
  const blocked =
    recovery?.impacts.filter((i) => i.state === "blocked").length ?? 0;
  const timeline = applied?.segments ?? recovery?.timeline ?? [];
  const budgetChanged =
    !!state && Math.round(Number(budget) * 100) !== state.preferences.budget;
  const activeScenario = scenarios.find((s) => s.id === state?.scenario);
  const sharedLoss =
    recovery?.plans.length &&
    recovery.plans.every(
      (p) => p.ledger.prepaidLoss === recovery.plans[0].ledger.prepaidLoss,
    )
      ? recovery.plans[0].ledger.prepaidLoss
      : 0;
  return (
    <div
      className={`app-shell ${isDisrupted ? "has-disruption" : ""} ${applied ? "has-recovery" : ""}`}
    >
      <a
        className="skip-link"
        href="#recovery"
        onClick={(event) => {
          event.preventDefault();
          navigate("recovery");
        }}
      >
        Skip to recovery workspace
      </a>
      <header className="topbar">
        <a href="/" aria-label="Raahi home">
          <Brand />
        </a>
        <nav aria-label="Main navigation">
          <button
            className={view === "recovery" ? "active" : ""}
            onClick={() => navigate("recovery")}
          >
            Trip workspace
          </button>
          <button
            className={view === "journey" ? "active" : ""}
            onClick={() => navigate("journey")}
          >
            My itinerary
          </button>
          <a href="#about">
            Behind the journey <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="header-right">
          <span className="demo-badge">
            <span /> Interactive demo
          </span>
          <span className="traveler-avatar" aria-label="Demo traveler">
            R
          </span>
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">THE JOURNEY IS STILL YOURS</p>
            <h1>
              Your Goa <em>getaway.</em>
            </h1>
          </div>
          <button
            className="button reset"
            onClick={() => mutate({ action: "reset" })}
            disabled={!state || busy}
          >
            <RefreshCw size={15} />
            <span>Reset demo</span>
          </button>
        </div>
        <section
          className={`destination-hero ${isDisrupted ? "compact" : ""}`}
          aria-label="Mumbai to Goa trip overview"
        >
          <Image
            src="/images/goa-coast.png"
            alt=""
            fill
            priority
            sizes="(max-width: 760px) 100vw, 1400px"
            className="destination-image"
          />
          <div className="destination-shade" />
          <div className="destination-copy">
            <div className="destination-label">
              <MapPin size={13} /> GOA, INDIA <span>26—27 SEPTEMBER</span>
            </div>
            <h2>
              {applied ? (
                "Back to the good part."
              ) : isDisrupted ? (
                "A detour. Still your destination."
              ) : (
                <>
                  Less worry.
                  <br />
                  <em>More wonder.</em>
                </>
              )}
            </h2>
            <p>
              {applied
                ? "Your new itinerary is saved. The next chapter is yours."
                : isDisrupted
                  ? "Let’s protect the moments you came for."
                  : "A seaside escape, a riverside concert, and a plan that moves with you."}
            </p>
          </div>
          <div className="trip-ticket">
            <div className="ticket-route">
              <div>
                <strong>BOM</strong>
                <span>Mumbai</span>
              </div>
              <span className="ticket-flight">
                <span />
                <Plane size={19} />
                <span />
              </span>
              <div>
                <strong>GOI</strong>
                <span>Goa · Dabolim</span>
              </div>
            </div>
            <div className="ticket-footer">
              <span>
                <Clock3 size={12} /> 2 days
              </span>
              <span>1 traveler</span>
              <span>IST</span>
            </div>
          </div>
        </section>
        <div className="workspace-toolbar">
          <ol className="workflow-steps" aria-label="Recovery progress">
            <li className="done">
              <span>
                <Check size={12} />
              </span>
              Connected trip
            </li>
            <li className={isDisrupted ? (applied ? "done" : "current") : ""}>
              <span>{applied ? <Check size={12} /> : "2"}</span>Find a way
            </li>
            <li className={applied ? "current" : selected ? "current" : ""}>
              <span>{applied ? <Check size={12} /> : "3"}</span>
              {applied ? "Itinerary updated" : "Review & recover"}
            </li>
          </ol>
          <span className="provenance">
            <FlaskConical size={13} /> Fictional trip · No real bookings
            {data?.persistence === "browser-session"
              ? " · Saved in this browser"
              : ""}
          </span>
        </div>
        {state && !applied && (
          <Copilot
            scenario={state.scenario}
            busy={busy}
            onApply={(draft) => mutate({ action: "copilot", ...draft })}
          />
        )}
        <nav className="mobile-tabs" aria-label="Workspace sections">
          <button
            aria-pressed={view === "recovery"}
            onClick={() => navigate("recovery")}
          >
            <Sparkles size={17} />
            {applied ? "Recovery" : "Your options"}
            {isDisrupted && !applied ? (
              <span>{recovery?.plans.length ?? 0}</span>
            ) : null}
          </button>
          <button
            aria-pressed={view === "journey"}
            onClick={() => navigate("journey")}
          >
            <Route size={17} />
            Itinerary <span>{timeline.length}</span>
          </button>
        </nav>
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
            <span className="loading-mark">
              <Brand compact />
            </span>
            <h2>A little clarity is on its way.</h2>
            <p>Connecting your journey…</p>
          </div>
        ) : (
          <>
            <div className="workspace-grid" data-view={view}>
              <aside
                id="journey"
                className="journey-column"
                tabIndex={-1}
                aria-label="Your itinerary"
              >
                <section className="panel itinerary">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">EVERY CONNECTION COUNTS</p>
                      <h2>Your itinerary</h2>
                    </div>
                    <span className="revision" title="Saved itinerary revision">
                      v{state!.revision}
                    </span>
                  </div>
                  <p className="itinerary-context">
                    {applied
                      ? "Your revised route · supplier actions pending"
                      : isDisrupted
                        ? "Original bookings, with the disruption shown"
                        : "One connected journey, from takeoff to tomorrow."}
                  </p>
                  <div className="date-strip">
                    <span>Sat, 26 Sep</span>
                    <span>All times in IST</span>
                  </div>
                  <Timeline
                    segments={timeline}
                    impacts={recovery!.impacts}
                    applied={!!applied}
                  />
                  <p className="timeline-footnote">
                    Open any stop to see timing and connection details.
                  </p>
                </section>
                <section className="proactive">
                  <ShieldCheck size={22} />
                  <div>
                    <p className="eyebrow">
                      {isDisrupted
                        ? "ORIGINAL CONNECTION RISK"
                        : "A HEADS-UP, NOT A HICCUP"}
                    </p>
                    <h3>That shuttle connection is tight.</h3>
                    <p>{recovery!.warning}</p>
                    <span>Scenario advisory · not a live forecast</span>
                  </div>
                </section>
              </aside>
              <div
                id="recovery"
                className="recovery-column"
                tabIndex={-1}
                role="region"
                aria-label="Recovery workspace"
              >
                <section
                  className={`simulator ${isDisrupted ? "condensed" : ""}`}
                >
                  <div className="simulator-heading">
                    <div>
                      <span className="scenario-icon">
                        <FlaskConical size={18} />
                      </span>
                      <div>
                        <h2>
                          {isDisrupted
                            ? activeScenario?.label
                            : "Put your plans to the test"}
                        </h2>
                        <p>Choose a disruption. See the whole trip respond.</p>
                      </div>
                    </div>
                    {isDisrupted && !applied ? (
                      <button
                        className="text-button"
                        aria-expanded={scenarioMenu}
                        aria-controls="scenario-controls"
                        onClick={() => setScenarioMenu(!scenarioMenu)}
                      >
                        Change scenario <ChevronDown size={14} />
                      </button>
                    ) : (
                      <span className="fixture-label">
                        09:00 IST · fixed clock
                      </span>
                    )}
                  </div>
                  {isDisrupted ? (
                    <div className="scenario-summary">
                      <span className="scenario-current">
                        <Plane size={14} />
                        {activeScenario?.label}
                      </span>
                      {!applied ? (
                        <span className="scenario-clock">
                          Fictional scenario
                        </span>
                      ) : (
                        <span className="status-saved">
                          <Check size={13} /> Explored
                        </span>
                      )}
                    </div>
                  ) : null}
                  <fieldset
                    id="scenario-controls"
                    disabled={busy || !!applied}
                    className={`scenario-buttons ${isDisrupted && !scenarioMenu ? "collapsed" : ""}`}
                  >
                    {scenarios.map(({ id, label, short, icon: Icon }) => (
                      <button
                        key={id}
                        aria-label={label}
                        title={label}
                        aria-pressed={state!.scenario === id}
                        className={`scenario-button ${state!.scenario === id ? "selected" : ""}`}
                        onClick={() =>
                          mutate({
                            action: "scenario",
                            scenario: id as Scenario,
                          })
                        }
                      >
                        <Icon size={18} />
                        <span>{short}</span>
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </fieldset>
                </section>
                {applied ? (
                  <section className="panel success-panel" aria-live="polite">
                    <div className="success-top">
                      <div className="success-icon">
                        <Check size={28} />
                      </div>
                      <span className="confirmation-badge">
                        ITINERARY SAVED
                      </span>
                    </div>
                    <p className="eyebrow">YOUR WAY FORWARD</p>
                    <h2>
                      Go make that <em>memory.</em>
                    </h2>
                    <p>
                      You chose <strong>{applied.title}</strong>. Your new route
                      is saved, including the moments you wanted to keep.
                    </p>
                    <div className="success-metrics">
                      <div>
                        <Wallet size={18} />
                        <strong>{formatMoney(applied.ledger.cashNow)}</strong>
                        <span>Planned cash needed</span>
                      </div>
                      <div>
                        <Music2 size={18} />
                        <strong>
                          {applied.originalEvent ? "16:00" : "18:00"}
                        </strong>
                        <span>Your concert session</span>
                      </div>
                    </div>
                    <button
                      className="button primary"
                      onClick={() => navigate("journey")}
                    >
                      See your updated itinerary <ArrowRight size={17} />
                    </button>
                    <p className="execution-note">
                      <FlaskConical size={16} />
                      This updates your demo itinerary. Supplier actions are
                      simulated and pending; nothing has been booked or
                      purchased.
                    </p>
                    <details className="validation">
                      <summary>
                        <History size={16} /> View recovery record{" "}
                        <ChevronDown size={15} />
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
                      className="text-button"
                      onClick={() => mutate({ action: "reset" })}
                      disabled={busy}
                    >
                      <RefreshCw size={14} />
                      Try another scenario
                    </button>
                  </section>
                ) : (
                  <>
                    {!isDisrupted ? (
                      <section className="panel ready-panel">
                        <div className="ready-copy">
                          <span className="feature-kicker">
                            <Sparkles size={15} /> TRAVEL WITH A WAY FORWARD
                          </span>
                          <h2>
                            Plans change.
                            <br />
                            <em>The good part doesn’t have to.</em>
                          </h2>
                          <p>
                            A delayed flight shouldn’t unravel your whole day.
                            We connect the dots, find the alternatives, and keep
                            your priorities in the picture.
                          </p>
                          <button
                            className="button primary"
                            disabled={busy}
                            onClick={() =>
                              mutate({ action: "scenario", scenario: "delay" })
                            }
                          >
                            Simulate flight delay <ArrowRight size={17} />
                          </button>
                          <span className="ready-footnote">
                            Try the 3-hour delay · no real bookings affected
                          </span>
                        </div>
                        <div
                          className="connection-story"
                          aria-label="Raahi connects your flight, hotel and concert"
                        >
                          <div className="story-flight">
                            <span className="story-icon">
                              <Plane size={22} />
                            </span>
                            <div>
                              <small>YOUR FLIGHT</small>
                              <strong>Mumbai → Goa</strong>
                              <span className="story-chip">One change…</span>
                            </div>
                          </div>
                          <div className="story-connector">
                            <span />
                            <GitBranch size={21} />
                            <span />
                          </div>
                          <div className="story-destinations">
                            <div>
                              <HotelGlyph />
                              <strong>A softer landing</strong>
                              <span>Your hotel</span>
                            </div>
                            <div>
                              <Music2 size={22} />
                              <strong>The moment that matters</strong>
                              <span>Your concert</span>
                            </div>
                          </div>
                          <p>
                            <ShieldCheck size={14} /> The whole trip, considered
                            together.
                          </p>
                        </div>
                      </section>
                    ) : (
                      <>
                        <section className="impact-banner">
                          <span className="impact-symbol">
                            <TriangleAlert size={21} />
                          </span>
                          <div>
                            <div className="impact-title">
                              <h3>
                                {state!.scenario === "activity-cancelled"
                                  ? "The 16:00 concert is cancelled."
                                  : "Landing later. Let’s reconnect the day."}
                              </h3>
                              <span className="impact-count">
                                {blocked} dependent{" "}
                                {blocked === 1 ? "item" : "items"}
                              </span>
                            </div>
                            <p>
                              {state!.scenario === "activity-cancelled" ? (
                                "The 18:00 session is available in our demo catalog. Your other plans can stay in place."
                              ) : (
                                <>
                                  Ready at <strong>14:30</strong>. Shuttle
                                  boarding closes at <strong>11:50</strong>.
                                  Your onward plans need a new connection.
                                </>
                              )}
                              {state!.scenario === "delay-later-cancelled"
                                ? " The later concert session is also unavailable."
                                : ""}
                            </p>
                            <details>
                              <summary>
                                Follow the ripple effect{" "}
                                <ChevronDown size={14} />
                              </summary>
                              <ol>
                                {recovery!.impacts
                                  .filter(
                                    (i) =>
                                      i.state === "blocked" ||
                                      i.state === "direct",
                                  )
                                  .map((i) => (
                                    <li key={i.id}>
                                      <span className="impact-node" />
                                      <div>
                                        <strong>
                                          {
                                            timeline.find((s) => s.id === i.id)
                                              ?.title
                                          }
                                        </strong>
                                        <p>{i.reason}</p>
                                      </div>
                                    </li>
                                  ))}
                              </ol>
                            </details>
                          </div>
                        </section>
                        <section className="panel preferences">
                          <div className="preferences-title">
                            <ShieldCheck size={16} />
                            <h2>Make it your kind of recovery.</h2>
                            <span>YOUR PRIORITIES</span>
                          </div>
                          <fieldset disabled={busy}>
                            <label className="protect-control">
                              <span>
                                <strong>Keep my 16:00 concert</strong>
                                <small>Protect the original session</small>
                              </span>
                              <input
                                type="checkbox"
                                role="switch"
                                aria-label="Protect the original 16:00 concert"
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
                              <span
                                className="switch-track"
                                aria-hidden="true"
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
                                Cash available now
                                <small>
                                  {budgetChanged
                                    ? "Unsaved change · select Update"
                                    : "Refunds later don’t add to this limit"}
                                </small>
                              </label>
                              <div className={budgetChanged ? "dirty" : ""}>
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
                                  className="budget-update"
                                  type="submit"
                                  aria-label="Update cash budget"
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
                              <p className="eyebrow">A FEW GOOD WAYS FORWARD</p>
                              <h2>Your recovery options</h2>
                            </div>
                            <span
                              className="count-badge"
                              role="status"
                              aria-live="polite"
                            >
                              <span />
                              {recovery!.plans.length}{" "}
                              {recovery!.plans.length === 1
                                ? "option fits"
                                : "options fit"}
                            </span>
                          </div>
                          {recovery!.plans.length ? (
                            <>
                              <div className="plan-grid">
                                {recovery!.plans.map((plan) => (
                                  <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    disabled={busy || budgetChanged}
                                    onReview={(p) => {
                                      applyKey.current = crypto.randomUUID();
                                      setError("");
                                      setSelected(p);
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="comparison-footnote">
                                <FlaskConical size={14} />
                                <p>
                                  {sharedLoss ? (
                                    <>
                                      Each plan carries the same{" "}
                                      <strong>
                                        {formatMoney(sharedLoss)} already-paid
                                        shuttle loss
                                      </strong>
                                      , excluded from cash above.{" "}
                                    </>
                                  ) : null}
                                  All availability, fares and policies are
                                  authored demo data.
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="panel no-solution">
                              <span className="no-solution-icon">
                                <ShieldCheck size={26} />
                              </span>
                              <h3>Your priorities deserve an honest answer.</h3>
                              <p>
                                No plan meets all your requirements. We won’t
                                quietly change what matters to you.
                              </p>
                              <div className="no-solution-actions">
                                <button
                                  className="button outline"
                                  onClick={() =>
                                    document.getElementById("budget")?.focus()
                                  }
                                >
                                  Adjust cash limit <ArrowRight size={15} />
                                </button>
                                {state!.preferences.protectOriginal ? (
                                  <button
                                    className="text-button"
                                    disabled={busy}
                                    onClick={() =>
                                      mutate({
                                        action: "preferences",
                                        preferences: {
                                          ...state!.preferences,
                                          protectOriginal: false,
                                        },
                                      })
                                    }
                                  >
                                    Allow a later concert
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          )}
                          {recovery!.rejections.length ? (
                            <details className="rejections">
                              <summary>
                                <ShieldCheck size={15} /> Why{" "}
                                {recovery!.rejections.length}{" "}
                                {recovery!.rejections.length === 1
                                  ? "option was"
                                  : "options were"}{" "}
                                ruled out <ChevronDown size={14} />
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
                <Brand compact />
                <div>
                  <h2>
                    A little intelligence.
                    <br />
                    <em>A lot of peace of mind.</em>
                  </h2>
                </div>
              </div>
              <div className="about-principles">
                <div>
                  <Route size={19} />
                  <strong>The whole trip</strong>
                  <p>Every stop and the connections between them.</p>
                </div>
                <div>
                  <ShieldCheck size={19} />
                  <strong>Your priorities</strong>
                  <p>Hard constraints stay hard. No hidden compromises.</p>
                </div>
                <div>
                  <Wallet size={19} />
                  <strong>Clear tradeoffs</strong>
                  <p>Know what changes and what you’ll need to pay.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <footer>
        <Brand compact />
        <p>For wherever the journey takes you.</p>
        <span>
          Made for travel resilience <span>✳</span> PS ID 2
        </span>
      </footer>
      <Review
        plan={selected}
        before={recovery?.timeline ?? []}
        busy={busy}
        error={error}
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
          <RefreshCw size={15} /> Finding your way forward…
        </div>
      ) : null}
    </div>
  );
}
function HotelGlyph() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M5 21V3h14v18M2 21h20M9 21v-5h6v5M8 7h2m4 0h2M8 11h2m4 0h2" />
    </svg>
  );
}
