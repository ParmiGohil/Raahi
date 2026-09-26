# Travel API feasibility and evidence

Research checked: **26 September 2026**. Scope: a **two-person, 24-hour hackathon**, with no known existing API accounts. The core demonstration is Mumbai → Goa, connecting a flight, airport transfer, homestay/hotel, and a timed event/activity.

## Decision

Build the complete recovery engine using deterministic, explicitly labelled fixtures. It must work offline without accounts or API keys. Add Open-Meteo as an **optional live contextual enhancement only after the core works**. Add at most **one additional provider total**: a route provider **or** flight status **or** a flight sandbox. Do not integrate all three.

For this team and scenario, a road-duration provider is the most useful additional integration if access is easy: travel time directly influences whether the replacement airport transfer can preserve the evening event. Otherwise stop at weather. A working dependency engine, constraint checks, policy-aware costs, and persistent recovery state are more valuable than a large provider list.

A main-demo cancellation or delay must be visibly injected through the simulator; it must not be presented as a live airline event. Current weather belongs in a separately labelled live panel, distinct from the seeded disruption and frozen scenario clock.

## Evidence status

- Official provider documentation and current public access/pricing pages were researched.
- **Open-Meteo was successfully called from this environment on 26 September 2026.**
- No authenticated provider was smoke-tested: credentials were not supplied. Documentation describing quick signup is not evidence that this team has working access.
- Amadeus's current homepage was inspected in a browser because text-only retrieval did not render its dynamic announcement. It says the Self-Service portal has been decommissioned on July 17th and the site is now Enterprise API Portal only. The announcement itself does not state the year; avoid adding a year as a direct quotation.
- Time estimates and go/no-go recommendations below are engineering judgments, not provider guarantees.

## Provider matrix

