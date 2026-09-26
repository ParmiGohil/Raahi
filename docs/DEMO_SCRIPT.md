# Three-minute core demo

Start the production app with Node 24: `npm ci && npm run build && npm start`. Open http://127.0.0.1:3000 and reset. Keep the terminal running. This is the local fallback; it requires no provider credentials.

1. **0:00–0:25 — Stakes.** “Our traveler has a flight, a shuttle, a hotel and a 16:00 concert. They care about the whole trip, not just a replacement flight.” Show the itinerary and the explicit fixture label.
2. **0:25–0:55 — Disruption.** Click Flight delayed 3 hours. Inspect the airport shuttle: ready at 14:30, cutoff 11:50. Open the downstream explanation.
3. **0:55–1:30 — Choices.** Compare ₹800 (later session, no hotel rest), ₹1,800 (later session, 45 minutes rest) and ₹2,300 (original session, late check-in). Mention ₹400 is already-paid loss, not extra cash to pay again.
4. **1:30–2:00 — A real constraint.** Protect 16:00. Only the original-session plan survives. Set cash to ₹2,000: none. “The system keeps the constraint instead of inventing a solution.” Restore ₹3,000.
5. **2:00–2:35 — Finish the job.** Review the plan, luggage storage, 15:30 venue readiness, 15:45 admission cutoff and explicit late-hotel permission. Apply simulated recovery. Refresh and show the persisted revised trip.
6. **2:35–3:00 — Credibility.** “A pure deterministic engine validates complete routes; optional AI can interpret preferences later. This prototype uses fixture inventory and simulates supplier actions. Ten focused tests and the browser flow pass.”

Optional extra: reset and choose original concert cancellation, then protect 16:00 to show why cancellation can make a hard requirement impossible. Or use delay plus later-session cancellation to show joint constraints.

If something fails during presentation, reset once. Keep local screenshots as fallback. Do not claim a deployment, live booking, weather integration, model-generated recovery or production readiness.

## Next deliverables before submission

1. Choose persistent hosting or implement a database-backed repository for a public URL.
2. Prepare the actual required presentation format and a backup recording.
3. Add model interpretation or live weather only if the core and submission package remain stable; show sources and fallback.
4. Reconfirm organizer submission channel and pitch duration; retain time before 27 September 11:00 IST.
