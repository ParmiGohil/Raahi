# Implementation sequence

Updated 26 September 2026, 19:17 IST (~15h43m to published freeze).

The current user has assigned implementation and integration to this Codex task. No teammate output is a dependency. Main is documentation-only; `parmi` contains an earlier prototype followed by its removal. Preserve that history and build on `codex/raahi-core`.

## Architecture

Browser workspace → validated Next.js route → pure TypeScript recovery engine + versioned repository.

The engine owns timing, dependencies, candidate validation, hard constraints and integer-paise ledgers. The UI renders its results. Authored inventory is explicit fixture data. Applying a plan changes only the local itinerary, with supplier actions simulated.

Use Next.js, React, TypeScript and Zod. Plain CSS keeps styling dependencies small. Start with an atomic JSON repository on a persistent local Node server; do not claim serverless durability. No external accounts block the demo.

## Commit boundaries

1. **M0: plan and ownership** — this sequence and latest operating decisions.
2. **M1: deterministic foundation** — app scaffold, shared types, timed trip and dependencies, delay/cancellation, separate validator, three candidate tradeoffs, protected event and cash budget. Gate: one focused engine scenario suite and typecheck.
3. **M2: stateful API** — request validation, isolated demo sessions, revision checks, idempotent application, persistence/reset. Gate: repository/API behavior checks.
4. **M3: working experience** — timeline, causal impacts, comparison, preferences, review ledger/diff and application. Gate: production build and complete browser journey, including refresh and no-solution state.
5. **M4: release preparation** — fix issues found at the previous gate, run consolidated checks, document evidence, limitations, demo script and local fallback. Push named branch and open review PR.
6. **Optional, only after the core** — live weather, model-backed interpretation, extra disruption families, presentation assets. These are not prerequisites for the working core.

Implement substantial coherent batches. Run meaningful checks at these boundaries; do not run repetitive tests after individual edits. No time spent on cosmetic unit tests, speculative abstractions or broad renewed research. Record actual checks, not planned claims.

## Scope and acceptance

One fictional Mumbai–GOI trip, September 26–27, fixed scenario clock. Correct ₹800/₹1,800/₹2,300 cash totals; ₹400 prepaid shuttle loss separately. Original-event protection leaves only ₹2,300 after delay; lower budget leaves none. Later-session cancellation and original-session cancellation are explicit variants. Past travel is immutable. Unknown/expired essential offers fail validation. No purchased-ticket claims, invented percentages or probabilistic confidence.

Each milestone updates CURRENT_STATUS.md and commits only intended public project files. Keep main and teammate branches untouched until integration review. Never push private archive history.
