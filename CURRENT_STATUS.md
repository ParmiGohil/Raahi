# Current Raahi status

Updated 26 September 2026, 19:37 IST (~15h23m remaining). Published freeze: 27 September, 11:00 IST.

## Repository and ownership

Public repository: ParmiGohil/Raahi. Working branch: `codex/raahi-core`, based on main `dfe3065`. Main and the teammate's `parmi` branch currently contain only documentation: the earlier prototype was removed by its author. This task owns the implementation per the user's latest instruction. Private planning history remains separate.

## Milestones

- M0 complete: repository audit, architecture and ordered commit boundaries in `docs/IMPLEMENTATION_PLAN.md`.
- M1 complete: TypeScript scaffold, GOI fixture, dependency impacts, independent validator, exact recovery ledgers, cash/protected-event controls and cancellation variants. Engine scenario suite: 7 passed.
- M2 complete: isolated HTTP-only demo sessions, validated commands, server-side plan regeneration, 10-minute signed review, revision conflict handling, idempotency and atomic local JSON persistence. Repository gate: 3 tests passed.
- M3 complete: responsive dashboard, timeline details, causal explanation, scenario and preference controls, comparison, review modal and simulated application. Production build and six integrated browser assertions passed; reload preserved revision 8 and the selected plan. Desktop and 390px mobile layouts inspected.
- M4 complete locally: consolidated 10-test regression suite and typecheck passed; release evidence, run instructions and demo script are written. The named branch is ready for GitHub review.

Milestone checks: 10 engine/repository tests passed; full production build including TypeScript passed; integrated browser flow passed. The browser gate found and resolved Next URL normalization rejecting valid same-origin writes. System Node 23 is outside Vitest 5 support, so use Node 24 (`.nvmrc`). Testing happens at milestone gates, as requested.

Known limits: fixture inventory/policies; local single-process JSON persistence only; no real supplier execution, live provider or LLM integration; no public deployment yet. These remain explicit future milestones.

## Next milestones

1. Review/integrate this branch without overwriting teammate changes.
2. Add persistent hosting or a hosted database repository before publishing a public URL.
3. Prepare required submission slides and a backup recording.
4. Add optional live weather/model interpretation only after those delivery needs are covered.

See `docs/VERIFICATION.md` for actual test/browser evidence and `docs/DEMO_SCRIPT.md` for the three-minute walkthrough. No full test rerun is needed for the subsequent formatting/documentation-only changes.
