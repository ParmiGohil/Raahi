# Raahi · A way forward

A working travel disruption recovery prototype for HackCelestial PS ID 2. Explore a fictional Mumbai–Goa itinerary, see connection failures, compare constrained recovery plans, review costs and update the itinerary.

For clone/pull commands, troubleshooting and a ready-to-paste Codex handoff, see [the teammate setup guide](docs/LOCAL_SETUP.md).

## Run locally

Use Node **24** (`nvm install && nvm use` if nvm is installed).

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3000. For development use `npm run dev`. No API keys are required. `npm test` runs the focused engine/repository suite; `npm run typecheck` checks TypeScript.

If the machine's global npm 11.0 fails during install, use `npx npm@11.11.0 ci` under Node 24. Do not upgrade the system runtime during a live demo.

## What works

- Separate Trip workspace, My itinerary, Dependencies, What-if, Recovery and Add itinerary pages sharing one saved trip.
- Manual bookings save immediately; all items are ordered by time and automatically connected (with manual/independent overrides). Actual PDF text is extracted locally using PDF.js, with original-page preview and review before saving. Scanned PDFs need manual entry; no OCR or model is used.
- Animated Trip Health calculated from dependency impacts and applied recovery, on home and itinerary pages.
- Actual versus suggested connection buffers, booking-level disruptions and a What-if preview that does not change saved state.
- Personal itineraries support timing analysis, fixed-time constraints and moving explicitly flexible commitments. Additional transfer options use prominently labeled fictional timing/price assumptions and must pass timing/budget checks. No live supplier offers are claimed.
- A persisted local profile, prominent quick actions, status-color borders and reduced-motion-aware hero/connection animation.
- The existing simulated-AI copilot is preserved; no model connection or API key was added.
- Connected itinerary, computed dependency impacts and proactive connection warnings.
- Three delay recovery tradeoffs: ₹800, ₹1,800 and ₹2,300 cash now.
- Protected original concert and cash-budget constraints, including no-solution results.
- Original-session cancellation and delay plus later-session cancellation.
- Whole-route validation, review diff, separate cash/loss ledger, simulated apply and reset.
- Isolated browser sessions; versioned atomic persistence; stale and repeated apply handling.

## Architecture and scope

Next.js App Router + React + TypeScript + Zod. Pure engine in `src/engine`; fixture catalog in `src/fixtures`; HTTP contract in `src/domain/requests.ts`; local repository in `src/repositories`; UI in `src/components`.

`GET /api/trip` loads the browser's session. `POST /api/trip` accepts scenario, preferences, copilot preview confirmation, apply and reset commands with an expected revision. Applying regenerates and validates the chosen plan on the server. A signed review expires after ten minutes.

Everything involving schedules, fares, policies and inventory is **authored fixture data**. The fixed scenario clock is 26 September 2026 at 09:00 IST. There is no live booking or refund execution, live weather or real LLM integration. The copilot replays three explicitly labeled authored requests, with real deterministic feasibility checks. No algorithmic global-optimum claim is made.

Local persistence uses `.raahi/` JSON, ignored by Git, with serialized transactions and atomic file replacement in one Node process. Vercel automatically uses encrypted HTTP-only browser-session cookies instead, so no ephemeral filesystem writes are needed. Set a stable `RAAHI_SIGNING_SECRET` before hosting. Hosted sessions are individual demos, not collaborative database records; concurrent serverless requests have no transactional database guarantee. See [hosting and demo instructions](docs/HOSTING.md).

## Project documents

- [Current implementation status](CURRENT_STATUS.md)
- [UI design system and artwork prompt](docs/DESIGN_SYSTEM.md)
- [Ordered implementation milestones](docs/IMPLEMENTATION_PLAN.md)
- [Canonical research roadmap](HACKATHON_ROADMAP.md)
- [Build handoff](docs/BUILD_HANDOFF.md)
- [Session memory](SESSION_MEMORY.md)
- [Collaboration](docs/COLLABORATION.md)

Use named `codex/` branches and milestone commits. The earlier private planning archive is separate from this public repository; never push its history here.

### PDF import scope

Supported: labeled booking fields and day-number schedule tables with explicit date ranges. All source text remains available for review; unknown fields stay unknown. For schedules with start times only, imports preserve those times and mark missing duration/location/price. Health stays unscored until required timing/location details are supplied. PDF files are previewed/read in-browser, not uploaded or stored by the server. The reviewed itinerary is saved in the local trip repository. Bulk review supports up to 100 items.
