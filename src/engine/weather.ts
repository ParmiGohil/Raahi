import type { Segment } from '../domain/types';
import { analyzeJourney } from './journey';

export const weatherPlaces = [
  { id: 'goi', name: 'Goa - Dabolim airport', lat: 15.3808, lon: 73.8314, query: 'Goa rain' },
  { id: 'panaji', name: 'Goa - Panaji', lat: 15.4909, lon: 73.8278, query: 'Goa flooding' },
  { id: 'bom', name: 'Mumbai - airport', lat: 19.0896, lon: 72.8656, query: 'Mumbai rain' },
] as const;
export type WeatherInput = { rain: number; wind: number; temperature: number; hours: number };
export type ForecastHour = { time: string; rain: number; wind: number; temperature: number };
export type WeatherSnapshot = { members?: ForecastHour[][]; ensembleStatus?: string; fetchedAt: string; place: string; hours: { time: string; rain: number; wind: number; temperature: number }[]; reports: { historical?: boolean; text: string; url: string; at: string }[]; reportsStatus: string };

/** Transparent prototype sensitivity model. Not trained, calibrated, or a supplier prediction. */
export function weatherDelay(input: WeatherInput, kind: Segment['kind']) {
  if (!['flight', 'train', 'transfer'].includes(kind)) return 0;
  const rain = Math.max(0, Math.min(60, input.rain));
  const wind = Math.max(0, Math.min(120, input.wind));
  const exposure = Math.min(3, Math.max(0, input.hours));
  const heat = kind === 'transfer' ? Math.max(0, input.temperature - 35) : 0;
  return Math.round((rain * (kind === 'flight' ? 2 : 3) + Math.max(0, wind - 25) * 1.5 + heat) * exposure / 3);
}

export function simulateWeather(bookings: Segment[], bookingId: string, input: WeatherInput) {
  const target = bookings.find(b => b.id === bookingId);
  const minutes = target && !target.durationUnknown ? weatherDelay(input, target.kind) : 0;
  const baseline = analyzeJourney(bookings);
  const recovery = analyzeJourney(bookings, minutes ? { bookingId, type: 'delay', minutes } : null);
  const changed = recovery.impacts.filter(i => i.state !== baseline.impacts.find(b => b.id === i.id)?.state);
  return { minutes, baseline, recovery, changed, incomplete: !!target?.durationUnknown };
}

/** Exact hour bucket: never substitute a future hour for an earlier booking. */
export function forecastAt(hours: ForecastHour[], at: string) {
  const timestamp = Date.parse(at);
  return hours.find(h => timestamp >= Date.parse(h.time) && timestamp < Date.parse(h.time) + 3600000);
}
export function redateDemo(bookings: Segment[], now: number) {
  if (!bookings.length) return [];
  const day = new Date(now + 86400000 + 19800000).toISOString().slice(0,10);
  const firstDay = new Date(Date.parse(bookings[0].start) + 19800000).toISOString().slice(0,10);
  const delta = Date.parse(day) - Date.parse(firstDay);
  return bookings.map(b => {
    const copy = { ...b, requires: [...b.requires] };
    for (const key of ['start','end','cutoff','windowStart','windowEnd','changeDeadline'] as const) if (copy[key]) copy[key] = new Date(Date.parse(copy[key]!) + delta).toISOString();
    return copy;
  });
}
export function ensembleImpact(bookings: Segment[], id: string, members: ForecastHour[][]) {
  const target = bookings.find(b => b.id === id);
  if (!target || bookings.some(b => b.durationUnknown || b.locationUnknown)) return null;
  const runs = members.flatMap(hours => { const input = forecastAt(hours,target.start); return input ? [simulateWeather(bookings,id,{...input,hours:1})] : []; });
  if (runs.length < 5) return null;
  const delays = runs.map(r => r.minutes).sort((a,b)=>a-b);
  const baselineBlocked = new Set(runs[0].baseline.impacts.filter(i=>i.state==='blocked').map(i=>i.id));
  const blocked = runs.filter(r=>r.recovery.impacts.some(i=>i.state==='blocked'&&!baselineBlocked.has(i.id))).length;
  return { samples:runs.length, lower:delays[Math.floor((delays.length-1)*.1)], upper:delays[Math.floor((delays.length-1)*.9)], blocked, fraction:Math.round(blocked/runs.length*100) };
}
