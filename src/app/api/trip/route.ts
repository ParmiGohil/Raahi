import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { commandSchema } from '../../../domain/requests';
import { recover } from '../../../engine/recover';
import { repository, Conflict, InvalidPlan, quoteFor } from '../../../repositories/trip';
import type { TripState } from '../../../domain/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function session() {
  const jar = await cookies();
  const existing = jar.get('raahi-session')?.value;
  if (existing && /^[a-f0-9]{64}$/.test(existing)) return existing;
  const id = randomBytes(32).toString('hex');
  jar.set('raahi-session', id, { httpOnly: true, sameSite: 'strict', secure: process.env.RAAHI_HTTPS === 'true', path: '/', maxAge: 86400 * 7 });
  return id;
}
function payload(id: string, state: TripState) {
  const { requests: _requests, ...publicState } = state;
  return { state: publicState, recovery: recover(state.scenario, state.preferences), quote: quoteFor(id, state.revision) };
}
function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } }); }
export async function GET() {
  try { const id = await session(); return json(payload(id, await repository.read(id))); }
  catch (error) { console.error('Trip read failed', error); return json({ error: 'Could not load the demo. Please retry.' }, 500); }
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return json({ error: 'Cross-origin writes are not allowed.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'JSON required.' }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 10000) return json({ error: 'Request is too large.' }, 413);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
    const command = commandSchema.safeParse(parsed);
    if (!command.success) return json({ error: 'Invalid action, budget or revision.' }, 400);
    const id = await session();
    return json(payload(id, await repository.update(id, command.data)));
  } catch (error) {
    if (error instanceof Conflict || error instanceof InvalidPlan) return json({ error: error.message }, 409);
    console.error('Trip write failed', error);
    return json({ error: 'Could not save the itinerary. Your previous revision is preserved.' }, 500);
  }
}
