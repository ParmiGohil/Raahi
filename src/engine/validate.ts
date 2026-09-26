import type { Check, Preferences, Segment } from '../domain/types';
import { at, CLOCK } from '../fixtures/trip';
export const minutes = (later: string, earlier: string) => (Date.parse(later) - Date.parse(earlier)) / 60000;

/** Independent of candidate search: validate the complete physical journey. */
export function validateTrip(segments: Segment[], preferences: Preferences, original: Segment[], clock = CLOCK): Check[] {
  const errors: Check[] = [];
  const add = (code: string, message: string, segmentId?: string) => errors.push({ code, message, segmentId });
  const seen = new Set<string>();
  for (const [i, segment] of segments.entries()) {
    if (seen.has(segment.id)) add('DUPLICATE', 'A booking is duplicated.', segment.id);
    seen.add(segment.id);
    if (segment.available !== true) add('AVAILABILITY', `${segment.title}: ${segment.available === null ? 'availability is unknown' : 'unavailable'}.`, segment.id);
    if (!Number.isFinite(Date.parse(segment.start)) || !Number.isFinite(Date.parse(segment.end)) || minutes(segment.end, segment.start) < 0) add('TIME', 'Invalid service times.', segment.id);
    if (!Number.isSafeInteger(segment.cash) || segment.cash < 0) add('MONEY', 'Invalid cash amount.', segment.id);
    if (segment.windowStart && minutes(segment.start, segment.windowStart) < 0) add('WINDOW', `${segment.title}: service starts before its permitted window.`, segment.id);
    if (segment.windowEnd && minutes(segment.windowEnd, segment.start) < 0) add('WINDOW', `${segment.title}: check-in starts after the permitted window.`, segment.id);
    const previous = segments[i - 1];
    if (previous) {
      if (previous.to !== segment.from) add('LOCATION', `${segment.title}: no transfer connects these locations.`, segment.id);
      if (minutes(segment.start, previous.end) < 0) add('OVERLAP', `${segment.title}: overlaps the previous service.`, segment.id);
      if (segment.cutoff && minutes(segment.cutoff, previous.end) < 0) add('CUTOFF', `${segment.title}: arrival misses the admission or boarding cutoff.`, segment.id);
    }
    for (const dependency of segment.requires) {
      if (!segments.slice(0, i).some(s => s.id === dependency)) add('DEPENDENCY', `${segment.title}: missing prerequisite ${dependency}.`, segment.id);
    }
  }
  for (const before of original) {
    if (Date.parse(before.start) <= Date.parse(clock)) {
      const after = segments.find(s => s.id === before.id);
      if (!after || JSON.stringify(after) !== JSON.stringify(before)) add('PAST', 'Completed or in-progress travel cannot be changed.', before.id);
    }
  }
  if (preferences.protectOriginal && !segments.some(s => s.id === 'event' && s.start === at('16:00'))) add('PROTECTED', 'The original 16:00 concert is protected.');
  const total = segments.reduce((sum, s) => sum + s.cash, 0);
  if (total > preferences.budget) add('BUDGET', `Needs ₹${total / 100} now; cash limit is ₹${preferences.budget / 100}. Future refunds cannot fund this payment.`);
  for (const required of ['flight', 'exit', 'checkin', 'event', 'walk']) if (!seen.has(required)) add('MISSING', `Required booking ${required} is missing.`);
  return errors;
}
