import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { TripRepository, quoteFor } from "../src/repositories/trip";
const id = "a".repeat(64);
const temporary: string[] = [];
async function setup() {
  const dir = await mkdtemp(path.join(tmpdir(), "raahi-test-"));
  temporary.push(dir);
  return { repo: new TripRepository(dir), dir };
}
afterEach(async () => {
  await Promise.all(
    temporary.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});
describe("versioned local itinerary transactions", () => {
  it("persists a plan, deduplicates retries, reloads from disk and resets with monotonic revision", async () => {
    const { repo, dir } = await setup();
    const delayed = await repo.update(id, {
      action: "scenario",
      scenario: "delay",
      expectedRevision: 1,
    });
    const command = {
      action: "apply" as const,
      planId: "original" as const,
      expectedRevision: delayed.revision,
      quote: quoteFor(id, delayed.revision),
      idempotencyKey: randomUUID(),
    };
    const applied = await repo.update(id, command);
    expect(applied.revision).toBe(3);
    expect(applied.applied?.ledger.cashNow).toBe(230000);
    expect((await repo.update(id, command)).history).toHaveLength(1);
    expect((await new TripRepository(dir).read(id)).applied?.id).toBe(
      "original",
    );
    expect(
      (await repo.update(id, { action: "reset", expectedRevision: 3 }))
        .revision,
    ).toBe(4);
    expect((await repo.read(id)).applied).toBeNull();
  });
  it("serializes concurrent writes and rejects a stale revision", async () => {
    const { repo } = await setup();
    const results = await Promise.allSettled([
      repo.update(id, {
        action: "scenario",
        scenario: "delay",
        expectedRevision: 1,
      }),
      repo.update(id, { action: "reset", expectedRevision: 1 }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  });
  it("rejects expired and infeasible plans and isolates sessions", async () => {
    const { repo } = await setup();
    await repo.update(id, {
      action: "scenario",
      scenario: "delay",
      expectedRevision: 1,
    });
    const base = {
      action: "apply" as const,
      planId: "budget" as const,
      expectedRevision: 2,
      idempotencyKey: randomUUID(),
    };
    await expect(
      repo.update(id, { ...base, quote: quoteFor(id, 2, Date.now() - 700000) }),
    ).rejects.toThrow("expired");
    await repo.update(id, {
      action: "preferences",
      expectedRevision: 2,
      preferences: { budget: 50000, protectOriginal: true },
    });
    await expect(
      repo.update(id, { ...base, expectedRevision: 3, quote: quoteFor(id, 3) }),
    ).rejects.toThrow("not feasible");
    expect((await repo.read("b".repeat(64))).revision).toBe(1);
    expect((await repo.read(id)).history).toHaveLength(0);
  });
});
