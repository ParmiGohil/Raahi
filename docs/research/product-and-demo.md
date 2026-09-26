# Product differentiation and demo research

Research date: 26 September 2026. This supports the canonical roadmap; it does not replace that document. Scope: a two-person team, 24 hours, at most one or two integrations, no real payment or booking execution. Organizer scoring weights were not supplied; the judging dimensions below are inferred strategy, not an official rubric.

## Recommendation

Build a whole-trip recovery workspace centered on **Protect what matters**. Show a traveler what breaks, let them protect the part of the trip that matters most, compare constraint-valid repairs, and apply a chosen repair to a versioned itinerary with an honest action checklist.

The memorable proof is a change in a real constraint changing the returned plans. The product should not depend on a chat conversation to reveal that proof.

## Competitive evidence and limits

| Verified product capability | Primary evidence | Consequence for our pitch |
|---|---|---|
| TripIt organizes bookings from different providers into an itinerary. | [TripIt product page](https://www.tripit.com/web) | Import plus timeline is groundwork, not the main originality claim. |
| TripIt offers alternate flight discovery and instructs users to contact the airline/vendor to make changes. | [TripIt Alternate Flights](https://help.tripit.com/en/support/solutions/articles/103000063402-alternate-flights) | Our prototype should show the entire recovery sequence and separate itinerary edits from provider execution. |
| TripIt risk alerts cover flights, accommodation, cars, trains, and other plans. | [TripIt Risk Alerts](https://help.tripit.com/en/support/solutions/articles/103000280834-risk-alerts) | Cross-mode alerts are not unprecedented. |
| Flighty presents predicted timing alongside official airline timing. | [Flighty delay predictions](https://flighty.com/help/delay-predictions) | Observations, predictions, estimates, and scenario simulations need distinct labels. |
| HTS/Hopper offers disruption assistance with rebooking and refund options under product terms. | [HTS Disruption Assistance](https://hts.hopper.com/products/disruption-assistance) | Rebooking/refunds alone are established capabilities. |
| Kiwi offers disruption protection for connected itineraries and may cover hotels and other expenses under its terms. | [Kiwi Disruption Protection Premium](https://www.kiwi.com/en/help/kiwi-com-guarantee-260/article/what-s-disruption-protection-premium-515/) | Do not claim existing products only consider an isolated flight. |
| Perk markets AI disruption alerts with automatic rebooking/rerouting. | [Perk Travel](https://www.perk.com/uk/platform/travel/) | “AI + end-to-end + one click” is an insufficient differentiation claim. |

These are official product descriptions, not independently verified performance results. Reviewing these pages does not establish that a competitor lacks a capability that is not mentioned on its page. Do not claim to be the first, only, or universally superior solution.

Defensible positioning: **Our prototype demonstrates transparent whole-itinerary repair across separately booked travel components, with explicit timing constraints, cash requirements, and traveler priorities.** Its distinction in the hackathon should come from working, inspectable evidence rather than unsupported market novelty.

## Main fictional scenario: Mumbai to Goa

Use one internally consistent fictional trip with arrival originally at 11:00, delayed to 14:00, a missed shuttle, a homestay with a seeded 14:00–18:00 check-in window, and an activity/event at 16:00. All dates, inventory, prices, refund rules, and availability must be labeled as scenario data unless sourced live.

Begin with the 16:00 event as **flexible**. Generate three materially different plans:

1. **Lower cost:** wait for a cheaper replacement transfer; reschedule the event according to its seeded policy.
2. **More comfortable:** take a private transfer to the homestay, allow time to settle, and reschedule the event. It must offer a measured benefit over the cheaper plan, such as less waiting or fewer transfers.
3. **Keep the original event:** go directly from the airport to the event, then check into the homestay under the fixture's expressly available late-check-in extension. Include luggage handling, the additional transfer, and their costs. The original 18:00 deadline alone would make this plan invalid.

Toggle the 16:00 event to **must keep its original time**. The first two plans must disappear from the feasible set, leaving the third if all its constraints pass. They may remain in a clearly separated rejected-options explanation, never as selectable feasible alternatives.

The canonical fixture must validate baggage/exit time, road times, event entry deadline, event end time, subsequent travel, and homestay arrival. Do not assume that a 14:00 airport arrival makes a 16:00 activity feasible. The seed must prove it. Similarly, late arrival does not automatically invalidate a hotel booking: the seeded check-in window is the relevant constraint.

This geography and dataset are a practical scope choice, not a claim about real Mumbai–Goa schedules or supplier policies. Domestic travel removes visa complexity from the main demonstration. One corridor is sufficient when the data model supports other modes and booking types.

## Distinctive proof to show

- **Causal impact:** the flight is directly disrupted; the shuttle is missed; the homestay may still be feasible; the activity becomes infeasible only under specific paths. Do not mark all downstream nodes failed automatically.
- **Constraint response:** protecting the event changes the feasible set. Lowering the cash budget can produce an honest no-solution result.
- **Rejected alternative:** show why a cheap candidate fails, with the arithmetic or policy that caused rejection.
- **Financial clarity:** separate cash needed now, confirmed policy-based refunds, conditional refunds, and estimated eventual net extra cost.
- **Minimal changes:** compare bookings kept unchanged, rescheduled, replaced, and canceled using explicit definitions.
- **Closed product loop:** selecting a plan produces a diff, updates the stored itinerary, and preserves a history/version.
- **Honest execution:** “Updated in your itinerary” and “Provider booking pending” are different states. No fake reservation confirmations.

## Four UI states

1. **Trip workspace:** timeline, traveler constraints, protected event, risk banner, and a compact map or location context. A graph toggle reveals dependencies without forcing travelers to read a network diagram.
2. **Impact drawer:** direct and downstream effects, transfer/buffer calculation, policy source or scenario policy label, and useful next action.
3. **Recovery comparison:** up to three distinct feasible plans, using consistent rows for cash due now, estimated net cost, arrival/time loss, waiting/transfers, unchanged bookings, changed activities, and uncertainty.
4. **Review and apply:** before/after diff, financial ledger, pending provider actions, apply button, updated timeline, and history.

Chat can interpret a preference such as “Keep the event and avoid two transfers,” but should then expose the resulting structured constraints. Keep the timeline and comparison as the primary experience. Use words/icons alongside status colors and keep the key recovery action visible on a small screen.

## Four-minute demo

| Time | Interaction | Evidence |
|---|---|---|
| 0:00–0:25 | Introduce the trip, separately booked components, and 16:00 event. | Clear user stakes. |
| 0:25–0:55 | Trigger the labeled flight-delay scenario. | Reproducible event ingestion. |
| 0:55–1:25 | Show the missed shuttle and open one downstream explanation. | Dependency analysis and timing reasoning. |
| 1:25–2:00 | Compare cheaper, more comfortable, and keep-event plans. | Genuine tradeoffs and feasible recovery. |
| 2:00–2:30 | Protect the original 16:00 event; only the valid keep-event plan remains. | Personalization changes hard constraints. |
| 2:30–2:50 | Inspect why one alternative was rejected. | Validation before ranking. |
| 2:50–3:25 | Review the selected plan's diff/cost ledger, apply, and reload the updated itinerary. | Complete persisted flow. |
| 3:25–4:00 | Show one proactive slack warning, actual verification results, and live/simulated boundaries. | Credibility and extensibility. |

Suggested opening: “Your airline knows your flight. Your hotel knows your room. Who knows that the delay puts the rest of your day at risk?”

Suggested closing: “We repair the itinerary around the traveler's priorities, show why each option works, and make the next actions clear.”

Keep activity cancellation during an ongoing trip as a Q&A scenario. Completed bookings must remain locked. Multiple concurrent disruptions are a further scenario once the main loop is stable, not an additional main-demo storyline.

## Inferred judging dimensions and evidence

No weighted rubric has been provided. Treat these as preparation dimensions rather than organizer promises.

| Likely dimension | Evidence to prepare |
|---|---|
| Problem coverage | Trace each required capability to a visible interaction and a scenario. |
| Technical depth | Dependency edges, feasibility reasons, policy/cost calculations, and valid no-solution behavior. |
| Originality of implementation | Protect-event interaction, explanatory impact propagation, and transparent whole-itinerary tradeoffs. |
| Usability | Two or three uninvolved people can identify impacts, compare plans, and complete recovery without coaching. |
| Completeness | Stored before/after itinerary, applied-plan state, refresh persistence, and history. |
| Reliability | Repeatable fixture, working offline fallback, actual test results, and graceful integration failure. |
| Practicality | Explicit live/demo boundaries and realistic provider-execution limitations. |

Proposed acceptance checks, not achieved results:

- Direct/downstream impacts match manually authored expected outcomes for every seed scenario.
- Every returned plan passes timing, location, buffer, availability, cash-budget, and protected-event checks.
- Tightening a constraint never silently produces an invalid plan.
- No-solution states name the incompatible requirements and suggest explicit relaxations.
- Applying a plan preserves completed/locked bookings and produces the expected version/diff.
- Measure local engine latency separately from end-to-end API/UI latency; report actual numbers.
- Optionally compare with a cheapest-replacement-only baseline using complete-itinerary validity and bookings retained. Do not claim broad optimization superiority from a few fixtures.

Retain scenario ID, expected impacts, rejected candidates/reasons, selected plan, and resulting version as inspectable evaluation artifacts. Avoid fabricated claims such as “90% faster” or “₹10,000 saved.”

## Two-person scope and cut line

Person A should own the engine, scenario data, policies, provider adapter(s), and persistence. Person B should own the timeline, impact explanations, comparison, apply flow, and demo presentation. Agree on request/response types and the canonical fixture first; integrate continuously. Both review the arithmetic and rehearse the demo.

Must complete: one 6–10 booking trip, explicit dependencies, shared disruption event model, feasible recovery generation, comparison, policy/cost ledger, preference update, applied itinerary with history, and one proactive slack warning. Cover other required disruption categories through small fixtures using that same engine.

At most one or two live read-only integrations, only after the full scenario loop works. A live API is not inherently more impressive than a correct engine; show what is live and what is seeded. An LLM may extract user preferences or explain validated results, but must not invent inventory, refunds, or feasibility.

Cut native apps, mailbox integration, global inventory, payment/ticket issuance, autonomous cancellation, insurance, automatic legal compensation claims, elaborate profile systems, and uncalibrated ML risk percentages. Do not add product-internal multi-agent orchestration merely for the pitch.

## Commercial path hypothesis

A realistic first pilot is a travel agency or itinerary operator whose staff coordinate multiple suppliers. Provide a recovery decision workspace; its staff review recommendations and execute changes using existing provider access. This is an unvalidated strategy hypothesis, not demonstrated demand.

Measure time to a usable recovery plan, agent acceptance, provider actions required, escalation rate, incorrect recommendations, and avoidable prepaid loss under an explicit calculation. Validate willingness to pay through interviews before proposing revenue forecasts.

## Additional research lead

The primary paper [Replan, Repair, or Edit? A Unified Empirical Evaluation of Travel Agents for Itinerary Revision under Resource Disruptions](https://arxiv.org/abs/2609.19654) treats successful repair and preservation of an accepted itinerary as distinct evaluation concerns. Read its complete methods and limitations before citing quantitative results or claiming its benchmark transfers directly to this prototype.
