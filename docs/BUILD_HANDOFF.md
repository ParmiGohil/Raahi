# Build handoff — Travel Disruption Recovery Engine

Read [the canonical roadmap](../HACKATHON_ROADMAP.md) first. This file retains the architectural checklist. The core application is implemented; use [current status](../CURRENT_STATUS.md), [verification evidence](VERIFICATION.md) and the actual code as implementation evidence.

## Current state

### Connected experience extension (27 September 2026)

Local branch `codex/raahi-connected-experience` extends main `0475d7c`. Routes: `/`, `/itinerary`, `/add-itinerary`, `/dependencies`, `/what-if`, `/recovery`. `TripProvider` shares revisioned server state; `journey.ts` supplies generic timing analysis, flexible rescheduling and health. Existing demo engine and copilot remain the source of Goa recovery offers. New API commands: `itinerary` and `disruption`; server validation rejects duplicate IDs, dangling/cyclic dependencies and stale revisions.

Keep the copilot simulated. PDF verification is a labeled sample workflow with no extraction/upload. Personal trips never inherit demo concert preferences or invented replacement inventory. The What-if page computes in memory only. The original demo costs and recovery ledgers remain separate: authored prepaid booking costs total ₹10,200 (flight ₹4,500, shuttle ₹400, hotel ₹3,800, concert ₹1,500).

Actual gate: 17 tests, TypeScript through production build, and browser flows passed. Health was verified at 87 → 21 → 75 for original → three-hour delay → protected-concert recovery. Read the latest CURRENT_STATUS entry for scope and limits. Preserve `.env` and `.raahi` data; local mode requires no external accounts. Do not assume large personal itineraries fit the existing hosting cookie adapter.

- User: a two-person hackathon team; Codex will help implement the product.
- Goal: a competitive, complete PS ID 2 prototype within the event deadline.
- Chosen default: a fictional Mumbai–Goa itinerary with a flight delay, missed shuttle, hotel check-in constraint, and timed event.
- Product: a recovery workspace with impact explanation, valid alternatives, a protected-event control, financial comparison, and itinerary update.
- Research complete: engine, provider access, competitors, demo strategy, and event context.
- Core code and browser journey are verified on `codex/raahi-core`. Ten focused tests pass. Deployment, provider accounts and production latency are not verified.
- Run with Node 24: `npm ci`, `npm run build`, `npm start`. Engine: `src/engine`; API: `src/app/api/trip/route.ts`; UI: `src/components`; local store: `src/repositories/trip.ts`.
- Plain CSS replaces the suggested Tailwind dependency. Local atomic JSON is the chosen fallback. No Supabase account has been connected.
- This task owns integration per the latest user decision. Build in batches; test at milestone gates, not after each edit.
- Published freeze: September 27, 2026, 11:00 AM IST. Use the actual remaining time; do not restart a 24-hour clock.

## Latest UI integration

The current experience is on `codex/raahi-experience`, stacked on the preserved core checkpoint `6ad2041`. The user requested UI/UX to be prioritized before the next deployment milestone. See `DESIGN_SYSTEM.md` for the logo/artwork, mobile behavior and design decisions. The engine/API contract is unchanged.

## Non-negotiable behavior

1. Do not recommend a plan that violates a known hard constraint.
2. Do not label unknown essential inventory/policies as confirmed.
3. Do not invent supplier schedules, fares, refunds, or booking confirmations.
4. Keep fixture, sandbox, live, cached, and inferred data visibly distinguishable.
5. Code computes timing, cost, impact, and state; an optional LLM interprets/explains.
6. Completed travel and current location constrain future repair.
7. Protecting the original event changes the feasible set.
8. Show fewer than three plans when appropriate, including zero with reasons.
9. Separate cash due now from later refunds and sunk prepaid losses.
10. An applied prototype plan updates the itinerary; supplier actions remain simulated/pending.

## Default technical choices

One Next.js/React/TypeScript repository; Tailwind; runtime schemas; pure TypeScript engine; Supabase PostgreSQL if a read/write test works within 30 minutes. Local persistent single-user JSON repository is the deadline fallback, with serialized atomic writes. Do not deploy that fallback to ephemeral serverless storage. Vitest for engine/scenarios; Playwright for the primary interaction. Reuse an existing working stack if the team already has one.

No graph database, separate Python service, vector store, microservices, or multi-agent product runtime. No real payment, ticketing, inbox integration, or universal booking modification.

Optional integrations: Open-Meteo first; at most one additional route/status/sandbox provider. Stop an optional provider after 45 minutes without a usable normalized response and fallback. Amadeus Self-Service is excluded following the current official portal notice.

## Shared module contract

Agree on schemas before splitting implementation:

```text
TripSnapshot { id, revision, clock, travelerState, bookings, dependencies, constraints }
DisruptionEvent { id, source, sourceVersion, effectiveAt, observedAt, affectedIds, change }
CandidateOffer { id, mode, times, places, capacity, money, policy, expiresAt }
Impact { bookingId, state, causeIds, reasonCode, readyAt, deadline, slack, evidence }
Plan { id, basedOnRevision, inputHash, changes, checks, ledger, metrics, actions }
RecoveryResult { impacts, feasiblePlans, conditionalPlans, rejections, searchStatus }
```

Use UTC instants plus IANA zones, integer monetary minor units, explicit null/unknown states, and provider timestamps. Define check-in as a discrete service/window rather than continuous hotel occupancy.

Recommended engine entry points:

```text
normalizeTrip(input)
applyDisruptions(snapshot, events)
evaluateImpacts(snapshot)
generateCandidates(snapshot, catalog)
validateWholeTrip(proposal, constraints, clock)
computeLedger(changes, policies)
rankDistinctPlans(validatedPlans, preferences)
recover(snapshot, events, preferences, catalog, clock)
applyPlan(planId, expectedRevision, idempotencyKey)
```

