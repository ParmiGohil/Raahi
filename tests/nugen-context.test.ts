import { describe, expect, it } from 'vitest';
import { weatherContext } from '../src/server/nugen-context';
import { baseline } from '../src/fixtures/trip';
import { simulateWeather } from '../src/engine/weather';

const weather = { rain: 40, wind: 75, temperature: 30, hours: 3 };

describe('weather advisory context', () => {
  it('uses the fictional booking graph and the existing simulation result', () => {
    const context = weatherContext({ kind: 'flight', weather, source: 'hypothetical', fixtureBookingId: 'flight', placeId: 'goi' });
    expect(context.itineraryProvenance).toBe('fictional-demo');
    if (!('selectedBooking' in context)) throw new Error('Fixture context missing');
    expect(context.selectedBooking.id).toBe('flight');
    expect(context.impacts.map(impact => impact.bookingId)).toContain('transfer');
    expect(context.engineEstimate.addedMinutes).toBe(simulateWeather(baseline(), 'flight', weather).minutes);
    expect(context.engineEstimate.addedMinutes).toBe(155);
    expect(context.impacts.find(impact => impact.bookingId === 'transfer')?.slackMinutes).toBe(-135);
    expect(JSON.stringify(context)).not.toMatch(/"reference"|"evidence"|DEMO-SG201/);
  });
  it('does not infer an itinerary when no valid fixture booking is supplied', () => {
    const context = weatherContext({ kind: 'flight', weather, source: 'forecast', fixtureBookingId: 'unknown', placeId: 'goi' });
    expect(context.itineraryProvenance).toBe('not-provided');
    expect(context).not.toHaveProperty('selectedBooking');
    expect(context).not.toHaveProperty('impacts');
    expect(context).not.toHaveProperty('engineEstimate');
  });
});
