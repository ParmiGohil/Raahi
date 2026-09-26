# Raahi pitch notes

Suggested duration: about four minutes. Slide 10 invites a live prototype demonstration in the next round.

## 1. Raahi: a way forward

A flight delay can threaten everything a traveler booked around it. Raahi understands that connected trip and helps the traveler recover it around their budget and the experiences they care about. Our prototype takes that journey all the way through review and a saved itinerary.

Source: https://github.com/ParmiGohil/Raahi/tree/main; original decorative Goa-inspired artwork: public/images/goa-coast.png. Generated artwork, not a real booking or current destination condition.

## 2. The problem

In our fictional Mumbai–Goa trip, the flight arrives three hours late. The traveler is ready at 14:30, well after the 11:50 shuttle cutoff. That breaks the hotel transfer and threatens the concert. The difficult task is checking the consequences across bookings while also understanding what another plan will cost.

Source: https://github.com/ParmiGohil/Raahi/tree/main/src/fixtures/trip.ts and src/engine/recover.ts. All times IST on 26 September 2026; authored scenario, not live travel data.

## 3. The product

This is the working Raahi interface. The itinerary stays alongside the recovery options so the traveler sees what changes and why. Each option makes the cash needed now and the event tradeoff visible. The traveler reviews the full route and cost ledger before accepting anything.

Source: https://github.com/ParmiGohil/Raahi/tree/main/src/components/workspace.tsx. Screenshot captured from the local working prototype.

## 4. Connected itinerary

The engine represents bookings and their dependencies explicitly. It propagates impacts from the disrupted segment, then validates complete replacement routes. Timing alone is not enough: locations must connect, supplier permissions must be available, and completed travel must stay unchanged. This lets the system reject plans that look plausible but cannot actually work.

Source: https://github.com/ParmiGohil/Raahi/tree/main/src/domain/types.ts, src/engine/recover.ts and src/engine/validate.ts. Bounded authored candidate plans with deterministic validation; no global optimization claim.

## 5. The recovery choices

The delay has three validated choices. Eight hundred rupees gets a later shuttle and later concert session, with no time to rest. Eighteen hundred adds a cab and 45 minutes at the hotel. Twenty-three hundred protects the original concert with luggage storage and explicit late check-in permission. Four hundred rupees of prepaid loss is separate, not cash the traveler must pay again.

Source: https://github.com/ParmiGohil/Raahi/tree/main/src/engine/recover.ts and tests/engine.test.ts. All amounts are exact fictional fixture amounts in INR. No refund entitlement or live inventory claim.

## 6. Hard constraints

Here is the trust test. Protect the original 4 PM concert and cap extra cash at two thousand rupees. Raahi returns no feasible plan. It does not quietly move the event or exceed the budget. With a two-thousand-five-hundred-rupee limit, the validated twenty-three-hundred-rupee plan becomes available. The same engine also handles concert cancellation and combined disruptions.

Source: https://github.com/ParmiGohil/Raahi/tree/main/tests/engine.test.ts and src/demo/copilot.ts. The user must explicitly change the budget or protection setting.

## 7. The simulated copilot

The copilot demonstrates how natural-language recovery could feel. Today it uses three clearly labeled authored requests and an animated walkthrough. The costs and feasibility come from the real engine. Previewing does not change the itinerary. The traveler confirms preferences, then separately reviews and applies a recovery. A future model adapter could replace interpretation while leaving validation intact.

Source: https://github.com/ParmiGohil/Raahi/tree/main/src/components/copilot.tsx, src/demo/copilot.ts and src/domain/requests.ts. No LLM or supplier API call occurs. Screenshot from the working prototype.

## 8. Architecture

We keep interpretation separate from decisions and execution. The user interface sends validated commands. The independent engine calculates complete routes and exact ledgers. The server regenerates the selected plan before application and uses signed reviews with revision and retry checks. Local sessions persist to disk. The prepared Vercel mode uses encrypted browser cookies for an isolated demo, not collaborative production storage.

Source: https://github.com/ParmiGohil/Raahi/tree/main/src/app/api/trip/route.ts, src/repositories/trip.ts, src/repositories/browser-session.ts, docs/HOSTING.md and package.json. Vercel publication is pending.

## 9. Evidence and scope

The working prototype covers the end-to-end recovery loop and three disruption scenarios. Thirteen focused tests pass, as does the production build. We also verified the mobile confirmation, review, application and refresh flow. We are explicit about the boundary: inventory and policies are fixtures, and model interpretation and supplier execution are simulated. Live provider evidence is the next integration step.

Source: https://github.com/ParmiGohil/Raahi/tree/main/docs/VERIFICATION.md and CURRENT_STATUS.md. These are engineering checks, not user adoption, benchmark performance or production readiness metrics. Public deployment remains pending.

## 10. Next round

In the prototype round, you can change the disruption, protect the original concert or tighten the cash limit, and see the engine adapt. We will take the selected route through review, application and refresh. Raahi brings the entire trip into the recovery decision, while keeping the traveler in control.

Source: https://github.com/ParmiGohil/Raahi/tree/main; decorative background reuses the original generated project artwork.

# Rehearsal guide

Aim for roughly four minutes. Give the most time to slides 5–7: the tradeoffs, hard constraints and simulated copilot. Keep the architectural explanation short unless a judge asks for detail. Let the cost comparison remain on screen long enough to read.

Opening: “A three-hour delay can threaten everything booked around a flight. Who helps the traveler recover the whole trip?”

Closing: “In the next round, change our traveler's budget or disruption and watch Raahi recover the itinerary live.”

## Questions to prepare for

**Is a real LLM running?** No. The copilot explicitly simulates interpretation with authored requests. The deterministic engine performs the actual route and cost checks. A real model could map requests into the same validated command contract.

**Where do prices and policies come from?** Authored fixtures for the fictional Mumbai–Goa trip. We do not claim current availability, refund entitlement or live supplier confirmation.

**What happens when no option works?** The engine returns no feasible plan and preserves the hard constraints. The traveler chooses whether to change the budget or event priority.

**What is distinctive about the implementation?** It coordinates the whole itinerary, validates the route against explicit constraints, separates immediate cash from sunk loss and future refunds, and completes the review/apply/persist loop.

**Does application rebook flights or hotels?** No. It updates the prototype itinerary and records pending/simulated supplier actions. Real execution needs supplier integrations and confirmation handling.

**Can it scale beyond this trip?** The engine is independent from the UI and provider adapters, but the current candidate catalog is bounded and authored. More destinations require reliable inventory, travel-time and policy data, plus expanded candidate generation. We have not benchmarked production scale.

**Is it hosted?** Public Vercel deployment is pending account configuration. The local prototype works without API credentials. Do not claim a public deployment until its URL has been verified.
