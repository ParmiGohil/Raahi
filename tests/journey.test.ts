import { describe, expect, it } from 'vitest';
import { initialState, at } from '../src/fixtures/trip';
import { analyzeJourney, connectionBuffer, recoveryForState, tripHealth } from '../src/engine/journey';
import type { Segment } from '../src/domain/types';
const bookings: Segment[] = [
  { id: 'train', title: 'Train', kind: 'train', start: at('09:00'), end: at('10:00'), from: 'A', to: 'B', cash: 0, available: true, requires: [], evidence: 'Test' },
  { id: 'meeting', title: 'Meeting', kind: 'activity', start: at('10:30'), end: at('11:00'), from: 'B', to: 'B', cash: 0, available: true, requires: ['train'], evidence: 'Test', flexible: true, recommendedBuffer: 30 },
  { id: 'independent', title: 'Tomorrow', kind: 'activity', start: at('10:00', 27), end: at('11:00', 27), from: 'B', to: 'B', cash: 0, available: true, requires: [], evidence: 'Test' },
];
describe('connected itinerary analysis', () => {
  it('uses exact buffers, propagates delays and preserves unrelated bookings and input', () => {
    const before = JSON.stringify(bookings);
    expect(connectionBuffer(bookings[0], bookings[1])).toMatchObject({ actual: 30, recommended: 30, ratio: 100, status: 'Safe' });
    const preview = analyzeJourney(bookings, { bookingId: 'train', type: 'delay', minutes: 60 });
    expect(preview.impacts.find(i => i.id === 'meeting')).toMatchObject({ state: 'blocked', slack: -30 });
    expect(preview.impacts.find(i => i.id === 'independent')?.state).toBe('unaffected');
    expect(JSON.stringify(bookings)).toBe(before);
  });
  it('only reschedules explicitly flexible commitments and refuses to move a must-save event', () => {
    const state = { ...initialState(), mode: 'personal' as const, bookings, disruption: { bookingId: 'train', type: 'delay' as const, minutes: 60 } };
    const plan = recoveryForState(state).plans[0];
    expect(plan.id).toBe('reschedule');
    expect(plan.segments[1].start).toBe(at('11:30'));
    expect(recoveryForState({ ...state, bookings: bookings.map(b => b.id === 'meeting' ? { ...b, priority: true } : b) }).plans).toEqual([]);
    expect(recoveryForState({ ...state, disruption: { ...state.disruption, type: 'cancelled' } }).plans).toEqual([]);
  });
  it('lowers health on real impacts and improves it after a validated fixture recovery', () => {
    const state = initialState();
    const normal = tripHealth(state, recoveryForState(state));
    const delayed = { ...state, scenario: 'delay' as const };
    const result = recoveryForState(delayed);
    const damaged = tripHealth(delayed, result);
    const fixed = tripHealth({ ...delayed, applied: result.plans[2] }, result);
    expect(normal.score).toBeGreaterThan(damaged.score);
    expect(fixed.score).toBeGreaterThan(damaged.score);
    expect(fixed.recovered).toBe(true);
  });
});
