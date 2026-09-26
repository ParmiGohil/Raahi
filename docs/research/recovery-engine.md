# Recovery engine: technical research and implementation recommendation

Research date: 26 September 2026. This is a proposed architecture and a deliberately synthetic demo fixture, not a claim of real transport inventory, fares, policies, or booking capability. Scope: two teammates, 24 hours.

## The technical bet

Build an **explainable itinerary repair engine**: preserve the accepted trip wherever possible, determine which constraints a disruption breaks, generate a few materially different repairs, validate the entire resulting itinerary, and display the exact reasons each repair is feasible. A chatbot may explain the result, but code decides feasibility, money, and booking state.

Use one TypeScript application and ordinary JSON/SQL records. No graph database, autonomous agent framework, vector database, probabilistic delay model, or separate optimization service is necessary for the MVP. A graph is a data structure, not an infrastructure requirement. If the main team chooses another stack, keep the pure engine independent of its web framework.

A newly submitted research preprint specifically comparing itinerary revision approaches reports a tradeoff between recovery success, retained commitments, and computational cost. It supports measuring preservation as well as feasibility; it does not establish that this prototype's algorithm is optimal. [Replan, Repair, or Edit?, submitted 17 September 2026](https://arxiv.org/abs/2609.19654).

## Small data model with the distinctions that matter

- **Trip**: id, version, traveler party, display timezone, current location/time, cash budget, preference weights, hard must-do commitments.
- **Booking**: id, kind, provider/reference, participants, booking status, paid amount/currency, linked order/group id, policy reference. Include `completed`, `in_progress`, `confirmed`, `canceled`; keep observed disruption state separate from booking state.
- **Event**: arrival/departure/check-in/activity start/end, location, UTC instant and IANA timezone, service duration, permissible start window, fixed or movable, required attendee presence. One booking may contain multiple events.
- **Dependency**: from/to, type, required elapsed time, hard/soft, evidence. Distinguish a true requirement from a preferred order such as hotel check-in before sightseeing. Travel adjacency is recomputed after reordering.
- **Policy**: source text, exact relevant excerpt, effective deadline/timezone, fee or refund rule, cash versus voucher, confirmed/estimated/unknown. Group-level constraints matter: changing one flight segment may affect the entire booking.
- **Disruption**: id, affected entity, absolute revised arrival/departure or cancellation, observed/effective time, source, source event version, root cause, confidence. Deduplicate by id/version; do not add successive cumulative delays together.
- **Offer**: source mode `fixture | sandbox | live`, fetchedAt, expiresAt, availability, party capacity, locations/times, total price, included services, policy, approval status.
- **RecoveryPlan**: base trip version, actions, revised events/edges, whole-plan validation result, financial ledger, comparison metrics, evidence-backed reason codes, assumptions, offer expiries.
- **Execution**: selected plan, idempotency key, action status, resulting trip version, audit log. Updating the local itinerary is distinct from confirming external supplier bookings.

Represent a hotel as a stay entitlement plus discrete check-in/check-out and overnight-presence constraints. The room being booked Tuesday through Thursday must not make every daytime activity overlap with a required hotel presence interval. Model meals/rest as explicit optional or required events if the traveler asks for them.

## Deterministic impact and feasibility rules

For a non-transport service event j following a prior event i:

`earliestArrival(j) = end(i) + routeDuration(i.location, j.location, departureTime) + uncountedExitOrAccessTime`

`start(j) = max(earliestArrival(j), windowStart(j))`

`start(j) <= latestAllowedStart(j)`

`end(j) = start(j) + serviceDuration(j)`

For fixed transport departure d, use its boarding/check-in cutoff, not its departure time:

`travelerReadyAtOrigin <= boardingCutoff(d)`

Do not add a transfer duration twice when the transfer already exists as an explicit itinerary event. Flight landing time is not airport-exit time. Include a documented allowance for disembarkation, baggage, immigration, terminal movement, and accessibility where relevant. For the demo these are scenario parameters, not universal industry minimums.

Evaluate all required predecessor constraints using their maximum ready time. For a fixed DAG, a topological forward pass is O(V+E). Mark outcomes as:

- **Directly disrupted**: the provider event itself changed or was canceled.
- **Infeasible without repair**: a required deadline/dependency is violated under the current plan.
- **At risk**: positive but insufficient configured slack, uncertain/stale evidence, or conditional supplier action.
- **Changed but feasible**: e.g. hotel check-in moves later but remains inside its window.
- **Unaffected**: relevant constraints still hold.

