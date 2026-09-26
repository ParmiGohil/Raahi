# Core release evidence

26 September 2026, 19:37 IST. Application commit: `1717ad4` (documentation/format-only release follow-up may follow).

## Gates actually run

- Node 24 + Vitest 5: **10 tests passed**, 2 files. Last consolidated run: 194 ms reported suite duration; this is not a production latency benchmark.
- TypeScript `tsc --noEmit`: passed.
- Next.js production build: passed, including route compilation and TypeScript.
- Production server at `http://127.0.0.1:3000`: loaded successfully.
- Browser journey: delay produces three plans; protect original reduces to one; ₹2,000 budget leaves none; restore ₹3,000; review shows ₹2,300 cash and ₹400 prepaid loss separately; apply persists one action history entry and closes review.
- Browser refresh: selected recovery persisted at revision 8. Updated timeline includes bag storage, original event, onward cab and late check-in.
- Desktop and 390px mobile layouts visually inspected; no horizontal overflow in measured views. No Next error overlay or browser runtime errors reported after correction.
- Reset exercised through the browser flow; a fresh delay after reset again showed three options.

The browser gate found a real issue: Next's normalized URL origin differed from the incoming Host, rejecting valid same-origin POSTs. The route now compares the browser's Origin host to the actual Host. The successful browser journey was run after this fix. The browser script waits for React to commit pending state before advancing; its initial synchronous automation race was corrected.

## What the focused suite covers

Baseline validity and 20-minute shuttle advisory; graph-dependent missed connections; unchanged next-day booking; exact ₹800/₹1,800/₹2,300 cash and ₹400 loss; rest tradeoffs; protected event and budget boundary; cancellation alone and with delay; unknown storage/late-check-in policy; offer expiry; cutoff, geography, overlap and immutable past checks. Repository tests cover disk reload, reset, idempotent retries, simultaneous writes, stale revisions, expired reviews, infeasible application and session isolation.

## Reproduce

With Node 24: `npm ci`, `npm test`, `npm run build`, `npm start`.

Optional browser milestone: open the local page using agent-browser, wait for the trip to load, then run `agent-browser eval --stdin < tests/browser-flow.js` in the same browser session. It drives actual UI handlers and checks persisted results through the API. It does not replace the independent engine assertions.

Screenshots are local under ignored `exports/verification/`: baseline, desktop options, mobile options and applied mobile itinerary. They are not public repository assets.

## Limits — do not pitch these as completed

No public deployment, live inventory, real booking/refund execution, LLM interpretation, forecast integration, production accounts, hotel-cancellation recovery, global routing, presentation deck or demo recording. This is a bounded catalog with authored schedules, fares and policies, not a globally optimal planner. The JSON store is for one local Node process with persistent disk. Broader ongoing-trip behavior is guarded by the validator but has no interactive demo control. Unknown essential inventory rejects an option; there is no separate conditional-plan experience yet.
