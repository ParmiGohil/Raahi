import { describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { commandSchema } from '../src/domain/requests';
import { recover } from '../src/engine/recover';
import { orderPlansForProfile } from '../src/engine/plan-preferences';
import { TripRepository } from '../src/repositories/trip';

describe('optional traveller profile', () => {
  it('accepts an empty profile and bounds selected interests and notes', () => {
    const base = { action: 'profile', expectedRevision: 1, profile: { name: '', email: '', city: '', travelStyle: '' } };
    expect(commandSchema.safeParse(base).success).toBe(true);
    expect(commandSchema.safeParse({ ...base, profile: { ...base.profile, interests: ['Food', 'Nature', 'Music', 'Beaches'] } }).success).toBe(false);
    expect(commandSchema.safeParse({ ...base, profile: { ...base.profile, travelNotes: 'x'.repeat(161) } }).success).toBe(false);
  });
  it('remembers preferences after reload and demo reset', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'raahi-profile-'));
    try {
      const repo = new TripRepository(directory), id = 'e'.repeat(64);
      const profile = { name: 'Ava', email: '', city: 'Mumbai', travelStyle: 'Balanced', recoveryPriority: 'More rest' as const,
        travelPace: 'Relaxed' as const, transportPreference: 'Public transport' as const, stayPreference: 'Quiet stays' as const,
        interests: ['Food', 'Culture'] as Array<'Food' | 'Culture'>, travelNotes: 'Prefer fewer transfers.' };
      const saved = await repo.update(id, { action: 'profile', expectedRevision: 1, profile });
      expect((await new TripRepository(directory).read(id)).profile).toEqual(profile);
      await repo.update(id, { action: 'reset', expectedRevision: saved.revision });
      expect((await repo.read(id)).profile).toEqual(profile);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
  it('orders checked plans without changing or filtering them', () => {
    const plans = recover('delay', { protectOriginal: false, budget: 300000 }).plans;
    const originalIds = plans.map(plan => plan.id);
    expect(orderPlansForProfile(plans).map(plan => plan.id)).toEqual(originalIds);
    expect(orderPlansForProfile(plans, 'More rest')[0].id).toBe('comfort');
    expect(orderPlansForProfile(plans, 'Keep experiences')[0].id).toBe('original');
    expect(orderPlansForProfile(plans, 'Lower cost')[0].id).toBe('budget');
    expect(orderPlansForProfile(plans, 'Fewer changes')).toHaveLength(plans.length);
    expect(plans.map(plan => plan.id)).toEqual(originalIds);
  });
});
