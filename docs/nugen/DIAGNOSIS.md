# Nugen diagnosis and safe recovery integration

Checked 27 September 2026, approximately 06:52 IST. Published freeze 11:00 IST (~4 hours remaining).

## Evidence before implementation

Raahi is Next.js 16.3.6, React 19, TypeScript, Node 24. Pure recovery/graph engines are in src/engine; revisioned storage and plan revalidation are in src/repositories; browser state is shared by TripProvider through /api/trip. The original simulated copilot is in src/demo/copilot.ts and src/components/copilot.ts.

Earlier work uploaded a 389-word authored guidance document and 20-question benchmark, then requested hosted alignment of llama-v3p2-3b-reasoning. Three attempts (not just two) were accepted as PROCESSING and subsequently failed at 0% with `Finetuning failed: Nugen job creation failed: HTTP 502 Bad Gateway`. All have null model IDs. See SUPPORT_REPORT.md for IDs. A minimal independent Llama inference request also returned 502. Authentication and read-only project/model APIs succeed. Latest read-only check at 01:15 UTC still found zero aligned models. No new alignment or inference retry was made in this implementation turn.

This places the observed failure at Nugen's upstream training/inference service boundary. The provider's internal root cause is unknown; our logs cannot distinguish infrastructure, capacity or a provider-side model configuration problem. This is not evidence of invalid credentials, a frontend CORS failure, or Next.js incompatibility. The missing model and alignment environment values are a consequence of unsuccessful training. Existing integration used REST fetch, not a Nugen SDK.

## Current official contract

- Alignment: POST https://api.nugen.in/api/v3/alignment-projects/create; Bearer API key; JSON alignment_name, base_model_id, document_ids, optional benchmark_id. Accepted PROCESSING does not mean successful training.
- Inference: POST https://api.nugen.in/api/v3/inference/chat/completions; Bearer API key; JSON model, messages with role/content, max_tokens, temperature, stream. Raahi uses nonstreaming, short responses and validates choices[0].message.content as JSON. Successful provider output has only been mocked, not observed for this account.
- Aligned model deployment is a separate provider step. Verify completed alignment, associated model, deployment and real inference before enabling.
- Official references: https://docs.nugen.in/api-reference/general/create-alignment ; https://docs.nugen.in/api-reference/inference/generate-chat-completions ; https://docs.nugen.in/api-reference/models/deploy-aligned-model

## Implemented architecture

Disruption -> existing deterministic engine -> engine-checked options -> optional server-side explanation (Nugen or labeled simulation) -> existing signed review -> user applies -> repository revalidates -> itinerary and dependency graph render persisted applied segments.

The new POST /api/recovery/insight reads the session's authoritative state. The browser submits only revision; cross-origin and stale requests are rejected. It supports both existing local-file and hosted-cookie readers, without writing state. src/server/recovery-advisor.ts cannot call the repository or mutate plans. It sends only authored demo categories/numeric constraints; personal itineraries use local fallback. No profile, booking reference, PDF, passenger data or arbitrary booking text is sent.

Nugen is advisory only. Unavailability, authentication/rate errors, malformed output or timeout return explicit simulation provenance. Model response schema rejects plan payloads. A model paragraph remains untrusted advisory text, not a feasibility guarantee. Five-second provider timeout, seven-second browser timeout, one request in flight, five-minute bounded cache and one-minute failure circuit limit provider usage. Circuit/cache are process-local, appropriate to this single-process demo; they are not a distributed billing limit.

Only visible change: an Explain recovery options button and labeled result using existing recovery styling. UI layout/CSS, simulated copilot, core engine and apply logic were not changed in this milestone. Revision-keyed component cancels requests and removes stale explanations when the trip changes.

## Activation and rollback

Secrets remain only in ignored .env.local. Required: NUGEN_API_KEY, NUGEN_ALIGNED_MODEL_ID, NUGEN_ALIGNMENT_ID. Recovery calls additionally require NUGEN_RECOVERY_ENABLED=true. Default unset keeps reliable simulation mode without credit use. Do not enable before completing alignment/deployment and running held-out evaluation and live inference. Never insert a fabricated model ID. Restart production after configuration changes. Roll back live recovery calls by removing/setting the enable flag false and restarting; existing plans continue working. Existing weather-insight route is separate and remains unconfigured until a real aligned model exists.

## Verification actually completed

- 37 tests pass, including 8 new adapter/integration cases: disabled/missing/personal no-network gates, 401/429/502 fallback and circuit, timeout, invalid JSON/unexpected plan output, mocked success/cache/privacy, and disruption through persisted recovery graph.
- Production build and TypeScript passed under Node 24.
- Browser: 3-hour flight delay, protected concert and INR 2500 budget, explicit simulation fallback, review/apply INR 2300 recovery, nine revised itinerary items, original concert 16:00, updated cab/storage/hotel graph. Demo reset afterward.
- Live Nugen success and its evaluation remain blocked and unclaimed. No paid upgrade or purchase. Local preview http://127.0.0.1:3001/recovery.
