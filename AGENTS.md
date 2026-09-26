# Project context for Codex

This project is a two-person hackathon prototype for PS ID 2: Travel Disruption Recovery Engine. On first joining a task, read `SESSION_MEMORY.md`, `CURRENT_STATUS.md`, `HACKATHON_ROADMAP.md`, and `docs/BUILD_HANDOFF.md`. Read `docs/COLLABORATION.md` before simultaneous implementation. Later explicit user decisions override the documented defaults.

The shared repository is `ParmiGohil/Raahi`, using `main`. Its public initial history is separate from an earlier private conversation archive. Push only the intended Raahi branch to `origin`; do not publish the private backup branch/history.

## Operating principles

- Inspect existing files and Git state before editing; preserve another person's uncommitted work.
- Treat the current code and latest status log as implementation evidence. The roadmap describes intended capabilities, not completed ones.
- Follow the agreed lane and branch. One person owns initial scaffolding and shared contracts. Keep shared changes small and coordinate overlaps.
- Do not restart broad research or expand scope while the core flow is incomplete.
- Use deterministic code for timing, feasibility, costs and itinerary state. LLMs may interpret or explain evidence.
- Never invent live inventory, supplier policies, refund entitlement or booking confirmation. Label fixture/sandbox/live/unknown data accurately.
- Preserve completed travel and hard constraints. Return fewer than three plans, including none, when appropriate.
- Keep cash needed now distinct from future refunds and prepaid loss.
- In the prototype, plan application updates the itinerary; external provider actions remain simulated or pending.
- Keep the engine independent from UI, persistence, model and provider APIs.
- Test the behavior changed, including exact fixture arithmetic and relevant boundary conditions. Report only tests actually run.
- Recalculate deadline remaining; published freeze is 27 September 2026 at 11:00 AM Asia/Kolkata unless the team supplies an update.
- Record completed behavior, checks, blockers and next milestone in the shared status/handoff at integration points. Do not label a proposed feature as implemented.

## Default scope

One fictional Mumbai–Goa trip; a delay plus one simple activity-cancellation variant; connected impact analysis; valid recovery alternatives; protected-event and cash-budget controls; cost ledger; review/apply/persist/reset; one proactive warning. Broaden scenarios and add optional live weather only after the full loop works.

Suggested directories and contracts appear in `docs/BUILD_HANDOFF.md`; none of the proposed application modules existed when this instruction file was created. No build/test command is established yet. Inspect the actual package manifest after scaffolding rather than assuming one exists.
