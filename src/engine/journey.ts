import type { Disruption, Impact, Recovery, Segment, TripState } from '../domain/types';
import { baseline } from '../fixtures/trip';
import { recover, time } from './recover';

export type PublicTrip = Omit<TripState, 'requests'>;
const gap = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 60000);
const shift = (date: string, minutes: number) => new Date(Date.parse(date) + minutes * 60000).toISOString();
export function connectionBuffer(parent: Segment, child: Segment) {
  const actual = gap(child.cutoff ?? child.start, parent.end);
  const recommended = child.recommendedBuffer ?? (child.kind === 'exit' || child.kind === 'storage' ? 0 : parent.kind === 'flight' ? 75 : parent.kind === 'train' ? 45 : 30);
  const ratio = recommended ? Math.max(0, Math.round(actual / recommended * 100)) : actual >= 0 ? 100 : 0;
  return { actual, recommended, ratio, status: ratio < 50 ? 'Risky' : ratio < 80 ? 'Tight' : 'Safe' };
}

export function analyzeJourney(bookings: Segment[], disruption?: Disruption | null): Recovery {
  const timeline = structuredClone(bookings);
  const target = timeline.find(s => s.id === disruption?.bookingId);
  if (target && disruption) {
    if (disruption.type === 'delay' || disruption.type === 'traveler-change') {
      target.start = shift(target.start, disruption.minutes);
      target.end = shift(target.end, disruption.minutes);
    } else if (disruption.type === 'late-checkin') {
      target.windowEnd = target.start;
    } else target.available = false;
  }
  const impacts: Impact[] = [];
  for (const item of timeline) {
    const parents = item.requires.map(id => timeline.find(s => s.id === id)).filter((s): s is Segment => !!s);
    // Airport processing is relative to arrival, not a separately missed reservation.
    if (item.kind === 'exit' && parents.length && parents.every(p => p.available === true)) {
      const arrival = Math.max(...parents.map(p => Date.parse(p.end)));
      if (arrival > Date.parse(item.start)) { const duration = gap(item.end, item.start); item.start = new Date(arrival).toISOString(); item.end = shift(item.start, duration); }
    }
    const broken = impacts.find(i => item.requires.includes(i.id) && (i.state === 'blocked' || (i.state === 'direct' && timeline.find(s => s.id === i.id)?.available === false)));
    const slacks = parents.map(p => gap(item.cutoff ?? item.start, p.end));
    const slack = slacks.length ? Math.min(...slacks) : undefined;
    let state: Impact['state'] = 'unaffected';
    let reason = 'No broken dependency affects this booking.';
    if (item.id === target?.id) { state = 'direct'; reason = item.available === false ? 'Unavailable in this simulation; provider confirmation is required.' : disruption?.type === 'late-checkin' ? 'Late arrival is no longer allowed in this simulation.' : `Shifted by ${disruption?.minutes} minutes; now ends at ${time(item.end)}.`; }
    else if (item.available !== true) { state = 'direct'; reason = 'Availability is unconfirmed; verify this booking with its provider.'; }
    else if (broken) { state = 'blocked'; reason = `Depends on ${timeline.find(s => s.id === broken.id)?.title}; repair that connection first.`; }
    else if (item.windowEnd && Date.parse(item.start) > Date.parse(item.windowEnd)) { state = 'blocked'; reason = 'The planned arrival is after the latest allowed check-in.'; }
    else if (slack !== undefined && slack < 0) { state = 'blocked'; reason = `The incoming connection arrives ${Math.abs(slack)} minutes after this booking's start or cutoff.`; }
    else if (parents.some(p => p.to.toLowerCase() !== item.from.toLowerCase())) { state = 'at-risk'; reason = 'The previous arrival location differs from this departure. Add a connecting transfer; its travel time is unknown.'; }
    else if (parents.some(p => connectionBuffer(p, item).ratio < 80)) { state = 'at-risk'; reason = 'Available transfer time is below the planning buffer. Review this connection.'; }
    impacts.push({ id: item.id, state, reason, causes: item.requires, slack });
  }
  return { timeline, impacts, plans: [], rejections: [], warning: 'Buffers are planning guidance, not calibrated probabilities or live travel estimates.', provenance: 'fixture' };
}

