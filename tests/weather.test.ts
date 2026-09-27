import { describe, it, expect } from 'vitest';
import { baseline } from '../src/fixtures/trip';
import { simulateWeather, weatherDelay, redateDemo, forecastAt, ensembleImpact } from '../src/engine/weather';
const normal = { rain: 0, wind: 10, temperature: 28, hours: 1 };
const storm = { rain: 40, wind: 75, temperature: 30, hours: 3 };
describe('weather twin sandbox', () => {
  it('moves only a copied demo into tomorrow while preserving durations and dependencies', () => {
    const source=baseline(), before=structuredClone(source);
    const shifted=redateDemo(source,Date.parse('2026-10-01T18:40:00Z'));
    expect(shifted[0].start).toContain('2026-10-03');
    expect(Date.parse(shifted[0].end)-Date.parse(shifted[0].start)).toBe(Date.parse(source[0].end)-Date.parse(source[0].start));
    expect(shifted[2].requires).toEqual(source[2].requires);
    expect(source).toEqual(before);
  });
  it('matches the containing forecast hour and rejects out-of-window dates', () => {
    const hours=[{time:'2026-09-27T10:00:00Z',rain:2,wind:4,temperature:25}];
    expect(forecastAt(hours,'2026-09-27T09:59:00Z')).toBeUndefined();
    expect(forecastAt(hours,'2026-09-27T10:59:00Z')).toEqual(hours[0]);
    expect(forecastAt(hours,'2026-09-27T11:00:00Z')).toBeUndefined();
  });
  it('counts new missed connections per ensemble member and suppresses incomplete estimates', () => {
    const trip=baseline();
    const members=Array.from({length:10},(_,i)=>[{time:trip[0].start,rain:i<5?0:60,wind:i<5?10:120,temperature:28}]);
    expect(ensembleImpact(trip,'flight',members)).toMatchObject({samples:10,blocked:5,fraction:50});
    trip[0].locationUnknown=true;
    expect(ensembleImpact(trip,'flight',members)).toBeNull();
  });
  it('preserves source bookings and fixed event times while propagating a storm', () => {
    const bookings = baseline(), original = structuredClone(bookings);
    const result = simulateWeather(bookings, 'flight', storm);
    expect(result.minutes).toBe(155);
    expect(result.recovery.impacts.some(i => i.state === 'blocked')).toBe(true);
    expect(bookings).toEqual(original);
    for (const b of bookings.filter(b => b.kind === 'activity')) expect(result.recovery.timeline.find(s => s.id === b.id)?.start).toBe(b.start);
  });
  it('normal conditions add no delay and do not erase existing risks', () => {
    const result = simulateWeather(baseline(), 'flight', normal);
    expect(result.minutes).toBe(0); expect(result.changed).toHaveLength(0);
    expect(result.recovery.impacts.every(i => i.state === "unaffected")).toBe(true);
  });
  it('does not fabricate missing durations or delay activities', () => {
    const bookings = baseline(); bookings[0].durationUnknown = true;
    expect(simulateWeather(bookings, 'flight', storm).incomplete).toBe(true);
    expect(simulateWeather(bookings, 'flight', storm).minutes).toBe(0);
    expect(weatherDelay(storm, 'activity')).toBe(0);
    expect(weatherDelay({ ...storm, hours: 0 }, 'flight')).toBe(0);
  });
});
