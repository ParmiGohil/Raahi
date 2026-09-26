# Raahi — shared project memory

Updated 26 September 2026. This file contains the implementation context for new Codex tasks. The public repository is [ParmiGohil/Raahi](https://github.com/ParmiGohil/Raahi); use `main` as the shared baseline. It supersedes earlier handoff instructions that proposed creating a different repository.

## Objective and team

Build a competitive prototype for HackCelestial 3.0, **PS ID 2: Travel Disruption Recovery Engine**. The team has two people and plans to use Codex to implement frontend, backend and integrations. Geography is flexible; the recommended demo is a domestic Mumbai–Goa trip. Individual skills and API account availability have not been specified.

The full [problem statement](docs/PROBLEM_STATEMENT.md) asks for connected itineraries, disruption propagation, feasible recovery alternatives, cost/time/convenience comparison, itinerary updates and proactive warnings. It includes delays, cancellations, transfer failures, weather and traveler changes.

The published schedule runs from September 26 at 11:00 AM IST to September 27 at 11:00 AM IST, with a first-day mentor round at 6:00 PM. A working prototype or simulation is required. No weighted judging rubric was found in the reviewed official information. Recalculate remaining time and respect any newer organizer update. [Schedule](https://www.tech.alegria.co.in/schedule), [rules](https://www.tech.alegria.co.in/rules)

## Work already done

Parallel research covered the engine, travel APIs, and product/demo strategy. The synthesis is in [HACKATHON_ROADMAP.md](HACKATHON_ROADMAP.md); detailed sources are in `docs/research/`. The worked scenario's critical timing and cash arithmetic were checked, and a consistency review tightened scope and risk classifications.

The core application is now implemented on `codex/raahi-core`: deterministic engine, fixtures, API, local persistence and responsive recovery workspace. Ten engine/repository tests, production build and the integrated browser journey passed. See `docs/VERIFICATION.md` for actual evidence. No deployment, live provider or model integration is implemented. Earlier API research included a successful Open-Meteo read; authenticated travel providers were not tested with this team's accounts.

## Product decision

Build a recovery workspace around **protecting what matters to the traveler**:

`Trip → disruption → downstream impacts → valid alternatives → changes preview → updated itinerary`

The defining interaction is protecting the original event. Turning it into a hard requirement must filter the plans. A conflicting budget produces an explicit no-solution explanation, not a silently changed event.

Existing products already offer itinerary management and disruption assistance. Demonstrate transparent whole-trip repair and financial reasoning without claiming the product is the first or only solution.

## Scope

P0: a sample trip with 6–10 meaningful items; delay simulation and one simple activity-cancellation variant; computed impacts; up to three distinct feasible plans; budget/protected-event controls; ledger; diff; simulated apply/persist/reset; and one proactive warning.

After the full loop: simultaneous failures, hotel replacement, ongoing-trip fixtures and broader weather/transport scenarios. Optional enrichment is live weather plus at most one other route/status/sandbox provider. A structured language interpreter can be added after the core.

Defer real payments and ticketing, universal provider modifications, inbox integration, native apps, global inventory, graph database, microservices and multi-agent orchestration inside the product.

## Hero fixture

All following prices, times, policies and inventory are fictional test data. Use one explicitly chosen Goa airport and consistent locations; do not mix GOI and GOX. The [engine appendix](docs/research/recovery-engine.md) contains the complete sequences.

- Original flight arrival 11:00; airport exit takes 30 minutes.
- Original shuttle departs 12:00, cutoff 11:50, reaching the hotel at 13:00.
- Hotel check-in begins within 14:00–18:00 and takes 20 minutes.
- Original event 16:00–17:30, admission cutoff 15:45. Later session 18:00–19:30, cutoff 17:45, change fee ₹300.
- Event reservations include defined hotel pickup/return legs. Later-session hotel pickup is fixed at 16:35.
- Disruption changes flight arrival to 14:00; airport readiness becomes 14:30 and the original shuttle is missed.

| Recovery | Cash due now | Benefit |
|---|---:|---|
| Replacement shuttle and later event | ₹800 | Lowest cash; zero hotel rest before onward pickup |
| Cab to hotel and later event | ₹1,800 | 45 minutes of hotel rest |
| Direct to original event, then hotel | ₹2,300 | Original session preserved |

The last plan includes ₹1,200 outward cab, ₹600 onward cab, ₹200 bag storage and ₹300 late check-in. It reaches the venue at 15:20, finishes storage at 15:30, attends the event, retrieves bags until 17:40, reaches the hotel at 18:25 and finishes check-in at 18:45. It requires explicitly available storage and fixture-confirmed late check-in until 22:00.

The ₹800 plan has zero slack at its 16:35 hotel-to-pickup transition; label it tight. The ₹1,800 plan is distinct because rest is an explicit comparison dimension. Original shuttle prepayment ₹400 is lost in each plan and must not be added to cash due again.

Protect the original session: only ₹2,300 remains. Set cash below ₹2,300: no listed feasible plan. Before disruption, original shuttle slack is 20 minutes; an authored 30-minute advisory threshold marks it tight without making it infeasible.

## Technical decisions

Proposed stack: one Next.js/React/TypeScript app, Tailwind, runtime schemas, a pure TypeScript engine, hosted PostgreSQL if setup works promptly, Vitest and Playwright. This is a proposal; preserve a working team stack if one already exists.

Represent bookings, services/milestones, dependencies, disruptions, policies, offers, plans and revisions as structured data. Use UTC instants with IANA zones, integer monetary minor units and explicit unknown states. Hotel occupancy is an entitlement; check-in is a discrete service, so the room's multi-day duration does not conflict with every activity.

Recompute constraint impacts instead of marking every later booking canceled. Classify direct disruption, blocked, at risk, changed but feasible, unaffected and unknown. Preserve completed travel and current location. Jointly validate all active disruptions.

For the small catalog, use exhaustive candidate combinations with early pruning, a separate whole-trip validator, and diverse non-dominated choices. Do not force three plans or claim global optimality from bounded search. Explain missing data and no-solution states.

LLMs can interpret requests and explain computed results. Code determines times, feasibility, monetary arithmetic and mutations. Never invent inventory, policies or provider confirmations.

Show cash due now separately from later refunds, vouchers, eventual net cost and prepaid losses. Unknown policies remain unknown. Apply plans with revision/freshness checks and idempotency. A local itinerary update is distinct from supplier execution.

## Provider strategy

Use fixture data for the complete reproducible core. Add current weather as optional context. Route estimates are not taxi inventory; flight status is not ticket availability. Keep live, sandbox, fixture, cached and inferred data visibly distinct.

The current Amadeus portal reported Self-Service decommissioning; exclude it from the critical path. Duffel test mode is synthetic, Booking.com has partner prerequisites, and Indian rail booking access is not assumed. Stop optional provider onboarding after 45 minutes without a usable response and fallback. Read the [API appendix](docs/research/travel-apis.md) before choosing an integration.

## Collaboration and next work

Raahi was empty when adopted and the connected account had write permission. The initial public history includes project documentation only. The prior private repository and full conversation handoff are retained separately; do not merge or push their entire history into this public repository.

The latest user decision assigns implementation/integration to this Codex task without waiting on teammates. Core work is on `codex/raahi-core`. Other contributors should coordinate from that contract and use separate branches; avoid rebuilding the scaffold.

Next milestones: persistent public hosting, submission assets, and gated optional enrichment. The fixed fixture uses GOI and 26–27 September 2026. Remaining open details are provider access/budget, submission requirements and pitch duration. See [CURRENT_STATUS.md](CURRENT_STATUS.md) for subsequent implementation progress.

## Latest implementation direction

The user has asked this Codex task to own the complete implementation without waiting on teammates. Build in the ordered milestones in `docs/IMPLEMENTATION_PLAN.md`, committing each milestone. Use tokens for implementation and run focused tests at milestone boundaries, not after every edit. `CURRENT_STATUS.md` is the current implementation evidence; earlier planning-only statements above are historical.

## Latest UI milestone

The user authorized a full UI/UX redesign with parallel agents and image generation, and explicitly requested that the prior version be committed first. The clean, pushed checkpoint was `6ad2041`. All UI work is on `codex/raahi-experience`, keeping `codex/raahi-core` intact. The new design uses a native route-R logo, generated coastline artwork, ivory/teal palette, mobile recovery/itinerary switching and an accessible review sheet. Build and integrated browser checks passed; engine, server and persistence contracts were not changed. Read `CURRENT_STATUS.md` and `docs/DESIGN_SYSTEM.md` before continuing.
