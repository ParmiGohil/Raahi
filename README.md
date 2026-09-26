# Raahi · A way forward

A working travel disruption recovery prototype for HackCelestial PS ID 2. Explore a fictional Mumbai–Goa itinerary, see connection failures, compare constrained recovery plans, review costs and update the itinerary.

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

- Connected itinerary, computed dependency impacts and proactive connection warnings.
- Three delay recovery tradeoffs: ₹800, ₹1,800 and ₹2,300 cash now.
- Protected original concert and cash-budget constraints, including no-solution results.
- Original-session cancellation and delay plus later-session cancellation.
- Whole-route validation, review diff, separate cash/loss ledger, simulated apply and reset.
- Isolated browser sessions; versioned atomic persistence; stale and repeated apply handling.

## Architecture and scope

Next.js App Router + React + TypeScript + Zod. Pure engine in `src/engine`; fixture catalog in `src/fixtures`; HTTP contract in `src/domain/requests.ts`; local repository in `src/repositories`; UI in `src/components`.

`GET /api/trip` loads the browser's session. `POST /api/trip` accepts scenario, preferences, apply and reset commands with an expected revision. Applying regenerates and validates the chosen plan on the server. A signed review expires after ten minutes.

Everything involving schedules, fares, policies and inventory is **authored fixture data**. The fixed scenario clock is 26 September 2026 at 09:00 IST. There is no live booking or refund execution, live weather or LLM integration yet. No algorithmic global-optimum claim is made.

Persistence is `.raahi/` JSON, ignored by Git, with serialized transactions and atomic file replacement. Run **one Node process on persistent storage**. Do not deploy this repository unchanged to an ephemeral serverless filesystem or multiple processes. Set `RAAHI_DATA_DIR` to an absolute persistent directory if needed and `RAAHI_HTTPS=true` behind HTTPS. Demo cookies are HttpOnly and SameSite Strict; this is not production account authentication. Restarting the server invalidates outstanding review signatures; refresh the browser before applying.

## Project documents

- [Current implementation status](CURRENT_STATUS.md)
- [Ordered implementation milestones](docs/IMPLEMENTATION_PLAN.md)
- [Canonical research roadmap](HACKATHON_ROADMAP.md)
- [Build handoff](docs/BUILD_HANDOFF.md)
- [Session memory](SESSION_MEMORY.md)
- [Collaboration](docs/COLLABORATION.md)

Use named `codex/` branches and milestone commits. The earlier private planning archive is separate from this public repository; never push its history here.
