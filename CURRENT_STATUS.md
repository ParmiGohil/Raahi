# Current Raahi status

## Latest follow-up — Actual PDF import and connected UX

27 September 2026, approximately 02:45 IST (~8h15m before the documented freeze). Continues local `codex/raahi-connected-experience`.

Implemented: immediate per-booking saves, chronological auto-connections with explicit overrides, a 100-item local limit, real local PDF.js text extraction, paginated original-PDF canvas preview inside the drop area, per-field/source review and bulk schedule import. Draft form fields survive reload in the same tab. Actual PDF data and the optional fictional sample flow remain separate.

The supplied three-page Goa sample was verified in the browser: all 22 scheduled descriptions and start times across 12–15 November 2026 were extracted, saved, and persisted after reload. The PDF does not provide durations, booking prices/references or precise connection endpoints. Imports preserve that uncertainty; missing fields are not fabricated, and Trip Health remains unscored until timing/location data is complete. Scans and unsupported layouts still require manual review. No OCR or real AI was added.

Visual changes: 3D-styled cards with a looping bidirectional light, subtle hero motion, pause/reduced-motion support, green/yellow/red booking borders, larger protected-event checkbox, prominent teal quick actions, persisted local profile, and removal of the language toggle. Existing copilot component and authored adapter are unchanged.

Personal recovery preserves fixed event times. Two optional fictional transfer assumptions (10-minute pickup; 65% / 50% of the entered transfer duration, minimum 15 minutes; INR 1,200 / 1,800 each) are transparently labeled and checked against timings and budget. No options are offered when durations/locations are unknown or the fixed event cannot be reached. Existing Goa later-performance alternatives remain explicitly separate performances, not a shifted concert time.

Verification evidence: actual user-PDF import and 22-item reload persistence, exact decimal extraction from a labeled two-booking PDF, out-of-order chronology, profile save/reload, desktop motion/preview inspection. Final gate: 23 tests passed, production build including TypeScript passed, 390px mobile layout inspected, and browser error/warning log empty. Test disruption was cleared; all 22 imported items remain saved. The user-supplied PDF remains untouched in Downloads; it is not committed. Local hosting remains the supported mode for larger personal itineraries.


## Latest milestone — Connected pages and personal itineraries

27 September 2026, 00:45 IST (~10h15m before the documented freeze). Local branch `codex/raahi-connected-experience`, based on fetched main `0475d7c`. The older entries below are historical.

Implemented: six dedicated routes, shared session state, Try demo/Add my itinerary entry points, manual entry/editing, sample PDF verification queue, interactive dependency and buffer display, booking-specific disruptions, isolated What-if preview, and dynamic Trip Health. Existing copilot UI and authored AI adapter remain unchanged, as requested. No real model or provider connection was added.

Health uses actual engine impacts: start 95, subtract 4 per at-risk booking, 12 per directly affected booking, 10 per blocked booking; clamp to 0–95. Applied itineraries are re-analyzed with 8 points reserved for pending provider actions. Verified demo sequence: 87 original → 21 with flight delay → 75 after the protected-concert recovery. This is an explained planning indicator, not a success probability.

Personal recovery only moves explicitly flexible commitments, respects priority and location constraints, and otherwise returns no verified offer. PDF import loads editable sample fields, requires confirmation, and does not parse or upload documents. Navigation labels support EN/HI; detailed content stays English. Authored prepaid demo costs total ₹10,200; recovery cash/loss arithmetic is preserved.

Verification: 17 tests passed; production build including TypeScript passed under Node 24. Browser checks covered dedicated navigation, unchanged ₹2,300 copilot preview under ₹2,500, review/apply and health improvement, manual entry, personal flexible recovery, PDF sample verification/editing, reload persistence, and What-if isolation. Desktop and 390px mobile layouts inspected. Production preview runs on port 3001 in the separate `Raahi-main-demo` worktree; original `parmi` checkout is preserved. No publish/deploy was performed.

Next: user review of this local implementation, then integrate the intended branch if requested. Hosting still requires a persistence solution appropriate for larger personal itineraries; the existing encrypted-cookie demo adapter has size limits. Do not claim PDF extraction, full translation, live AI, or supplier execution.

Updated 26 September 2026, 20:14 IST (~14h46m remaining). Published freeze: 27 September, 11:00 IST.

## Repository and ownership

Public repository: ParmiGohil/Raahi. Working branch: `codex/raahi-experience`, based on the committed and pushed core checkpoint `6ad2041` on `codex/raahi-core`. The core review is PR #1; UI work is a separate stacked review. Main and the teammate's `parmi` branch currently contain only documentation: the earlier prototype was removed by its author. This task owns the implementation per the user's latest instruction. Private planning history remains separate.

## Milestones

