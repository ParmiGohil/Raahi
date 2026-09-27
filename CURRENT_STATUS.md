# Current Raahi status

## Optional traveler profile — 27 September 2026

Expanded the local profile with optional recovery priority, travel pace, transport and stay preferences, interests, and a short free-text note. Existing saved name, email, home city, and travel style are preserved. All fields can be left blank. The recovery priority only reorders the existing valid plan cards (lower cost, more rest, keeping experiences, or fewer changes); feasibility, budget, protected events, and the simulated copilot are unchanged. Other preferences are saved for later personalization and are not claimed to affect recommendations yet.

Verification: 42 tests and TypeScript passed; production build passed under Node 24. The updated profile rendered in the browser at http://127.0.0.1:3001/profile with the previously saved profile intact. No GitHub commit or push.

## Live forecast and Nugen integration work — 27 September 2026, 06:30 IST

Layout/styling preserved. Added optional tomorrow-only Goa demo copy in Weather Twin (does not persist), exact forecast-hour matching, automatic recomputation of displayed forecast preview on weather refresh, real 40-member ICON ensemble spread and newly-blocked scenario fractions with explicit uncalibrated disclaimer. Fixed public social endpoint to api.bsky.app; weather relevance filter excludes obvious music noise, historical fallback labelled by date. Real API verification: 168 forecast hours, 40 ensemble members, 5 historical source-linked reports. No fabricated live posts.

Prepared server-only Nugen insight endpoint, validated JSON output, same-origin protection, request spacing/cache, no personal itinerary data sent. Browser generation only sends kind and weather; existing simulated copilot unchanged. Dedicated API key created with explicit consent and stored only in ignored .env.local without printing. Model IDs remain empty because no aligned model exists.

User allowed free hackathon credits only; no card, purchase or upgrade. Explicitly approved document and benchmark uploads and training after estimate disclosure. Ready doc document_01m3g5anz0k5vy4w, benchmark benchmark_01m3g5ejrdakzdm1. Both first alignment alignment_01m3g5h7j6shnz64 and one retry alignment_01m3g5sqm0xtcbr2 FAILED at progress 0: Finetuning failed: Nugen job creation failed: HTTP 502 Bad Gateway. No model_id/adapter/evaluation. Stop retries pending provider repair. Billing checked after both failures: INR 9571.59 remaining, INR 0.00 total used. Need organisers/Nugen to repair job creation, then retry, deploy, connect IDs, run base-vs-aligned evaluation and inference. UI may lag API status.

Prepared authored corpus, 20-QA alignment benchmark and separate held-out checks in docs/nugen. Offline observation-driven candidate evaluator in scripts/evaluate-weather-learning.mjs; no actual outcome dataset, no learning run and no real-world calibration claimed.

Verification: 29 tests passed; production build and TypeScript passed. Browser verified tomorrow demo, real forecast, 40-member uncertainty text and actual historical reports. Same-origin check fixed for localhost host canonicalization; endpoint verified not-configured response via HTTP. Preview http://127.0.0.1:3001/what-if; server session 2063. User subsequently interacted with the preview; preserve their state. Tasks 1/2 remain incomplete due missing trained model, learning data and calibrated travel probabilities.


## Weather Twin first-stage preview — 27 September 2026, 05:15 IST

Added Weather Twin to /what-if and updated navigation. Live Open-Meteo hourly forecasts for GOI, Panaji and Mumbai; 5-minute refresh/cache, booking-time matching, explicit out-of-range handling. OpenStreetMap embedded location map. Selected transport booking receives a transparent authored rain/wind/heat/exposure delay; existing dependency checks propagate effects and compare planning health without mutating saved state. Normal/extreme/custom controls; original what-if remains available. Simulated copilot unchanged.

Bluesky public search adapter is connected but returned unavailable during verification. UI reports failure honestly; posts, when available, are unverified context only and do not influence predictions. This is NOT full Midnight Task 1 compliance: no learned model, calibrated probabilities, continuous learning, automatic booking geolocation or weather-specific provider recovery. Nugen deferred per user. Weather coefficients are explicitly hypothetical and shown in the UI.

Verification: Node 24 production build/TypeScript passed; 26 tests passed, including 3 weather tests for propagation, source preservation, fixed event times, normal conditions and missing durations. Live forecast API succeeded. Browser verified extreme +155 min and health change, normal restores baseline, 390px layout no overflow, hamburger navigation, geographic map and desktop rendering. No browser errors/warnings. Browser saved trip revision 35 preserved. Server restarted from this worktree at http://127.0.0.1:3001, Weather Twin http://127.0.0.1:3001/what-if. No deployment or push.


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

