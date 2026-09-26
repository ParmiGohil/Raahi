import { describe, expect, it } from "vitest";
import { demoRequests, previewRequest } from "../src/demo/copilot";
import {
  BrowserSessionRepository,
  openSession,
  sealSession,
} from "../src/repositories/browser-session";
import { initialState } from "../src/fixtures/trip";
import { quoteFor } from "../src/repositories/trip";
import { randomUUID } from "node:crypto";
const id = "a".repeat(64);
describe("authored copilot and hosted demo session", () => {
  it("previews protected, affordable and impossible requests without altering current state", () => {
    const original = initialState();
    expect(
      previewRequest(demoRequests[0], original.scenario).recovery.plans.map(
        (p) => p.id,
      ),
    ).toEqual(["original"]);
    expect(
      previewRequest(demoRequests[1], "delay").recovery.plans.map((p) => p.id),
    ).toEqual(["budget"]);
    expect(
      previewRequest(demoRequests[2], "delay").recovery.plans,
    ).toHaveLength(0);
    expect(
      previewRequest(demoRequests[0], "activity-cancelled").recovery.plans,
    ).toHaveLength(0);
    expect(original.scenario).toBe("original");
  });
  it("rejects tampering, another visitor and expired cookie state", () => {
    const sealed = sealSession(id, initialState(), "test-secret", 1000);
    expect(openSession(id, sealed, "test-secret", 1001).revision).toBe(1);
    expect(() =>
      openSession("b".repeat(64), sealed, "test-secret", 1001),
    ).toThrow();
    expect(() =>
      openSession(id, "x" + sealed.slice(1), "test-secret", 1001),
    ).toThrow();
    expect(() =>
      openSession(id, sealed, "test-secret", 1000 + 8 * 86400000),
    ).toThrow("expired");
  });
  it("applies copilot preferences atomically and survives a fresh server instance through full recovery", async () => {
    let cookie = "";
    const repo = () =>
      new BrowserSessionRepository(cookie || undefined, (value) => {
        cookie = value;
      });
    await repo().update(id, {
      action: "copilot",
      scenario: "delay",
      preferences: demoRequests[0].preferences,
      expectedRevision: 1,
    });
    const command = {
      action: "apply" as const,
      planId: "original" as const,
      expectedRevision: 2,
      quote: quoteFor(id, 2),
      idempotencyKey: randomUUID(),
    };
    await repo().update(id, command);
    expect(cookie.length).toBeLessThan(3800);
    expect((await repo().read(id)).applied?.ledger.cashNow).toBe(230000);
    expect((await repo().update(id, command)).history).toHaveLength(1);
    await expect(
      repo().update(id, { action: "reset", expectedRevision: 1 }),
    ).rejects.toThrow("changed");
    expect(
      (await repo().update(id, { action: "reset", expectedRevision: 3 }))
        .applied,
    ).toBeNull();
  });
});
