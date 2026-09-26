import type {
  Catalog,
  Impact,
  Plan,
  Preferences,
  Recovery,
  Scenario,
  Segment,
} from "../domain/types";
import {
  at,
  baseline,
  catalog as defaultCatalog,
  chain,
  CLOCK,
  service,
} from "../fixtures/trip";
import { minutes, validateTrip } from "./validate";
export const formatMoney = (minor: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(minor / 100);
export const time = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
export function disrupted(scenario: Scenario): Segment[] {
  const trip = baseline();
  if (scenario === "delay" || scenario === "delay-later-cancelled") {
    Object.assign(trip[0], { start: at("12:45"), end: at("14:00") });
    Object.assign(trip[1], { start: at("14:00"), end: at("14:30") });
  }
  if (scenario === "activity-cancelled")
    trip.find((s) => s.id === "event")!.available = false;
  return trip;
}
export function evaluateImpacts(timeline: Segment[]): Impact[] {
  const result: Impact[] = [];
  const original = baseline();
  for (const segment of timeline) {
    const before = original.find((s) => s.id === segment.id);
    const parents = segment.requires
      .map((id) => timeline.find((s) => s.id === id))
      .filter((s): s is Segment => !!s);
    const badParent = result.find(
      (r) =>
        segment.requires.includes(r.id) &&
        (r.state === "blocked" ||
          (r.state === "direct" &&
            timeline.find((s) => s.id === r.id)?.available === false)),
    );
    const parent = parents.at(-1);
    const slack = parent
      ? minutes(segment.cutoff ?? segment.start, parent.end)
      : undefined;
    let state: Impact["state"] = "unaffected";
    let reason = "No broken dependency affects this booking.";
    if (segment.available !== true) {
      state = "direct";
      reason = `${segment.title} has been cancelled in this scenario.`;
    } else if (badParent) {
      state = "blocked";
      reason = `Depends on ${timeline.find((s) => s.id === badParent.id)?.title}; that part of the journey needs repair.`;
    } else if (slack !== undefined && slack < 0) {
      state = "blocked";
      reason = `Ready at ${time(parent!.end)}, after ${time(segment.cutoff ?? segment.start)} ${segment.cutoff ? "cutoff" : "start"} (${Math.abs(slack)} min late).`;
    } else if (
      before &&
      (segment.start !== before.start || segment.end !== before.end)
    ) {
      state = "direct";
      reason = `Schedule changed: ends ${time(segment.end)} instead of ${time(before.end)}.`;
    } else if (
      slack !== undefined &&
      slack < 30 &&
      (segment.cutoff || segment.id === "pickup")
    ) {
      state = "at-risk";
      reason = `${slack} min between services; below the authored 30 min advisory buffer. Still feasible.`;
    }
    result.push({
      id: segment.id,
      state,
      reason,
      causes: segment.requires,
      slack,
    });
  }
  return result;
}
function laterEnding(catalog: Catalog, available: boolean | null): Segment[] {
  return [
    service(
      "pickup",
      "Included venue pickup",
      "transfer",
      "16:35",
      "17:20",
      "hotel",
      "venue",
    ),
    service(
      "event",
      "Mandovi concert · later session",
      "activity",
      "18:00",
      "19:30",
      "venue",
      "venue",
      300,
      {
        cutoff: at("17:45"),
        available: available === false ? false : catalog.laterSession,
      },
    ),
    service(
      "return",
      "Included return to hotel",
      "transfer",
      "19:30",
      "20:15",
      "venue",
      "hotel",
    ),
  ];
}
/** Enumerate the bounded fixture catalog, then independently validate every complete proposal. */
export function recover(
  scenario: Scenario,
  preferences: Preferences,
  catalog: Catalog = defaultCatalog,
  clock = CLOCK,
): Recovery {
  const timeline = disrupted(scenario);
  const impacts = evaluateImpacts(timeline);
  const result: Recovery = {
    timeline,
    impacts,
    plans: [],
    rejections: [],
    warning:
      "Original shuttle: airport-ready 11:30, boarding closes 11:50. Only 20 minutes of slack; advisory buffer is 30 minutes.",
    provenance: "fixture",
  };
  if (scenario === "original") return result;
  const delayed = scenario === "delay" || scenario === "delay-later-cancelled";
  const head = timeline.slice(0, 2);
  const tomorrow = timeline.at(-1)!;
  const candidates: {
    id: string;
    title: string;
    subtitle: string;
    segments: Segment[];
    rest: number;
  }[] = [];
  if (delayed) {
    const routes = [
      {
        id: "budget",
        title: "Spend less",
        subtitle: "Later concert · shuttle to hotel",
        rest: 0,
        transfer: service(
          "transfer",
          "Replacement airport shuttle",
          "transfer",
          "15:00",
          "16:15",
          "GOI",
          "hotel",
          500,
          { cutoff: at("14:50"), available: catalog.shuttle },
        ),
        checkin: service(
          "checkin",
          "Casa Sol · check-in",
          "checkin",
          "16:15",
          "16:35",
          "hotel",
          "hotel",
          0,
          { windowStart: at("14:00"), windowEnd: at("18:00") },
        ),
      },
      {
        id: "comfort",
        title: "Take a breather",
        subtitle: "Later concert · 45 min hotel rest",
        rest: 45,
        transfer: service(
          "transfer",
          "Private cab to hotel",
          "transfer",
          "14:30",
          "15:30",
          "GOI",
          "hotel",
          1500,
          { available: catalog.cab },
        ),
        checkin: service(
          "checkin",
          "Casa Sol · check-in",
          "checkin",
          "15:30",
          "15:50",
          "hotel",
          "hotel",
          0,
          { windowStart: at("14:00"), windowEnd: at("18:00") },
        ),
      },
    ];
    for (const route of routes)
      candidates.push({
        ...route,
        segments: chain([
          ...head,
          route.transfer,
          route.checkin,
          ...laterEnding(catalog, scenario !== "delay-later-cancelled"),
          tomorrow,
        ]),
      });
    candidates.push({
      id: "original",
      title: "Keep the moment",
      subtitle: "Original concert · hotel afterwards",
      rest: 0,
      segments: chain([
        ...head,
        service(
          "transfer",
          "Private cab to venue",
          "transfer",
          "14:30",
          "15:20",
          "GOI",
          "venue",
          1200,
          { available: catalog.cab },
        ),
        service(
          "storage",
          "Store luggage at venue",
          "storage",
          "15:20",
          "15:30",
          "venue",
          "venue",
          200,
          { available: catalog.storage },
        ),
        baseline().find((s) => s.id === "event")!,
        service(
          "retrieve",
          "Collect luggage",
          "storage",
          "17:30",
          "17:40",
          "venue",
          "venue",
          0,
          { available: catalog.storage },
        ),
        service(
          "return",
          "Private cab to hotel",
          "transfer",
          "17:40",
          "18:25",
          "venue",
          "hotel",
          600,
          { available: catalog.cab },
        ),
        service(
          "checkin",
          "Casa Sol · permitted late check-in",
          "checkin",
          "18:25",
          "18:45",
          "hotel",
          "hotel",
          300,
          {
            windowStart: at("14:00"),
            windowEnd: at("22:00"),
            available: catalog.lateCheckin,
            evidence:
              "Fixture policy explicitly permits check-in until 22:00 for ₹300.",
          },
        ),
        tomorrow,
      ]),
    });
  } else {
    candidates.push({
      id: "later",
      title: "Keep the evening",
      subtitle: "Move to the available 18:00 session",
      rest: 135,
      segments: chain([
        ...timeline.slice(0, 4),
        ...laterEnding(catalog, true),
        tomorrow,
      ]),
    });
  }
  for (const candidate of candidates) {
    const errors = validateTrip(
      candidate.segments,
      preferences,
      baseline(),
      clock,
    );
    if (Date.parse(catalog.validUntil) < Date.parse(clock))
      errors.push({
        code: "EXPIRED",
        message:
          "Fixture offer validity has expired relative to the scenario clock.",
      });
    if (errors.length) {
      result.rejections.push({
        title: candidate.title,
        reasons: [...new Set(errors.map((e) => e.message))],
      });
      continue;
    }
    const cashItems = candidate.segments
      .filter((s) => s.cash)
      .map((s) => ({ label: s.title, amount: s.cash }));
    const before = baseline();
    const changedIds = [
      ...new Set([
        ...before.map((s) => s.id),
        ...candidate.segments.map((s) => s.id),
      ]),
    ].filter((id) => {
      const a = before.find((s) => s.id === id),
        b = candidate.segments.find((s) => s.id === id);
      return (
        !a ||
        !b ||
        a.start !== b.start ||
        a.end !== b.end ||
        a.title !== b.title ||
        a.from !== b.from ||
        a.to !== b.to
      );
    });
    result.plans.push({
      id: candidate.id,
      title: candidate.title,
      subtitle: candidate.subtitle,
      segments: candidate.segments,
      originalEvent:
        candidate.segments.find((s) => s.id === "event")!.start === at("16:00"),
      restMinutes: candidate.rest,
      changedIds,
      ledger: {
        items: cashItems,
        cashNow: cashItems.reduce((sum, item) => sum + item.amount, 0),
        futureRefund: 0,
        prepaidLoss: delayed ? 40000 : 0,
      },
      warnings:
        candidate.id === "budget"
          ? [
              "Zero slack: check-in ends at 16:35, exactly when the included pickup leaves.",
            ]
          : [],
      checks: [
        "Continuous route through GOI, hotel and venue",
        "All boarding and admission cutoffs satisfied",
        "Check-in fits the explicit policy window",
        "Known fixture inventory; protected event and cash limit respected",
        "Completed and in-progress travel preserved",
      ],
    });
  }
  return result;
}
