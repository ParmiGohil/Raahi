# Current Raahi status

Updated 26 September 2026, 19:17 IST. Published freeze: 27 September, 11:00 IST.

## Repository and ownership

Public repository: ParmiGohil/Raahi. Working branch: `codex/raahi-core`, based on main `dfe3065`. Main and the teammate's `parmi` branch currently contain only documentation: the earlier prototype was removed by its author. This task owns the implementation per the user's latest instruction. Private planning history remains separate.

## Milestones

- M0 complete: repository audit, architecture and ordered commit boundaries in `docs/IMPLEMENTATION_PLAN.md`.
- M1 complete: TypeScript scaffold, GOI fixture, dependency impacts, independent validator, exact recovery ledgers, cash/protected-event controls and cancellation variants. Engine scenario suite: 7 passed.
- M2 planned: stateful API and persistence.
- M3 planned: interactive workspace and complete browser flow.
- M4 planned: consolidated verification and release handoff.

Milestone checks run using Node 24: engine and repository suites, 10 tests passed; TypeScript check passed before UI integration. System Node 23 is outside Vitest 5 support, so use Node 24 (`.nvmrc`). Testing happens at milestone gates, as requested. The UI is being integrated; no browser verification yet.
