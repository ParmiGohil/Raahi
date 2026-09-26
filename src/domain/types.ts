export type Place = "BOM" | "GOI" | "hotel" | "venue";
export type Scenario =
  "original" | "delay" | "activity-cancelled" | "delay-later-cancelled";
export type Preferences = { protectOriginal: boolean; budget: number };
export type Segment = {
  id: string;
  title: string;
  kind: "flight" | "exit" | "transfer" | "checkin" | "activity" | "storage";
  start: string;
  end: string;
  from: Place;
  to: Place;
  cutoff?: string;
  windowStart?: string;
  windowEnd?: string;
  requires: string[];
  cash: number;
  evidence: string;
  available: boolean | null;
};
export type Impact = {
  id: string;
  state: "direct" | "blocked" | "at-risk" | "unaffected";
  reason: string;
  causes: string[];
  slack?: number;
};
export type Check = { code: string; segmentId?: string; message: string };
export type Ledger = {
  items: { label: string; amount: number }[];
  cashNow: number;
  futureRefund: number;
  prepaidLoss: number;
};
export type Plan = {
  id: string;
  title: string;
  subtitle: string;
  segments: Segment[];
  ledger: Ledger;
  originalEvent: boolean;
  restMinutes: number;
  changedIds: string[];
  warnings: string[];
  checks: string[];
};
export type Catalog = {
  storage: boolean | null;
  lateCheckin: boolean | null;
  shuttle: boolean | null;
  cab: boolean | null;
  laterSession: boolean | null;
  validUntil: string;
};
export type Recovery = {
  timeline: Segment[];
  impacts: Impact[];
  plans: Plan[];
  rejections: { title: string; reasons: string[] }[];
  warning: string;
  provenance: "fixture";
};
export type HistoryEntry = {
  revision: number;
  label: string;
  at: string;
  cashNow: number;
  before: Segment[];
  after: Segment[];
  actions: string[];
};
export type TripState = {
  revision: number;
  scenario: Scenario;
  preferences: Preferences;
  applied: Plan | null;
  history: HistoryEntry[];
  requests: { key: string; fingerprint: string; revision: number }[];
};