These are proposed interfaces, not existing exports. Keep the validator independent of the search implementation; test both against authored expected outcomes.

## Original foundation checklist (core now completed)

1. Inspect the actual workspace and any instructions; preserve existing work.
2. Recalculate time left and assign engine/UI ownership to the two people.
3. Read the exact [hero fixture](research/recovery-engine.md), choose a fixed scenario date/clock, and resolve all airport/place IDs.
4. Create domain schemas and fixture records, including policy evidence and expected impacts.
5. Build a plain app shell with a sample-trip timeline and disruption trigger.
6. Implement deterministic impact evaluation and at least one whole-trip validation path.
7. Display computed causes, not hardcoded red states.
8. Run baseline/delay checks and a browser smoke test. Record status and the next acceptance criterion.

The desired first milestone is a runnable vertical slice. Do not spend the first session on branding, login, a marketing landing page, or live airline onboarding.

## Subsequent implementation milestones

| Milestone | Acceptance criterion |
|---|---|
| M1 — connected trip | Baseline is valid; delay causes the expected impacts and leaves unrelated bookings unchanged |
| M2 — recovery | Candidate combinations are validated; exact fixture plans cost ₹800, ₹1,800, ₹2,300 |
| M3 — meaningful choice | Protect original 16:00 event → only ₹2,300 plan; cash limit below it → no listed feasible plan |
| M4 — completion | Review diff/ledger, apply idempotently, persist new revision, refresh and reset correctly |
| M5 — breadth | Shared event model handles cancellation, ongoing travel, and simultaneous-event fixtures |
| M6 — enrichment | Optional live/AI feature works with explicit provenance and timeout fallback |
| M7 — release | Scenario tests and browser flow pass; actual evidence, demo recording, slides, local backup and submission ready |

Implement M1–M4 before enrichment. Prefer the small exhaustive candidate search for the hero fixture; add bounded heuristic search only if the measured catalog needs it. Never claim global optimality.

Include one simple activity-cancellation variant in the P0 flow. Remaining M5 categories are prioritized breadth after the core works, not a reason to delay the release candidate. Report any category still unimplemented.

## Exact hero fixture checks

- Arrival changes 11:00 → 14:00; airport exit takes 30 minutes; original 12:00 shuttle cannot be caught.
- Before disruption, airport readiness 11:30 and shuttle cutoff 11:50 leave 20 minutes; a fixture 30-minute advisory threshold marks it tight without making it infeasible.
- Later-event budget plan: ₹500 transfer + ₹300 event change = ₹800; hotel rest is zero.
- Later-event hotel-first plan: ₹1,500 cab + ₹300 event change = ₹1,800; hotel rest is 45 minutes.
- Original-event plan: ₹1,200 cab + ₹600 onward cab + ₹200 luggage storage + ₹300 late check-in = ₹2,300.
- Original-event plan ready at venue 15:30, cutoff 15:45, event 16:00–17:30, hotel arrival 18:25, check-in completed 18:45.
- That plan requires fixture-confirmed luggage storage and an explicit late-check-in extension to 22:00.
- The original ₹400 shuttle is prepaid and lost; do not add it again to cash due.
- Included event pickup/return transfers, boarding cutoffs, and service/access times must be explicit. The budget option has a tight zero-slack hotel-to-pickup transition.
- Hotel rest is a declared comparison objective; without it the middle option can be dominated.

All amounts, schedules and policies here are authored test data. The appendix is authoritative for the full sequence; record any intentional fixture change in both places.

## Bounded Codex work packets

After the common contract is fixed, use separate file ownership for engine, UI, and integration tasks. Examples:

> Implement impact propagation and full-trip validation against the agreed schemas and authored fixtures. Return structured reasons, preserve completed travel, and include boundary tests. Do not change UI files or invent inventory.

> Build timeline, impact drawer and plan comparison from the existing RecoveryResult contract. Do not hardcode costs or valid-plan counts. Include loading, error and no-solution states.

> Implement versioned itinerary persistence and idempotent simulated plan application. Reject stale plans and preserve before/after snapshots. Do not execute supplier bookings.

> Review the integrated demo for timing, cost and state inconsistencies. Reproduce findings through scenarios or the UI, fix material issues within assigned files, and report what was actually checked.

Integrate one completed packet at a time where files overlap. Use branches/worktrees when useful, and review changes before merging. Keep dependency versions pinned in the lockfile; avoid major upgrades during the event.

## Evidence and session log

At each handoff, record:

```text
Time and deadline remaining:
Current working milestone:
Changed files / integration boundary:
Verified behaviors and actual commands:
Known failures / limitations:
Live vs fixture components:
Next concrete acceptance criterion:
Decisions that changed the roadmap:
```

Do not substitute a plan or generated test list for tests actually run. Keep the final pitch consistent with implementation evidence.

### Copilot + hosting preparation (26 September, ~20:50 IST)

Branch `codex/raahi-copilot-deploy` builds on UI `3ef49bc`. New components: `src/components/copilot.tsx`, authored adapter `src/demo/copilot.ts`, cookie repository `src/repositories/browser-session.ts`. New `copilot` command confirms scenario and preferences in one revision. Simulation is labeled; engine decisions remain deterministic. Hosting guide: `docs/HOSTING.md`. Vercel needs account login and a stable `RAAHI_SIGNING_SECRET` before deployment. No public URL yet. Cookie sessions are for isolated single-browser demos, not collaborative storage. Test gate: 13 tests and production build passed; integrated mobile confirmation/apply flow passed.
