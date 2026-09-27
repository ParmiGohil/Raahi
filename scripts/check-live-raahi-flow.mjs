// Uses a fresh demo cookie, never a visitor's saved trip. One Nugen call if enabled.
import { randomUUID } from 'node:crypto';
const origin = process.argv[2] || 'http://127.0.0.1:3001';
const start = await fetch(`${origin}/api/trip`);
if (!start.ok) throw new Error(`Trip start HTTP ${start.status}`);
const cookie = start.headers.get('set-cookie')?.split(';')[0];
if (!cookie) throw new Error('Demo session cookie missing');
const initial = await start.json();
async function post(path, body) {
  const response = await fetch(`${origin}${path}`, { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(40000) });
  const value = await response.json();
  if (!response.ok) throw new Error(`${path} HTTP ${response.status}: ${value.error ?? 'unknown error'}`);
  return value;
}
const delayed = await post('/api/trip', { action: 'copilot', expectedRevision: initial.state.revision, scenario: 'delay', preferences: { protectOriginal: true, budget: 250000 } });
const advisory = await post('/api/recovery/insight', { revision: delayed.state.revision });
const option = delayed.recovery.plans.find(plan => plan.id === 'original');
if (!option || option.ledger.cashNow !== 230000) throw new Error('Expected protected ₹2,300 option missing');
const applied = await post('/api/trip', { action: 'apply', expectedRevision: delayed.state.revision, planId: option.id, quote: delayed.quote, idempotencyKey: randomUUID() });
console.log(JSON.stringify({ advisorySource: advisory.source, advisoryReason: advisory.reason, advisoryMessage: advisory.message, cashNowPaise: option.ledger.cashNow, appliedPlan: applied.state.applied?.planId, appliedBookingCount: applied.state.applied?.segments?.length, revision: applied.state.revision }, null, 2));
