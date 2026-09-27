# Nugen connection and remaining evidence

The existing simulated copilot is unchanged. Weather insight calls use only transport kind, weather variables and whether the scenario is live forecast or hypothetical. Passenger names, booking references, PDFs and full itineraries are not sent.

Fill the ignored `.env.local` fields: NUGEN_API_KEY, NUGEN_ALIGNED_MODEL_ID, NUGEN_ALIGNMENT_ID. Restart the production server after changing them. Never commit the key. Before enabling, inspect the model's actual alignment domain and deployment status. Configured identifiers alone do not prove completed alignment.

The weather insight endpoint calls Nugen v3 chat completions; structured output is validated. Missing credentials, provider errors and invalid output are displayed honestly, with no fabricated AI fallback. Its advisory explains exposure and recommended verification; it never changes prices, bookings, fixed events or numeric engine predictions.

raahi-domain.txt is a prepared authored corpus if the existing aligned model needs domain refinement. evaluation.jsonl is a separately prepared scenario checklist, not evidence of completed evaluation. Run both base and aligned models on these cases after account access; save model IDs, alignment status, outputs and scored checks. Neither model is claimed evaluated yet.

## Learning data

No real outcome dataset has been supplied. scripts/evaluate-weather-learning.mjs accepts observed JSONL rows with id, at (ISO timestamp), source="observed", evidence, kind, rain, wind, temperature, hours and observedWeatherDelay (minutes attributable to weather with supporting evidence). Do not submit total delay from unrelated causes as a weather observation.

The script fits an exploratory scale factor using the oldest 75% and evaluates on the newest 25%. It requires 20 rows, rejects invalid/missing provenance and writes an ignored candidate report. It does not auto-promote candidates. Group related observations by weather event before using a larger dataset to avoid event leakage. No continual learning or real-world accuracy is claimed until observations, evaluation and a reviewed update exist.

## Forecast uncertainty

ICON ensemble members are propagated separately through the existing dependency engine, using the same member's weather inputs for each run. Displayed fractions refer to newly blocked connections across those simulated runs, excluding already blocked baseline connections. Travel response coefficients remain authored and uncalibrated; fractions are not calibrated real-world probabilities. Missing itinerary data disables uncertainty summaries.

## Sources

- https://docs.nugen.in/api-reference/inference/generate-chat-completions
- https://docs.nugen.in/api-reference/models/deploy-aligned-model
- https://open-meteo.com/en/docs/ensemble-api
- https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/searchPosts.json

## Actual account work — 27 September 2026
User authorized only free hackathon credits, uploaded guidance and benchmark, and dedicated local API key. Account originally had no aligned model despite user's initial impression. Ready document: document_01m3g5anz0k5vy4w. Ready benchmark: benchmark_01m3g5ejrdakzdm1. First alignment alignment_01m3g5h7j6shnz64 failed: Finetuning failed: Nugen job creation failed: HTTP 502 Bad Gateway. Training data upload outcome unknown; no model ID. Balance after failure showed INR 9571.59 and INR 0 used. One retry alignment_01m3g5sqm0xtcbr2 accepted PROCESSING. No purchase, upgrade or payment method. Key is stored only in ignored .env.local, never copied into this document.

Retry alignment_01m3g5sqm0xtcbr2 also FAILED with the same upstream HTTP 502 at job creation, progress 0, no model. Do not claim integration complete. Final checked credits: INR 9571.59, used INR 0.00. Contact organisers/provider with these run IDs; no further blind retries.
