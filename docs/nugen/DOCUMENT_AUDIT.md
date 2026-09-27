# Alignment document audit - 27 September 2026

## Findings

The original raahi-domain.txt is 389 whitespace-separated words, valid readable text, and previously reached READY. It is supported by Developer edition's plain-text requirement. The documentation reviewed specifies a 100 MB maximum but does not publish a minimum word count; we cannot claim that 389 words causes training failure. READY proves ingestion, not the success of downstream training-data generation.

Original quality gaps: terse coverage, no exact JSON response examples, no separate recovery-explanation task contract, and limited coverage of money units, no-plan handling and prototype application semantics. These may limit alignment usefulness; they are not established causes of HTTP 502.

A separate compatibility issue: the original benchmark uses question_num/question/answer. Current public OpenAPI documents sample_num/instruction/response. Earlier Nugen upload normalized the old file into 20 valid samples, so this mismatch does not establish the cause of the failed runs. The new file uses the documented names directly.

Provider evidence remains: accepted jobs failed at upstream job creation with HTTP 502 and no model, and independent minimal inference also returned 502. A provider-side data-processing bug cannot be excluded without logs, but evidence does not justify blaming document content or promising a revised file will fix the service.

## New local artifacts

- raahi-domain-v2.txt: 1,388 words, 10,231 bytes, UTF-8 plain text; authored rules with illustrative examples and separate weather/recovery output contracts.
- alignment-benchmark-v2.json: 28 unique instruction/response samples, valid JSON, sequential sample_num values. Original 20 concepts retained with eight checks added.
- Original files and evaluation.jsonl are unchanged. Do not upload the held-out evaluation checklist as training material. The uploaded benchmark is a development evaluation, not an independent proof of generalization; use separate unseen cases after training.

Validated local encoding, JSON structure, unique questions, nonempty fields and sizes. No provider-side upload or alignment was attempted; new files have not been certified by Nugen. Website code/UI and credentials are unchanged. These files are longer than v1 and could consume more free training credits; no exact quote is available.

## Use the v2 pair

Upload raahi-domain-v2.txt under Documents and wait for READY. Upload alignment-benchmark-v2.json under Benchmarks associated with the NEW document ID. Select the new document and new benchmark when creating a new alignment. Do not select both v1 and v2. Existing alignment jobs snapshot documents and will not change when you upload a replacement. Select a supported text model, ideally confirmed working by Nugen support. Use free credits only; do not enable auto-recharge or purchase credits. On failure, preserve the new run ID and error and ask support rather than repeating jobs.

## Official sources inspected

- https://docs.nugen.in/api-reference/documents/upload-documents (Developer plain text, size limit, READY processing)
- https://api.nugen.in/openapi-public.json (current /api/v3/benchmarks/upload description and exact sample fields)
- https://docs.nugen.in/api-reference/general/create-alignment (document snapshots, alignment workflow)

Older search-index entries expose obsolete endpoint paths. The current documentation index and public OpenAPI were used for the revised format. This audit concerns upload compatibility and task coverage, not empirical weather science or validated forecasting accuracy.
