import { describe, it, expect, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRecoveryAdvisor } from '../src/server/recovery-advisor';
import { initialState } from '../src/fixtures/trip';
import { analyzeJourney, recoveryForState } from '../src/engine/journey';
import { TripRepository, quoteFor } from '../src/repositories/trip';
const config = { enabled: 'true', key: 'test-only', model: 'mock-model', alignment: 'mock-alignment' };
const state = { ...initialState(), scenario: 'delay' as const };
describe('isolated Nugen recovery advisory', () => {
  it('makes no call when disabled, incomplete or personal', async () => {
    const fetcher = vi.fn(); const advisor = createRecoveryAdvisor(fetcher);
    for (const cfg of [{}, { enabled: 'true' }]) expect((await advisor(state, recoveryForState(state), cfg)).source).toBe('simulation');
    expect((await advisor({ ...state, mode: 'personal' }, recoveryForState(state), config)).reason).toBe('personal-trip-local');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([401, 429, 502])('falls back for HTTP %s and opens circuit', async status => {
    const fetcher = vi.fn(async () => new Response('', { status })); const advisor = createRecoveryAdvisor(fetcher);
    expect((await advisor(state, recoveryForState(state), config)).reason).toBe('provider-unavailable');
    expect((await advisor(state, recoveryForState(state), config)).reason).toBe('temporarily-unavailable');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects malformed and plan-bearing model output', async () => {
    for (const content of ['not JSON', JSON.stringify({ message: 'An explanation', plans: [{ price: 1 }] })]) {
      const advisor = createRecoveryAdvisor(async () => Response.json({ choices: [{ message: { content } }] }));
      expect((await advisor(state, recoveryForState(state), config)).source).toBe('simulation');
    }
  });
  it('bounds a slow provider request', async () => {
    const advisor = createRecoveryAdvisor((_url, options) => new Promise((_resolve, reject) => {
      options!.signal!.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
    }), 10);
    expect((await advisor(state, recoveryForState(state), config)).source).toBe('simulation');
  });
  it('validates a mocked success, caches it and omits personal fields', async () => {
    const fetcher = vi.fn(async () => Response.json({ choices: [{ message: { content: JSON.stringify({ message: 'Review the engine-checked options before applying.' }) } }] }));
    const advisor = createRecoveryAdvisor(fetcher);
    const withProfile = { ...state, profile: { name: 'Private Name', email: 'private@example.test', city: 'Private City', travelStyle: 'private' } };
    const before = JSON.stringify(withProfile);
    expect((await advisor(withProfile, recoveryForState(state), config)).source).toBe('nugen');
    expect((await advisor(withProfile, recoveryForState(state), config)).reason).toBe('cached');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(fetcher.mock.calls)).not.toContain('Private Name');
    expect(JSON.stringify(withProfile)).toBe(before);
  });
  it('completes disruption → failed provider → valid plan → apply → persisted graph', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'raahi-advisor-'));
    try {
      const repo = new TripRepository(dir), id = 'c'.repeat(64);
      const delayed = await repo.update(id, { action: 'copilot', scenario: 'delay', preferences: { protectOriginal: true, budget: 250000 }, expectedRevision: 1 });
      const recovery = recoveryForState(delayed);
      expect(recovery.impacts.some(i => i.state === 'blocked')).toBe(true);
      const advisor = createRecoveryAdvisor(async () => new Response('', { status: 502 }));
      expect((await advisor(delayed, recovery, config)).source).toBe('simulation');
      const plan = recovery.plans.find(p => p.id === 'original')!;
      expect(plan.ledger.cashNow).toBe(230000);
      const applied = await repo.update(id, { action: 'apply', expectedRevision: delayed.revision, planId: "original", quote: quoteFor(id, delayed.revision), idempotencyKey: 'advisor-flow' });
      const persisted = await new TripRepository(dir).read(id);
      const graph = analyzeJourney(persisted.applied?.segments ?? recoveryForState(persisted).timeline);
      expect(applied.applied?.segments).toEqual(plan.segments);
      expect(graph.timeline).toEqual(plan.segments);
      expect(graph.timeline).not.toEqual(recovery.timeline);
      expect(graph.timeline.every(s => s.requires.every(parent => graph.timeline.some(p => p.id === parent)))).toBe(true);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});