/** One entry point for persisted and hypothetical state. The proven fixture engine stays intact. */
export function recoveryForState(state: PublicTrip): Recovery {
  if (state.mode !== 'personal' && !state.disruption) return recover(state.scenario, state.preferences);
  const bookings = state.mode === 'personal' ? state.bookings ?? [] : baseline();
  const result = analyzeJourney(bookings, state.disruption);
  if (!state.disruption) return result;
  const proposal = structuredClone(result.timeline);
  let possible = proposal.every(s => s.available === true);
  const changed: string[] = [];
  for (const item of proposal) {
    const parentEnds = item.requires.map(id => proposal.find(s => s.id === id)?.end).filter((s): s is string => !!s);
    const ready = parentEnds.length ? Math.max(...parentEnds.map(Date.parse)) : Date.parse(item.start);
    if (ready > Date.parse(item.cutoff ?? item.start)) {
      if (!item.flexible || item.priority || (state.preferences.protectOriginal && item.kind === 'activity')) { possible = false; continue; }
      const amount = Math.ceil((ready - Date.parse(item.start)) / 60000) + (item.recommendedBuffer ?? 30);
      item.start = shift(item.start, amount); item.end = shift(item.end, amount); changed.push(item.id);
    }
    if (item.windowEnd && Date.parse(item.start) > Date.parse(item.windowEnd)) possible = false;
    if ((item.priority || (state.preferences.protectOriginal && item.kind === 'activity')) && item.start !== bookings.find(b => b.id === item.id)?.start) possible = false;
    if (item.requires.some(id => proposal.find(p => p.id === id)?.to.toLowerCase() !== item.from.toLowerCase())) possible = false;
  }
  // A proposal only moves explicitly flexible personal commitments. No invented transport offers.
  if (possible && changed.length && !analyzeJourney(proposal).impacts.some(i => i.state === 'blocked')) {
    result.plans.push({ id: 'reschedule', title: 'Give your journey room', subtitle: 'Move flexible commitments after the delayed arrival', segments: proposal, ledger: { items: [], cashNow: 0, futureRefund: 0, prepaidLoss: 0 }, originalEvent: proposal.some(s => s.priority) && proposal.filter(s => s.priority).every(s => s.start === bookings.find(b => b.id === s.id)?.start), restMinutes: 0, changedIds: changed, warnings: ['Only commitments you marked flexible are shifted. No supplier booking is changed; any provider fees are unknown.'], checks: ['Dependency timing checked', 'Locked commitments preserved', 'No replacement inventory assumed'] });
  } else if (result.impacts.some(i => i.state === 'blocked' || i.state === 'direct')) result.rejections.push({ title: 'No verified replacement available', reasons: ['This itinerary has no confirmed replacement offers. Contact the affected provider or edit a confirmed booking; Raahi will not invent availability or prices.'] });
  return result;
}

export function tripHealth(state: PublicTrip, recovery: Recovery) {
  const items = state.applied?.segments ?? recovery.timeline;
  if (!items.length) return { score: 0, message: 'Add an itinerary to assess your trip.', affected: 0, recovered: false };
  const impacts = state.applied ? analyzeJourney(items).impacts : recovery.impacts;
  const affected = impacts.filter(i => i.state !== 'unaffected').length;
  const penalty = impacts.reduce((sum, i) => sum + ({ unaffected: 0, 'at-risk': 4, direct: 12, blocked: 10 }[i.state]), 0);
  const score = Math.max(0, Math.min(95, 95 - penalty - (state.applied ? 8 : 0)));
  return { score, affected, recovered: !!state.applied, message: state.applied ? 'Recovery planned. Provider actions are still pending.' : score >= 80 ? 'Your trip is currently in good shape.' : score >= 55 ? 'Some connections need your attention.' : 'Your trip is significantly disrupted.' };
}
