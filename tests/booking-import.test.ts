import { describe, expect, it } from 'vitest';
import { parseBookingText } from '../src/domain/pdf-booking';
import { organizeBookings } from '../src/engine/organize';
import { recoveryForState, tripHealth } from '../src/engine/journey';
import { at, initialState } from '../src/fixtures/trip';
import type { Segment } from '../src/domain/types';

const booking = (id: string, start: string, end: string, kind: Segment['kind'], from = 'A', to = 'A'): Segment => ({ id, title:id, start:at(start), end:at(end), kind, from, to, requires:[], connectionMode:'auto', cash:0, available:true, evidence:'Test', fixedTime:true });
describe('actual PDF text and connected bookings', () => {
  it('extracts exact labeled values and decimals without filling sample data', () => {
    const [b] = parseBookingText('Flight Booking: 1\nBooking name: Flight AB123\nFrom: Mumbai\nTo: Goa\nDeparture: 28 September 2026 09:45 IST\nArrival: 2026-09-28 11:00 IST\nPNR: ZX91PQ\nTotal paid: INR 4,512.50');
    expect(b).toMatchObject({title:'Flight AB123',from:'Mumbai',to:'Goa',start:'2026-09-28T09:45',end:'2026-09-28T11:00',reference:'ZX91PQ',cost:'4512.50'});
    const [unknown] = parseBookingText('Booking name: Unknown journey\nDeparture: 09/10/2026 09:45\nArrival: 31 February 2026 11:00\nTotal paid: USD 100');
    expect(unknown.start).toBe(''); expect(unknown.end).toBe(''); expect(unknown.cost).toBe('');
    expect(unknown.from).toBe(''); expect(unknown.warnings.length).toBeGreaterThan(0);
  });
  it('keeps every document section and separates bookings in one PDF', () => {
    expect(parseBookingText('Flight Booking: 1\nBooking name: First\nFrom: A\n\nHotel Booking: 2\nBooking name: Second\nLocation: B').map(b=>b.title)).toEqual(['First','Second']);
  });
  it('maps day tables across pages to explicit dates without inventing durations or prices', () => {
    const items = parseBookingText('GOA ESCAPE\nDATES\n12–15 November 2026\nDAY 1 — ARRIVAL\nTIME PLAN\n08:00 Depart Mumbai. Scenic drive toward Goa.\n13:00 Lunch stop en route.\nDAY 2 — NORTH GOA\n10:00 Visit Fort Aguada.\nDAY 3 — SOUTH GOA\n\nTIME PLAN\n09:00 Breakfast and late start.\nDAY 4 — DEPARTURE\n21:00 Arrive in Mumbai.\nTRIP NOTES\nEstimated daily budget: INR 4,000–7,000');
    expect(items).toHaveLength(5);
    expect(items[0]).toMatchObject({start:'2026-11-12T08:00', title:'Depart Mumbai. Scenic drive toward Goa.', durationUnknown:true,cost:''});
    expect(items[3].start).toBe('2026-11-14T09:00');
    expect(items[4]).toMatchObject({start:'2026-11-15T21:00',title:'Arrive in Mumbai.'});
  });
  it('sorts out-of-order additions and reconnects both sides without losing items', () => {
    const first = booking('flight','09:00','10:00','flight','B','A');
    const last = booking('event','12:00','13:00','activity');
    const middle = booking('cab','10:30','11:30','transfer');
    const result = organizeBookings([last, first, middle]);
    expect(result.map(b=>b.id)).toEqual(['flight','cab','event']);
    expect(result.map(b=>b.requires)).toEqual([[],['flight'],['cab']]);
    expect(last.requires).toEqual([]);
    expect(organizeBookings([first,{...last,connectionMode:'independent'}])[1].requires).toEqual([]);
  });
  it('simulates replacement transfers around an unchanged fixed concert, and rejects impossible arrivals', () => {
    const bookings = organizeBookings([booking('flight','09:00','10:00','flight','B','A'),booking('cab','10:15','11:15','transfer','A','C'),booking('concert','12:00','13:30','activity','C','C')]);
    const state = {...initialState(),mode:'personal' as const,bookings,disruption:{bookingId:'flight',type:'delay' as const,minutes:60}};
    const plans = recoveryForState(state).plans;
    expect(plans.map(p=>p.id)).toEqual(['simulated-cab','simulated-priority']);
    for (const plan of plans) { expect(plan.segments[2].start).toBe(at('12:00')); expect(plan.segments[2].end).toBe(at('13:30')); expect(plan.warnings[0]).toContain('SIMULATION ONLY'); }
    expect(recoveryForState({...state,disruption:{...state.disruption,minutes:180}}).plans).toEqual([]);
    expect(recoveryForState({...state,preferences:{...state.preferences,budget:100000}}).plans).toEqual([]);
  });
  it('does not certify health or propose transfers when a PDF omits durations', () => {
    const state = {...initialState(),mode:'personal' as const,bookings:[{...booking('cab','10:00','10:00','transfer'),durationUnknown:true}],disruption:{bookingId:'cab',type:'delay' as const,minutes:60}};
    const result = recoveryForState(state);
    expect(result.plans).toEqual([]);
    expect(tripHealth(state,result).provisional).toBe(true);
  });
});
