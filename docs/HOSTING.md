# Hosting Raahi on Vercel

This release has two explicit persistence modes:

- Local Node default: atomic JSON files in `.raahi`, serialized writes within one process.
- Vercel (automatic), or `RAAHI_STORAGE=cookie`: an encrypted, authenticated, HTTP-only browser cookie. The entire small fictional trip survives serverless cold starts. Visitors have isolated demos; there is no shared database or cross-device trip sync. Cookies expire after seven days. Clearing browser data resets that visitor's demo.

The hosted mode is for one active demo per browser. Revision checks and idempotent retries work against the submitted cookie state, but parallel writes on different serverless instances do not provide database-level concurrency guarantees. Use a transactional hosted database before adding collaborative trip editing or real booking execution. Do not advertise this prototype as multi-user persistent travel storage.

## Configuration

Set `RAAHI_SIGNING_SECRET` to a random value of at least 32 characters in both Vercel production and preview environments. Generate it securely and pipe it into `vercel env add`; do not commit or print the secret. A stable secret is required for cookie encryption and the ten-minute review signature. Vercel fails closed if it is missing. Rotating it invalidates existing demo cookies and quotes.

Node 24 is selected through package.json. Framework: Next.js. Build: `npm run build`. Root: repository root. No model API key, paid database, real supplier account or booking integration is required.

The current integrated website branch is `codex/raahi-connected-experience`. Deploy this branch only after confirming the intended production branch and configuring `RAAHI_SIGNING_SECRET`. For optional live Nugen advisories, also configure `NUGEN_API_KEY`, `NUGEN_ALIGNMENT_ID`, `NUGEN_ALIGNED_MODEL_ID` and `NUGEN_RECOVERY_ENABLED=true` in the hosting environment. Keep credentials server-side; never upload `.env.local`, `.raahi` or private archives. If Nugen is unavailable, Raahi displays its labeled simulation fallback. `.vercelignore` restricts uploaded context. The hosted cookie mode is intended for the small fictional demo; larger personal/PDF itineraries need hosted persistence before production use.

## Presentation flow

1. Open the site in a fresh browser or reset the demo.
2. Select **Try copilot → Keep my concert → Run demo request**.
3. Explain that interpretation is an authored simulation. The engine actually checks timing, budget and constraints.
4. Confirm **Use these preferences**, then review the ₹2,300 recovery and apply it.
5. Reload to show the itinerary survives.
6. Reset, select **Challenge the budget**, and show that the engine refuses an impossible promise.

No actual model is connected. The progress sequence is a timed demo replay, not a trace of model reasoning or external provider calls. Preference confirmation changes scenario/constraints only; the separate review/apply step changes the itinerary. Provider execution remains simulated.
