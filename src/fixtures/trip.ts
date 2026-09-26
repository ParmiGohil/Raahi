import type { Catalog, Segment, TripState } from "../domain/types";
export const ZONE = "Asia/Kolkata";
export const CLOCK = "2026-09-26T03:30:00.000Z"; // 09:00 IST, fixed demo clock
export const at = (time: string, day = 26) =>
  new Date(`2026-09-${day}T${time}:00+05:30`).toISOString();
export function service(
  id: string,
  title: string,
  kind: Segment["kind"],
  start: string,
  end: string,
  from: Segment["from"],
  to: Segment["to"],
  cash = 0,
  extra: Partial<Segment> = {},
): Segment {
  return {
    id,
    title,
    kind,
    start: at(start),
    end: at(end),
    from,
    to,
    cash: cash * 100,
    requires: [],
    recommendedBuffer: kind === 'exit' || kind === 'storage' || id === 'return' ? 0 : 30,
    evidence: "Authored demo inventory and policy; no supplier reservation.",
    available: true,
    ...extra,
  };
}
export function chain(segments: Segment[]): Segment[] {
  return segments.map((s, i) => ({
    ...s,
    requires: i && s.id !== "walk" ? [segments[i - 1].id] : [],
  }));
}
export const baseline = (): Segment[] =>
  chain([
    service(
      "flight",
      "Mumbai → Goa · GOI",
      "flight",
      "09:45",
      "11:00",
      "BOM",
      "GOI",
      0,
      { cost: 450000, reference: 'DEMO-SG201' },
    ),
    service(
      "exit",
      "Baggage & airport exit",
      "exit",
      "11:00",
      "11:30",
      "GOI",
      "GOI",
    ),
    service(
      "transfer",
      "Airport shuttle",
      "transfer",
      "12:00",
      "13:00",
      "GOI",
      "hotel",
      0,
      { cutoff: at("11:50"), cost: 40000, reference: 'DEMO-SHUTTLE' },
    ),
    service(
      "checkin",
      "Casa Sol · check-in",
      "checkin",
      "14:00",
      "14:20",
      "hotel",
      "hotel",
      0,
      { windowStart: at("14:00"), windowEnd: at("18:00"), cost: 380000, reference: 'DEMO-CASA-SOL' },
    ),
    service(
      "pickup",
      "Included venue pickup",
      "transfer",
      "14:35",
      "15:20",
      "hotel",
      "venue",
    ),
    service(
      "event",
      "Mandovi riverside concert",
      "activity",
      "16:00",
      "17:30",
      "venue",
      "venue",
      0,
      { cutoff: at("15:45"), cost: 150000, reference: 'DEMO-CONCERT' },
    ),
    service(
      "return",
      "Included return to hotel",
      "transfer",
      "17:30",
      "18:15",
      "venue",
      "hotel",
    ),
    service(
      "walk",
      "Old Goa heritage walk · tomorrow",
      "activity",
      "10:00",
      "11:30",
      "hotel",
      "hotel",
      0,
      { start: at("10:00", 27), end: at("11:30", 27) },
    ),
  ]);
export const catalog: Catalog = {
  storage: true,
  lateCheckin: true,
  shuttle: true,
  cab: true,
  laterSession: true,
  validUntil: at("23:59"),
};
export const initialState = (): TripState => ({
  revision: 1,
  scenario: "original",
  preferences: { protectOriginal: false, budget: 300000 },
  applied: null,
  history: [],
  requests: [],
});
