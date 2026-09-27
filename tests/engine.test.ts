import { describe, expect, it } from "vitest";
import { recover } from "../src/engine/recover";
import { validateTrip } from "../src/engine/validate";
import { at, baseline, catalog } from "../src/fixtures/trip";
const preferences = { protectOriginal: false, budget: 300000 };
describe("authored Mumbai–GOI recovery scenarios", () => {
  it("accepts the baseline with sufficient authored pickup buffers", () => {
    expect(validateTrip(baseline(), preferences, baseline())).toEqual([]);
    const result = recover("original", preferences);
    expect(result.impacts.every(i => i.state === "unaffected")).toBe(true);
    expect(result.impacts.find((i) => i.id === "transfer")).toMatchObject({
      state: "unaffected",
      slack: 20,
    });
  });
  it("propagates a missed connection through actual dependencies", () => {
    const result = recover("delay", preferences);
    expect(result.impacts.find((i) => i.id === "transfer")).toMatchObject({
      state: "blocked",
      slack: -160,
    });
    expect(result.impacts.find((i) => i.id === "event")?.state).toBe("blocked");
    expect(result.impacts.find((i) => i.id === "walk")?.state).toBe(
      "unaffected",
    );
  });
  it("validates three distinct plans with exact cash, loss and rest", () => {
    const result = recover("delay", preferences);
    expect(result.plans.map((p) => p.ledger.cashNow)).toEqual([
      80000, 180000, 230000,
    ]);
    expect(result.plans.map((p) => p.restMinutes)).toEqual([0, 45, 0]);
    expect(
      result.plans.every(
        (p) => p.ledger.prepaidLoss === 40000 && p.ledger.futureRefund === 0,
      ),
    ).toBe(true);
    expect(result.plans[0].warnings.length).toBe(1);
    const direct = result.plans[2];
    expect(direct.segments.find((s) => s.id === "storage")?.end).toBe(
      at("15:30"),
    );
    expect(direct.segments.find((s) => s.id === "checkin")?.end).toBe(
      at("18:45"),
    );
  });
  it("protects the original event and never silently relaxes a cash limit", () => {
    expect(
      recover("delay", { ...preferences, protectOriginal: true }).plans.map(
        (p) => p.id,
      ),
    ).toEqual(["original"]);
    expect(
      recover("delay", { protectOriginal: true, budget: 229999 }).plans,
    ).toEqual([]);
    expect(
      recover("delay", { protectOriginal: true, budget: 230000 }).plans,
    ).toHaveLength(1);
  });
  it("handles cancellation alone and together with delay", () => {
    expect(
      recover("activity-cancelled", preferences).plans.map(
        (p) => p.ledger.cashNow,
      ),
    ).toEqual([30000]);
    expect(
      recover("activity-cancelled", { ...preferences, protectOriginal: true })
        .plans,
    ).toEqual([]);
    expect(
      recover("delay-later-cancelled", preferences).plans.map((p) => p.id),
    ).toEqual(["original"]);
  });
  it("rejects missing essential inventory and expired evidence", () => {
    for (const field of ["storage", "lateCheckin"] as const) {
      expect(
        recover(
          "delay",
          { ...preferences, protectOriginal: true },
          { ...catalog, [field]: null },
        ).plans,
      ).toEqual([]);
    }
    expect(
      recover("delay", preferences, { ...catalog, validUntil: at("08:00") })
        .plans,
    ).toEqual([]);
  });
  it("catches cutoff, location, overlap and past-travel violations independently", () => {
    const changed = structuredClone(
      recover("delay", preferences).plans[2].segments,
    );
    changed.find((s) => s.id === "storage")!.end = at("15:46");
    expect(
      validateTrip(changed, preferences, baseline()).some(
        (e) => e.code === "CUTOFF",
      ),
    ).toBe(true);
    changed[2].from = "BOM";
    expect(
      validateTrip(changed, preferences, baseline()).some(
        (e) => e.code === "LOCATION",
      ),
    ).toBe(true);
    expect(
      validateTrip(changed, preferences, baseline(), at("12:00")).some(
        (e) => e.code === "PAST",
      ),
    ).toBe(true);
    changed[2].start = at("14:00");
    expect(
      validateTrip(changed, preferences, baseline()).some(
        (e) => e.code === "OVERLAP",
      ),
    ).toBe(true);
  });
});