A canceled transfer breaks the existing route to later bookings; it does not mean the hotel or event has itself been canceled. Trace the reason chain with values: “Airport-ready time 14:30 is after the shuttle cutoff 11:50.”

Hard validation gates before ranking:

1. No new event is in the past; completed events and irreversible progress remain fixed.
2. Every location transition has a transport leg or evidenced travel duration.
3. Required presence intervals do not overlap; window/cutoff and minimum-connection constraints hold.
4. Every required booking/goal has one selected fulfillment; optional omissions are explicit.
5. Capacity, accessibility, baggage and traveler party constraints hold.
6. Source inventory is active and quotes have not expired; unknown availability is not “available.”
7. Hard budget and must-do constraints hold. Unknown required visa/transit eligibility prevents a claim of verified international feasibility; avoid this in the domestic demo.
8. Relevant cancellation/change policies are valid at the scenario clock; grouped reservations are handled together.
9. Every active disruption is reflected in the same candidate itinerary.

Keep deterministic `slackMinutes` and evidence freshness separate from probabilistic success. Do not invent a “93% safe” number. GTFS explicitly states that missing realtime updates do not imply that a service is on time. [GTFS Trip Updates](https://gtfs.org/documentation/realtime/feed-entities/trip-updates/).

## Practical bounded search

Use 3–6 candidate choices per changed decision, a fixed small catalog for one destination, and bounded best-first/beam search over the affected future region. Include keeping a valid booking, replacing a missed leg, changing a service slot, reordering soft dependencies, and dropping an optional activity. Frozen past and future hard anchors reduce the search space. Search with more than one preference profile so pruning does not accidentally remove every cheap or low-change alternative.

```text
recover(tripVersion, activeEvents, preferences, now):
  snapshot = normalizeAndDeduplicate(activeEvents, now)
  baseline = applyAbsoluteProviderUpdates(tripVersion, snapshot)
  lock(completedEvents, inProgressCommitments, hardAnchors)
  impact = evaluateDependencyConstraints(baseline)
  region = affectedFutureRegion(impact, includingPolicyGroups)
  offers = fetchOrLoadCandidates(region, now)  // typed provider adapters
  candidates = []

  for objective in [leastCash, keepCommitments, lowEffort]:
    frontier = [baseline]
    while frontier not empty and expansionBudgetRemaining:
      state = popBestBound(frontier, objective)
      issue = firstUnresolvedConstraintOrChoice(state, region)
      if issue is absent:
        verdict = validateWholeItinerary(state, snapshot, now)
        if verdict.pass:
          candidates.append(withMetricsAndEvidence(state, verdict))
        continue
      for action in supportedActions(issue, offers, preferences):
        next = applyActionAndRebuildTravelEdges(state, action)
        if cheapPartialChecksPass(next):
          frontier.add(next)
      frontier = boundedDistinctStates(frontier)

  feasible = deduplicateByActualActions(candidates)
  frontier = paretoFilter(feasible, cash, arrivalLateness,
                         commitmentChanges, travelAndWaiting, restDeficit)
  return chooseUpToThreeDistinct(frontier), impact, rejectedReasonSummary
```

Return fewer than three when fewer are feasible. If none are found, say “No feasible plan found within the checked options,” distinguish bounded-search failure from proven infeasibility, and explain the blocking constraints. Offer a concrete preference relaxation only when appropriate.

This is heuristic bounded search, not a globally optimal solver. With tiny fixtures, exhaustive enumeration of all combinations is an acceptable and simpler first implementation; prune invalid partial itineraries. Add a solver only if someone already knows it. OR-Tools CP-SAT supports integer constraints and reports distinct OPTIMAL, FEASIBLE, INFEASIBLE and UNKNOWN statuses; never present a timed-out search as proven infeasible. [OR-Tools CP-SAT](https://developers.google.com/optimization/cp/cp_solver). Time-window examples are useful conceptual references, although this problem is itinerary repair rather than fleet routing. [OR-Tools VRPTW](https://developers.google.com/optimization/routing/vrptw).

## Exact Mumbai–Goa demo fixture

**All following times, prices, policies, availability and journeys are fictional fixture data. Times are IST on the same scenario day.** Display this label in the demo. One traveler. The pre-existing event booking includes its scheduled hotel pickup and return transfer; missed/unused included transfers have no extra cash charge. The original shuttle was prepaid at ₹400 and is nonrefundable under this fixture's policy.

Original bookings:

- Mumbai→Goa flight arrives 11:00; airport exit allowance is 30 minutes.
- Hotel shuttle departs 12:00, boarding cutoff 11:50, arrives 13:00.
- Fictional homestay check-in starts between 14:00 and 18:00 and takes 20 minutes. Normal check-in is planned 14:00–14:20.
- Event original session is 16:00–17:30; admission cutoff is 15:45. Included hotel pickup at 14:35 takes 45 minutes, arriving 15:20. Return takes 45 minutes.
- The same activity has an 18:00–19:30 session with 17:45 admission cutoff; fixture change fee ₹300. Its included hotel pickup is fixed at 16:35, arriving 17:20.
- Next-day bookings remain untouched.

Canonical proactive-warning rule: the original airport-ready time 11:30 is 20 minutes before shuttle cutoff 11:50. Use an authored 30-minute advisory threshold to label this connection tight while it remains feasible. This threshold is a fixture assumption, not a learned probability or an extra hard boarding requirement.

Inject flight revised arrival **14:00**. Traveler is ready outside the airport at **14:30**. Original shuttle is infeasible. Going via the hotel by even the faster cab gives check-in 15:30–15:50, then earliest event arrival 16:35, which misses the 15:45 admission deadline.

| Recovery | Exact revised sequence | Pay now | Original session | Hotel rest before included pickup |
|---|---|---:|---|---:|
| Lowest cash | Wait 14:30–15:00; replacement shuttle 15:00–16:15; hotel check-in 16:15–16:35; included transfer 16:35–17:20; event 18:00–19:30; included return reaches hotel 20:15 | ₹500 shuttle + ₹300 session change = **₹800** | Moved two hours | 0 min |
| Hotel first | Cab 14:30–15:30; check-in 15:30–15:50; rest 15:50–16:35; included transfer 16:35–17:20; event 18:00–19:30; included return reaches hotel 20:15 | ₹1,500 cab + ₹300 session change = **₹1,800** | Moved two hours | 45 min |
| Keep original event | Cab 14:30–15:20; bag storage 15:20–15:30; ready for event 15:30; event 16:00–17:30; bag retrieval 17:30–17:40; dedicated cab 17:40–18:25; hotel check-in 18:25–18:45 | ₹1,200 outward cab + ₹600 onward cab + ₹200 storage + ₹300 late check-in = **₹2,300** | Preserved | No hotel visit beforehand |

For the third plan, the fixture explicitly contains a **confirmed late-arrival permission extending latest hotel check-in to 22:00**, priced ₹300, and verified storage capacity at the event. The plan uses its own onward cab; it does not also count the included return transfer. Removing either required permission/storage capability makes this plan fail validation. Do not invent these amenities from an LLM.

The budget plan finishes check-in at the exact 16:35 included pickup time. Its fixture assumes pickup at the same lobby and an inclusive 16:35 cutoff with no additional access service. Label its zero-slack dependency tight; any added mandatory access time invalidates it. A feasible plan is not necessarily robust to further delay.

These are non-dominated on the declared comparison axes: cash, original-session preservation, hotel-rest time, and waiting/travel burden. Cheapest has less rest and more waiting/travel than hotel-first; hotel-first preserves less of the original session than the direct plan. If convenience/rest is absent from the objective, hotel-first is dominated and should disappear rather than being forced into a third card.

When “Attend the original 16:00 session” becomes hard, **only Keep original event survives**. If its cash budget is capped below ₹2,300, no listed plan is feasible. Never silently move the must-do event to 18:00. A valuable demo interaction is switching that preference from soft to hard and watching the option set change.

## Financial ledger: avoid misleading savings

Keep separate totals:

- `cashRequiredNow = new purchases + new fees - immediately applied credits`
- `projectedNetExtra = cashRequiredNow - evidenced future cash refunds`
- `cashRefundPending`, `voucherCredit`, `unrecoverablePrepaidAmount`, and `unknownPolicyExposure`

The ₹400 old shuttle is a sunk prepaid loss in all three fixture plans; do not add it again to their incremental cash costs. It may be shown separately as “₹400 prepaid value lost.” Rescheduling the original event for ₹300 is a fee, not a full replacement purchase plus a refund.

For a separate hotel-cancellation test: a ₹3,000 cash refund may be pending while the replacement hotel requires ₹3,500 now. Show **₹3,500 payable now; ₹3,000 expected refund; ₹500 projected net extra**, not “pay ₹500.” A voucher is not cash unless usable against the actual selected purchase.

Duffel's official cancellation flow separates an unconfirmed refund quote from cancellation confirmation, includes quote expiry and refund destination, and distinguishes airline credits from monetary refunds. Some orders require manual cancellation handling. These are good reasons to model policy/quote/execution separately. [Duffel cancellation guide](https://duffel.com/docs/guides/cancelling-an-order).

## Trustworthy LLM usage

Use structured extraction for a pasted itinerary/booking email and plain-language preferences; validate every field and ask the user to review missing/ambiguous dates, airports and amounts. Use the LLM to explain precomputed reason codes and plan tradeoffs, constrained to provided evidence. A deterministic explanation template must work if the model times out.

Never ask the LLM to invent inventory, travel duration, availability, refund entitlement, delay probability or execution success. Treat imported emails/policy text as untrusted data, not instructions. No actual supplier cancellation/payment is part of this prototype's apply button.

An explanation object should include `claim`, `reasonCode`, `bookingIds`, `inputValues`, `policyOrOfferSource`, `computedAt`, and `assumptions`. This powers both the UI and regression tests. Show a rejected attractive option: “₹500 shuttle + original event rejected: earliest event arrival 17:20, admission closes 15:45.”

## Apply and multiple disruptions

Before apply, compare the saved base trip version, recheck quote freshness and validate the whole revised trip against all current events. If state changed, recompute. Apply the selected local plan as one transaction, increment the trip version, and record before/after plus action ids. Double clicking must not double apply. Label the result **itinerary updated / booking actions simulated**, unless a genuine supplier confirmation exists.

For compound disruptions, solve one combined state. Example: delay plus hotel cancellation means the replacement hotel changes the travel times to the same event; independently merging two local fixes can create an impossible journey. Current event updates replace prior versions instead of stacking delay minutes. Correlated weather disruptions share a root cause, but no probability arithmetic is needed for the MVP.

Duffel offers expose test/live mode and an expiration timestamp; search results are therefore snapshots, not permanent reservations. [Duffel Offers](https://duffel.com/docs/api/offers). Official error handling recommends checking expiry before attempting an order and documents offer unavailability. [Duffel response handling](https://duffel.com/docs/api/overview/response-handling).

## Scope and validation for two people

**Must build:** one destination fixture; 6–10 itinerary bookings; flight delay and one hotel/activity cancellation event type; graph/timeline impact display; candidate generation with actual constraints; up to three distinct feasible options; cash/refund ledger; hard must-do toggle; before/after diff; transactional local apply; explanations; visible source badges; deterministic replay/reset.

**Strong stretch:** second simultaneous disruption, pasted itinerary extraction, live weather as evidence for a warning, one read-only provider adapter, stale-quote failure. Keep the fictional fixture as an explicit offline demo mode even if a live adapter is added.

**Cut:** real payment/ticketing, broad rail/global travel integrations, OCR pipeline, production account linking, group negotiation, insurance/compensation adjudication, learned delay probabilities, autonomous supplier contact, graph DB, microservices, complex optimization installation.

Meaningful tests, in priority order:

1. Baseline itinerary valid; injected delay misses shuttle without falsely canceling the hotel.
2. Exact three fixture plans validate and cash totals equal ₹800/₹1,800/₹2,300; all offered transport legs exist.
3. Hard original-session preference leaves exactly one plan; budget below ₹2,300 leaves zero.
4. Late-check-in permission removed: direct-event plan rejected.
5. Whole hotel stay can overlap daytime sightseeing; check-in required presence cannot overlap transit.
6. No double-counted sunk cost/refund; pending refund does not reduce cash required now.
7. Flight arrival update 14:00 followed by 14:20 means 14:20, not another added delay.
8. Delay plus hotel cancellation is validated together; completed events remain unchanged.
9. Expired offer, stale trip version and duplicate apply are handled safely and visibly.
10. Same-city wrong airport, timezone crossing and impossible travel duration have explicit failing fixtures if time permits.

Target under one second for the pure fixture engine on the development machine and report the measured result. Treat overall response time, validity rate over curated scenarios, changed-booking count, and retained hard commitments as measured prototype metrics, not invented production performance.
