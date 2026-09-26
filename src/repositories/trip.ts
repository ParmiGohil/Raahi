import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TripState } from "../domain/types";
import type { Command } from "../domain/requests";
import { initialState } from "../fixtures/trip";
import { recoveryForState } from '../engine/journey';
import { baseline } from '../fixtures/trip';
import { organizeBookings } from '../engine/organize';

export class Conflict extends Error {}
export class InvalidPlan extends Error {}
const processState = globalThis as typeof globalThis & {
  raahiSecret?: string;
  raahiQueue?: Promise<unknown>;
};
processState.raahiSecret ??= randomBytes(32).toString("hex");
export function sessionSecret() {
  const configured = process.env.RAAHI_SIGNING_SECRET;
  if (process.env.VERCEL && (!configured || configured.length < 32))
    throw new Error("RAAHI_SIGNING_SECRET must be configured for hosting");
  return configured ?? processState.raahiSecret!;
}
function signature(body: string) {
  return createHmac("sha256", sessionSecret()).update(body).digest("hex");
}
export function quoteFor(
  sessionId: string,
  revision: number,
  now = Date.now(),
) {
  const expires = now + 10 * 60 * 1000;
  const body = `${sessionId}:${revision}:${expires}`;
  return `${expires}.${signature(body)}`;
}
function verifyQuote(sessionId: string, revision: number, quote: string) {
  const [expiry, mac] = quote.split(".");
  if (
    !/^\d+$/.test(expiry ?? "") ||
    !/^[a-f0-9]{64}$/.test(mac ?? "") ||
    Number(expiry) < Date.now()
  )
    throw new InvalidPlan(
      "This review has expired. Refresh the options before applying.",
    );
  const expected = signature(`${sessionId}:${revision}:${expiry}`);
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(mac)))
    throw new InvalidPlan(
      "This review is no longer valid. Refresh the options.",
    );
}

/** Persistent local Node demo. One process, serialized transactions, atomic file replacement. */
export class TripRepository {
  constructor(
    private directory = process.env.RAAHI_DATA_DIR ??
      path.join(process.cwd(), ".raahi"),
  ) {}
  private file(id: string) {
    if (!/^[a-f0-9]{64}$/.test(id)) throw new Error("Invalid session");
    return path.join(this.directory, `${id}.json`);
  }
  protected async load(id: string): Promise<TripState> {
    try {
      return JSON.parse(await readFile(this.file(id), "utf8")) as TripState;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        return initialState();
      throw error;
    }
  }
  protected async save(id: string, state: TripState) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const destination = this.file(id),
      temporary = `${destination}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, destination);
  }
  private exclusive<T>(work: () => Promise<T>): Promise<T> {
    const next = (processState.raahiQueue ?? Promise.resolve()).then(
      work,
      work,
    );
    processState.raahiQueue = next.catch(() => undefined);
    return next;
  }
  read(id: string) {
    return this.exclusive(() => this.load(id));
  }
  update(id: string, command: Command): Promise<TripState> {
    return this.exclusive(async () => {
      const state = await this.load(id);
      const fingerprint =
        command.action === "apply"
          ? JSON.stringify({
              planId: command.planId,
              expectedRevision: command.expectedRevision,
            })
          : "";
      if (command.action === "apply") {
        const prior = state.requests.find(
          (r) => r.key === command.idempotencyKey,
        );
        if (prior) {
          if (prior.fingerprint !== fingerprint)
            throw new Conflict(
              "This request key was already used for a different plan.",
            );
          return state;
        }
      }
      if (state.revision !== command.expectedRevision)
        throw new Conflict(
          "The itinerary changed in another tab. Latest state loaded; review it before retrying.",
        );
      let next = structuredClone(state);
      if (command.action === "reset")
        next = { ...initialState(), profile: state.profile, revision: state.revision };
      else if (command.action === 'profile') next.profile = command.profile;
      else if (command.action === 'itinerary') {
        const organized = organizeBookings(command.bookings);
        const ids = organized.map(b => b.id);
        if (new Set(ids).size !== ids.length) throw new InvalidPlan('Booking IDs must be unique.');
        for (let i = 0; i < organized.length; i++) {
          if (organized[i].requires.some(id => !ids.slice(0, i).includes(id))) throw new InvalidPlan('An explicit connection must refer to an earlier booking. Select automatic connections to arrange by time.');
        }
        next.mode = 'personal'; next.bookings = organized; next.disruption = null;
        if (state.mode !== 'personal') next.preferences = { protectOriginal: false, budget: 300000 };
        next.scenario = 'original'; next.applied = null; next.history = []; next.requests = [];
      }
      else if (command.action === 'disruption') {
        const bookings = state.mode === 'personal' ? state.bookings ?? [] : baseline();
        if (command.disruption && !bookings.some(b => b.id === command.disruption!.bookingId)) throw new InvalidPlan('Select a booking in this itinerary.');
        next.disruption = command.disruption; next.applied = null; next.scenario = 'original';
      }
      else if (state.applied)
        throw new Conflict(
          "This recovery is already applied. Reset the demo to explore another scenario.",
        );
      else if (command.action === "copilot") {
        if (state.mode === 'personal') throw new InvalidPlan('The authored copilot uses the Goa demo. Use What-if for your itinerary.');
        next.disruption = null;
        next.scenario = command.scenario;
        next.preferences = command.preferences;
      } else if (command.action === "scenario") {
        if (state.mode === 'personal') throw new InvalidPlan('Use the booking disruption controls for your itinerary.');
        next.disruption = null; next.scenario = command.scenario;
      }
      else if (command.action === "preferences")
        next.preferences = command.preferences;
      else if (command.action === "apply") {
        verifyQuote(id, state.revision, command.quote);
        const result = recoveryForState(state);
        const plan = result.plans.find((p) => p.id === command.planId);
        if (!plan)
          throw new InvalidPlan(
            "That plan is not feasible under the current constraints.",
          );
        next.applied = plan;
        next.history.push({
          revision: state.revision + 1,
          label: plan.title,
          at: new Date().toISOString(),
          cashNow: plan.ledger.cashNow,
          before: result.timeline,
          after: plan.segments,
          actions: plan.ledger.items.map(
            (item) => `${item.label}: simulated; supplier action pending`,
          ),
        });
        next.history = next.history.slice(-20);
        next.requests.push({
          key: command.idempotencyKey,
          fingerprint,
          revision: state.revision + 1,
        });
        next.requests = next.requests.slice(-100);
      }
      next.revision = state.revision + 1;
      await this.save(id, next);
      return next;
    });
  }
}
export const repository = new TripRepository();