27 September 2026 follow-up: baseline demo now uses explicit 20-minute post-baggage shuttle and 15-minute same-hotel lobby pickup advisory buffers instead of generic 30-minute defaults. These are labeled authored assumptions; schedules, fixed concert and money remain unchanged. Normal demo has all eight bookings unaffected and health 95. Disruption propagation and copilot tests preserved: 26 tests and production build passed; browser verified 95 to 95 and eight no-issue cards. Laptop full navigation restored at >=768px; smaller screens retain hamburger. Server port 3001 refreshed.

27 September 2026 weather UX follow-up: replaced iframe map with directly rendered OSM tile map (nine visible tiles verified), retry/error state and full-map link. Replaced technical sliders with clear/rain/storm/booking-forecast choices and explicit Show changes & delays action. Changing choices hides stale results. Delay summary uses hours/minutes and names the affected booking; simple SVG graph draws actual requires edges with status colors and separate independent bookings. Detailed list collapsed. Production build/TypeScript passed; browser verified 155-minute storm, 95-to-33 health, clear restores 95, no immediate result before button, 390px no page overflow, map loaded, no browser warnings/errors. Existing simulation and copilot unchanged. Server refreshed on port 3001.

27 September 2026 06:35 IST: user requested retry. Revalidated ready doc, normalized 20-sample benchmark and supported base. Created alignment_01m3g655rzfcgwn6; failed at 0% with same upstream HTTP 502. Independent Llama inference also HTTP 502. Alternate alignment-ready VLM requires image and is not used as text substitute. Credit balance rechecked INR 9571.59, used INR 0.00. No UI/app behavior changes; added redacted read-only scripts/check-nugen.mjs and docs/nugen/SUPPORT_REPORT.md. Upstream intervention required; no successful model ID exists.

27 September 2026 06:53 IST: diagnosed Nugen against current official API docs and read-only account state; all three upstream alignment failures persist, no new training retry. Added isolated optional recovery explanation route/adapter with disabled-by-default live gate, timeout, bounded cache, failure circuit, validated advisory output, and explicit simulation fallback. Only UI addition is Explain recovery options using existing styling; copilot/engine/apply unchanged. 37 tests and production build/TypeScript pass. Browser verified delay -> fallback -> INR 2300 protected recovery under INR 2500 -> apply -> nine-item itinerary and revised dependency graph; reset afterward. See docs/nugen/DIAGNOSIS.md. Preview port 3001 restarted. Live Nugen remains unverified/blocked.
27 September 2026 08:47 IST: User relayed organiser guidance that Midnight Task 1 does not have to use Nugen. The PDFs confirm Task 1 is the weather-driven Digital Twin; Task 2 separately mandates a Nugen-aligned model integrated for inference. Treat these as separate demonstrations. Weather Twin remains usable without Nugen and must not be presented as a completed learned/calibrated twin: observed travel outcomes and a trained model are still missing. Task 2 remains blocked on Nugen alignment jobs failing at 0% with upstream HTTP 502, no aligned/deployed model ID.

Prepared a smaller, uncommitted Nugen runtime-context improvement: recovery explanations now receive allowlisted fictional booking IDs/times, explicit requires edges, impact states, derived fixture disruptions, checked option IDs/cash in paise and the fixed concert marker. Weather advisories receive the same fictional graph and authored simulation estimate only when the original demo fixture is active; personal itinerary details stay local. Added docs/nugen/raahi-runtime-context-v3.txt as an authored supplement for a future alignment, not as evidence of successful training. Existing deterministic plans, apply path and simulated copilot are unchanged. Node 24: 39 tests, TypeScript and production build pass. Production preview restarted at http://127.0.0.1:3001. No new Nugen upload, alignment attempt, credit use, commit or push in this work.

27 September 2026 09:24 IST: User attempted alignment with the complete raahi-domain-v3.txt document. Read-only API check: new document document_01m3gfs56bh2xtc9 READY; alignment alignment_01m3gft2vxdenmv0 FAILED at 0%, model ID null, with the same `Finetuning failed: Nugen job creation failed: HTTP 502 Bad Gateway` error and training-data-upload outcome unknown. Zero aligned models remain. See docs/nugen/SUPPORT_REPORT.md. No retry or inference probe was initiated by this diagnostic check. The local Nugen-context changes remain uncommitted and the simulated demo remains usable.
