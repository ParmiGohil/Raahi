import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { repository } from '../../../../repositories/trip';
import { BrowserSessionRepository } from '../../../../repositories/browser-session';
import { recoveryForState } from '../../../../engine/journey';
import { recoveryAdvisor } from '../../../../server/recovery-advisor';
import { nugenReady } from '../../../../server/nugen-readiness';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: NextRequest) {
  try { if (new URL(request.headers.get('origin') ?? '').host !== request.headers.get('host')) return json({ error: 'Same-origin requests only.' }, 403); }
  catch { return json({ error: 'Same-origin requests only.' }, 403); }
  try {
    const raw = await request.text();
    if (raw.length > 200) return json({ error: 'Request too large.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
    if (!Number.isInteger(body?.revision)) return json({ error: 'Revision required.' }, 400);
    const jar = await cookies(), id = jar.get('raahi-session')?.value;
    if (!id || !/^[a-f0-9]{64}$/.test(id)) return json({ error: 'Open your trip first.' }, 401);
    const storage = process.env.RAAHI_STORAGE === 'cookie' || process.env.VERCEL ? new BrowserSessionRepository(jar.get('raahi-trip')?.value, () => {}) : repository;
    const state = await storage.read(id);
    if (state.revision !== body.revision) return json({ error: 'Trip changed. Refresh the explanation.' }, 409);
    const config = { enabled: process.env.NUGEN_RECOVERY_ENABLED, key: process.env.NUGEN_API_KEY, model: process.env.NUGEN_ALIGNED_MODEL_ID, alignment: process.env.NUGEN_ALIGNMENT_ID };
    if (state.mode !== 'personal' && config.enabled === 'true' && config.key && config.model && config.alignment && !await nugenReady(config.key, config.model)) {
      const fallback = await recoveryAdvisor(state, recoveryForState(state), { enabled: 'false' });
      return json({ ...fallback, reason: 'model-unavailable' });
    }
    return json(await recoveryAdvisor(state, recoveryForState(state), config));
  } catch { return json({ error: 'Explanation unavailable. Your recovery options remain available.' }, 503); }
}