| Capability/provider | Verified access and limitations | Decision for this hackathon |
|---|---|---|
| **Open-Meteo weather** | No API key, signup, or card for noncommercial use. Free API permits 10,000 calls/day, requires attribution, and has no uptime guarantee. Forecast normally covers 7 days, with up to 16 available. [Pricing](https://open-meteo.com/en/pricing), [forecast docs](https://open-meteo.com/en/docs) | Optional first enhancement. One request per destination can enrich nearby outdoor activities. Forecast risk is not proof of airline cancellation or attraction closure. Core must work without it. |
| **Google Routes** | Billing-enabled project and API key/OAuth required. Compute Routes bills per request; matrix bills per origin–destination element. Traffic-aware routing uses a higher SKU. Transit fare is returned only when the API can determine it for every step. [Billing](https://developers.google.com/maps/documentation/routes/usage-and-billing), [transit](https://developers.google.com/maps/documentation/routes/transit-route) | Best additional-provider option if onboarding succeeds quickly. Road duration supports transfer feasibility; it does not establish taxi availability, price, or train seat availability. Seed route durations otherwise. |
| **openrouteservice** | Developer key required. Official FAQ documents a default Directions limit of 2,000/day and 40/minute. [Official limits](https://giscience.github.io/openrouteservice/frequently-asked-questions) | Alternative to Google, not another integration alongside it. Useful for baseline road durations; do not imply live traffic or bookable transport inventory. |
| **Aviationstack flight status** | Current free plan advertises 100 monthly requests, real-time flights, HTTPS, and noncommercial use. Historical/future flight and schedules appear in paid plans. Basic currently lists $49.99/month. [Pricing](https://aviationstack.com/pricing) | Optional instead of routing or sandbox, only after an exact flight/date returns useful fields. Manual refresh or deduplicated server calls. Ten-minute polling for 24 hours is 144 calls, exceeding the free monthly allowance. |
| **Duffel flight sandbox** | Test token through dashboard. Synthetic Duffel Airways supports search, booking, cancellation, and changes; schedules and prices are unrealistic. Other airline sandboxes may be unreliable. [Getting started](https://duffel.com/docs/guides/getting-started-with-flights), [test mode](https://duffel.com/docs/api/overview/test-mode) | Optional instead of routing or status, chiefly to prove an adapter. Label every offer and action Sandbox. Do not use synthetic global offers as realistic India inventory. |
| **Duffel production** | Current onboarding requires email verification and business/personal/KYC information before live mode. Some airline sources require further information. [Onboarding](https://duffel.com/guides/getting-started) | Exclude from critical path. No real money, ticket issuance, or production booking is needed for this prototype. |
| **Booking.com hotel inventory** | Even sandbox prerequisites include Managed Affiliate Partner registration, an agreed contract, account-manager-provided Partner Centre access, API key, and affiliate ID. [Prerequisites](https://developers.booking.com/demand/docs/getting-started/prerequisites), [sandbox](https://developers.booking.com/demand/docs/getting-started/sandbox) | No-go without existing credentials. Seed 4–6 hotel/homestay alternatives with capacity, check-in windows, costs, policy deadlines, and synthetic availability. |
| **Duffel Stays** | Official getting-started guide separately requires requesting Stays access. [Stays guide](https://duffel.com/docs/guides/getting-started-with-stays) | Exclude from this two-person build. |
| **Google Places/geocoding** | Offers place search and details, not hotel-room or activity inventory. Hotel queries do not support the price-level filter. [Places reference](https://developers.google.com/maps/documentation/places/web-service/reference/rest), [Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search) | Seed coordinates. A nearby hotel result must never be represented as an available room at a quoted price. No need for a second mapping capability. |
| **Viator activities** | Official affiliate page says Basic API access follows affiliate signup; further access requires qualifications. Technical docs distinguish affiliate redirect flows from merchant transactional access. [Affiliate access](https://partnerresources.viator.com/travel-commerce/affiliate/), [technical docs](https://docs.viator.com/partner-api/technical/) | Exclude from the core. Future option for activity content/redirects after exact endpoint access is verified. Seed timed slots and cancellation policies now. |
| **Indian rail booking** | IRCTC publishes business integration schemes with administrative onboarding before sharing web-service integration documents. This is not evidence of a self-service hackathon sandbox. [IRCTC B2C document](https://contents.irctc.co.in/en/NormsforB2CMobile.pdf) | Support trains as itinerary nodes and seeded alternatives. Do not promise live seats, arbitrary PNR modification, or confirmed railway rebooking. The policy PDF is older; do not treat its listed fees as a freshly verified current quote. |
| **Amadeus Self-Service** | Current official homepage says Self-Service has been decommissioned and the site is now Enterprise API Portal only. Older searchable Self-Service docs remain indexed. [Current portal](https://developers.amadeus.com/) | Exclude. Older hackathon tutorials recommending immediate Amadeus Self-Service signup are unsuitable for this build. |

## Open-Meteo smoke check

Successful unauthenticated read performed **26 September 2026** for Mumbai coordinates `19.0760, 72.8777`, requesting hourly precipitation probability, 10 m wind speed, and weather code for one day with `Asia/Kolkata` timezone.

Observed response metadata:

```json
{
  "timezone": "Asia/Kolkata",
  "hourly_rows": 24,
  "first_timestamp": "2026-09-26T00:00",
  "variables": ["time", "precipitation_probability", "wind_speed_10m", "weather_code"]
}
```

This verifies endpoint access and schema, not a forecast for the seeded Goa disruption. Use Goa coordinates and the relevant current date for the optional live panel. Preserve source attribution and retrieval time.

## Integration gate

After the fixture core works, spend no more than **45 minutes total** attempting onboarding/smoke checks for the one additional provider. Stop sooner if a contract, unavailable endpoint, KYC review, or unresolved coverage problem appears. Do not cycle through a catalogue of vendors.

Keep a provider only if a server-side call returns every field needed for the selected use case:

- Weather: correct destination, timezone, and date window.
- Routes: exact origin/destination produces plausible road duration.
- Status: carrier, flight number, date, status, scheduled/estimated times, and freshness are usable; handle codeshares and null fields.
- Duffel: test search succeeds, response normalizes, token stays on server, and all results are visibly sandbox data.

If access fails, use fixtures without delaying core implementation or rehearsal. No API account is required to run the final demo.

## Policy and cost semantics

Duffel explicitly documents that its offer/order conditions describe **voluntary changes before departure**. Airline-initiated disruptions and bookings where a flight has already departed can follow different rules. `null` means unknown, not free or prohibited. Penalties may use a different currency. [Official conditions guide](https://duffel.com/docs/guides/displaying-offer-and-order-conditions)

The engine should preserve policy source text and normalized fields:

```ts
type RecoveryPolicy = {
  source: string;
  sourceExcerpt: string;
  appliesToReason: "voluntary" | "supplier_disruption" | "unknown";
  appliesBefore?: string;
  refundType: "cash" | "voucher" | "unknown";
  refundableAmount?: number;
  fee?: number;
  currency: string;
  certainty: "confirmed" | "estimated" | "unknown";
};
```

An LLM may extract and explain policy terms but must not invent refunds, fees, availability, or legal entitlement. Unknown policies stay unknown. Fixture policy rules must be clearly synthetic.

Show payment needed now, confirmed cash refund, estimated/pending refund, voucher credit, and net incremental trip cost separately. Do not subtract an uncertain future refund from cash needed now. Do not count cancellation fees twice if already deducted from the stated refund. Keep original currencies or explicitly timestamp conversions.

Importing a confirmation does not automatically create supplier API authority to modify that booking. Selecting a recovery plan updates the local planned itinerary; external actions remain separately marked `simulated`, `sandbox-confirmed`, or `requires traveler action`. Do not say a hotel was externally changed after only updating local state.

## Minimal adapter contract

```ts
type ProviderResult<T> = {
  provider: string;
  mode: "live" | "sandbox" | "simulation";
  fetchedAt: string;
  effectiveAt?: string;
  expiresAt?: string;
  availability: "confirmed" | "unknown" | "unavailable";
  data: T;
  warnings: string[];
};
```

Keep data availability distinct from a supplier confirming a booking. A successful HTTP response is not a confirmed room, ticket, or vehicle.

Suggested capabilities: `getStatus`, `searchAlternatives`, `getRouteDuration`, `getWeather`, `quoteChange`, `applyRecovery`. Implement only the capabilities needed for the fixture engine and chosen optional provider. No integration framework is necessary.

Distinguish provider error, no search results, unknown data, and genuinely unavailable inventory. Read requests may run in parallel with bounded timeouts and partial results. Cache/deduplicate only as allowed by provider terms. Keep keys server-side and remove sensitive traveler data from logs.

Duffel search can use its default 20-second supplier window; some booking operations take much longer. Do not promise two-second live search. Expired offers require new search rather than blind retries. [Response times](https://duffel.com/docs/api/overview/response-times), [response handling](https://duffel.com/docs/api/overview/response-handling)

## Offline and demonstration behavior

- Main mode: **Simulation**, fixed scenario clock, seeded disruption, deterministic inventory/policies/prices.
- Current weather: separately labelled live panel with actual destination, date, retrieval timestamp, and attribution; optional and nonblocking.
- Weather failure: panel says unavailable, while the recovery flow remains fully usable. Do not silently replace live observations with fictional ones under a live badge.
- Entirely offline: fixture simulation remains complete. Seeded risk signals are visibly synthetic; show no false live badges.
- Refresh/reset: deterministic restoration of the same scenario and clock.
- Selection: persists a new planned-itinerary version and shows the before/after changes. Supplier actions remain simulated unless a sandbox operation actually succeeded.

Example honest demo labels: “Simulation: flight delayed 120 minutes”; “3 downstream bookings affected”; “Synthetic hotel policy”; “Live forecast fetched 14:22 IST”; “Recovery plan applied to itinerary”; “Supplier changes simulated.”

The judged achievement should be the recovery logic and its explanation, not an unearned claim of universal real-world rebooking.