- M0 complete: repository audit, architecture and ordered commit boundaries in `docs/IMPLEMENTATION_PLAN.md`.
- M1 complete: TypeScript scaffold, GOI fixture, dependency impacts, independent validator, exact recovery ledgers, cash/protected-event controls and cancellation variants. Engine scenario suite: 7 passed.
- M2 complete: isolated HTTP-only demo sessions, validated commands, server-side plan regeneration, 10-minute signed review, revision conflict handling, idempotency and atomic local JSON persistence. Repository gate: 3 tests passed.
- M3 complete: responsive dashboard, timeline details, causal explanation, scenario and preference controls, comparison, review modal and simulated application. Production build and six integrated browser assertions passed; reload preserved revision 8 and the selected plan. Desktop and 390px mobile layouts inspected.
- M4 complete locally: consolidated 10-test regression suite and typecheck passed; release evidence, run instructions and demo script are written. Core branch pushed; draft PR #1 is open.

Milestone checks: 10 engine/repository tests passed; full production build including TypeScript passed; integrated browser flow passed. The browser gate found and resolved Next URL normalization rejecting valid same-origin writes. System Node 23 is outside Vitest 5 support, so use Node 24 (`.nvmrc`). Testing happens at milestone gates, as requested.

Known limits: fixture inventory/policies; local single-process JSON persistence only; no real supplier execution, live provider or LLM integration; no public deployment yet. These remain explicit future milestones.

## Next milestones

1. Review/integrate this branch without overwriting teammate changes.
2. Add persistent hosting or a hosted database repository before publishing a public URL.
3. Prepare required submission slides and a backup recording.
4. Add optional live weather/model interpretation only after those delivery needs are covered.

See `docs/VERIFICATION.md` for actual test/browser evidence and `docs/DEMO_SCRIPT.md` for the three-minute walkthrough. No full test rerun is needed for the subsequent formatting/documentation-only changes.

## M5 — UI/UX redesign

Completed: custom route-inspired vector identity, original Goa-inspired generated image, ivory/teal design system, expressive destination typography, compact disruption header, mobile section navigation, priority switch and unsaved-budget indication, clearer financial comparisons, added/changed/removed review badges, accessible native review sheet with persistent total/action, keyboard skip navigation, and confirmation focus/scroll after applying. Engine/API/repository behavior is unchanged.

Checks actually run: production build including TypeScript passed. Complete six-assertion browser flow passed. Mobile section switching, skip-link focus, independently scrolling review body, visible apply footer, Escape dismissal, confirmation navigation and refresh persistence passed. Layouts inspected at 1440×1000, 1280×800 and 390×844; width checks passed at 320 and 768px too. Engine unit tests were not rerun for this UI-only milestone.

The original code remains available at `6ad2041`. Brand assets are committed separately from interaction/layout changes. See `docs/DESIGN_SYSTEM.md` for references, asset paths and the final generation prompt. Optional provider, deployment and submission work remains unchanged.

UI follow-up: removed the visible artwork caption at the user's request and increased the compact destination banner to 140px on desktop / 144px on mobile. Production build passed; no engine tests rerun for this small presentation edit.

## M6 — Simulated copilot and serverless preparation

26 September 2026, ~20:50 IST. Branch `codex/raahi-copilot-deploy`, based on committed UI checkpoint `3ef49bc`.

Implemented: prominently labeled simulated-AI copilot, three authored requests, cancellable timed workflow, actual engine-generated preview with cost/constraints, explicit preference confirmation, atomic scenario + preference command, protected-event/no-solution example, reduced-motion styles and mobile result scrolling. No real model calls, invented reasoning or provider execution.

Hosting preparation: Vercel selects encrypted/authenticated HTTP-only cookie persistence automatically; local Node keeps its file repository. Stable deployment signing secret required. Cookies support reload/cold-start persistence and per-browser isolation, but are not a collaborative database and do not guarantee cross-instance concurrent transactions. See `docs/HOSTING.md`.

Checks: 13 engine/repository/copilot/session tests passed; production build and TypeScript passed. Mobile integrated copilot flow verified read-only preview, atomic preferences, exact ₹2,300 recovery application and no horizontal overflow. Hosting account remains logged out: user sign-in requested. No public deployment URL yet. Next: complete Vercel authentication, configure deployment secret, publish and verify public URL; then prepare presentation/backup recording.

## Main integration and teammate handoff

The user authorized publishing the completed prototype to `main`. Remote main was still at the original documentation checkpoint `dfe3065`; it had no new teammate commits to reconcile. Integrate the complete public implementation history by fast-forward, preserving all milestone commits and leaving the teammate's `parmi` branch untouched. No private planning history is included.

`docs/LOCAL_SETUP.md` now contains fresh-clone and existing-clone commands, Node 24 setup, demo walkthrough, troubleshooting, branch collaboration and a Codex handoff prompt. Remaining delivery work: authenticate/configure/deploy to Vercel and verify the URL; build the PPT; rehearse and capture a backup demo; confirm submission requirements. No new feature work or regression rerun was needed for this documentation/integration milestone; the prior 13-test/build/browser evidence remains applicable.

UI follow-up: restored compact, normal-sized protected-event text and an 18px checkbox without the large inner card. Phone/tablet header now uses an accessible three-line navigation disclosure with close, outside-click and Escape dismissal. Production build passed; 390px browser check confirmed every navigation link is visible when open and the menu closes after navigation. No engine tests rerun for this UI-only change.
