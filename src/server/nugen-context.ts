import type { Recovery, Segment, TripState } from '../domain/types';
import { baseline } from '../fixtures/trip';
import { simulateWeather, weatherPlaces, type WeatherInput } from '../engine/weather';

// Explicit allowlists keep profile, booking references, evidence, and uploaded PDFs off the wire.
const bookingContext = (booking: Segment) => ({
  id: booking.id, kind: booking.kind, start: booking.start, end: booking.end,
  from: booking.from, to: booking.to, cutoff: booking.cutoff,
  requires: booking.requires, fixedTime: !!booking.fixedTime || booking.id === 'event',
});
const impactContext = (impact: Recovery['impacts'][number]) => ({
  bookingId: impact.id, state: impact.state, causedBy: impact.causes,
  slackMinutes: impact.slack,
});

export function recoveryContext(state: TripState, recovery: Recovery) {
  const original = baseline();
  const disruptions = state.disruption
    ? [{ bookingId: state.disruption.bookingId, type: state.disruption.type, minutes: state.disruption.minutes }]
    : recovery.timeline.flatMap(booking => {
      const before = original.find(item => item.id === booking.id);
      if (!before) return [];
      if (booking.available === false && before.available === true) return [{ bookingId: booking.id, type: 'cancelled', minutes: 0 }];
      const minutes = Math.round((Date.parse(booking.start) - Date.parse(before.start)) / 60000);
      return minutes > 0 && ['flight', 'train'].includes(booking.kind) ? [{ bookingId: booking.id, type: 'delay', minutes }] : [];
    });
  return {
    task: 'RECOVERY_EXPLANATION', dataProvenance: 'fictional-demo',
    scenario: state.scenario,
    disruptions,
    preferences: { protectOriginalEvent: state.preferences.protectOriginal, cashLimitPaise: state.preferences.budget },
    moneyUnit: 'INR paise', bookings: recovery.timeline.map(bookingContext),
    impacts: recovery.impacts.map(impactContext),
    options: recovery.plans.map(plan => ({ id: plan.id, cashNowPaise: plan.ledger.cashNow, preservesOriginalEvent: plan.originalEvent, restMinutes: plan.restMinutes, changedBookingIds: plan.changedIds })),
    supplierActions: 'simulated-pending',
  };
}

export type WeatherAdvisoryInput = {
  kind: 'flight' | 'train' | 'transfer'; weather: WeatherInput;
  source: 'forecast' | 'hypothetical'; fixtureBookingId?: string;
  placeId?: 'goi' | 'panaji' | 'bom';
};
export function weatherContext(input: WeatherAdvisoryInput) {
  const booking = input.fixtureBookingId && baseline().find(item => item.id === input.fixtureBookingId && item.kind === input.kind);
  const place = weatherPlaces.find(item => item.id === input.placeId);
  const common = {
    task: 'WEATHER_ADVISORY', itineraryProvenance: booking && place ? 'fictional-demo' : 'not-provided',
    source: input.source, sourceMeaning: input.source === 'forecast' ? 'forecast at booking time, not observed delay' : 'user-selected hypothetical conditions',
    transportKind: input.kind, weather: input.weather,
  };
  if (!booking || !place) return common;
  const result = simulateWeather(baseline(), booking.id, input.weather);
  return {
    ...common, selectedLocation: { id: place.id, name: place.name },
    selectedBooking: bookingContext(booking),
    impacts: result.recovery.impacts.map(impactContext),
    engineEstimate: { addedMinutes: result.minutes, provenance: 'authored-rules-not-a-provider-prediction' },
  };
}
