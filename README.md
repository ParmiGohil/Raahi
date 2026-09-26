# Raahi

**Travel Disruption Recovery Engine · HackCelestial 3.0 · PS ID 2**

Raahi is a proposed travel recovery workspace that explains disruption impacts across a connected itinerary, compares feasible repairs, and protects the traveler's most important commitments.

**Current stage:** roadmap and research complete; application implementation has not started. This repository is the shared home for the two-person team's work.

## Start contributing

```bash
git clone https://github.com/ParmiGohil/Raahi.git
cd Raahi
```

Open the clone as a local project in Codex and use [TEAMMATE_START_PROMPT.txt](TEAMMATE_START_PROMPT.txt) to start a task. The shared default branch is `main`. Each teammate should work on a separate feature branch and integrate through small reviewed pull requests.

One person should create the initial app scaffold and shared data contract before both implement in parallel. Suggested lanes are engine/data/persistence and UI/interaction/demo; assign names before starting.

## Read the shared context

| Document | Purpose |
|---|---|
| [Start here](START_HERE.md) | Onboarding and reading order |
| [Current status](CURRENT_STATUS.md) | Actual progress and next milestone |
| [Project memory](SESSION_MEMORY.md) | Product decisions, constraints and open details |
| [Problem statement](docs/PROBLEM_STATEMENT.md) | The supplied hackathon challenge |
| [Full roadmap](HACKATHON_ROADMAP.md) | Product scope, architecture, schedule and demonstration |
| [Build handoff](docs/BUILD_HANDOFF.md) | Module contracts and acceptance criteria |
| [Collaboration](docs/COLLABORATION.md) | File ownership, branches and integration |
| [Engine research](docs/research/recovery-engine.md) | Recovery design and exact fictional scenario |
| [API research](docs/research/travel-apis.md) | Provider access and integration limitations |
| [Product/demo research](docs/research/product-and-demo.md) | Competitive evidence and presentation strategy |

## First milestone

Build a loadable sample trip, computed disruption impacts, and one validated recovery path. The fictional Mumbai–Goa demo connects a delayed flight, missed transfer, hotel check-in constraint and timed event.

The three authored plans cost ₹800, ₹1,800 and ₹2,300. Making the original event mandatory removes the first two; reducing the cash budget below ₹2,300 produces an honest no-solution result. These are test fixtures, not live offers or confirmed bookings.

## Implementation status

No package manifest, application server, runtime tests or deployment exists yet. Proposed stack: Next.js/React/TypeScript with a deterministic engine and optional live/AI enrichment. Commands will be documented after scaffolding.

Published event freeze: **27 September 2026, 11:00 AM IST**. Recalculate remaining time and use any newer official organizer instructions.

This public repository contains project guidance and research. The earlier full conversation export and ZIP remain separate handoff artifacts. Keep credentials and generated files out of commits.
