import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { TripState } from '../domain/types';
import type { Command } from '../domain/requests';
import { initialState } from '../fixtures/trip';
import { recover } from '../engine/recover';

export class Conflict extends Error {}
export class InvalidPlan extends Error {}
const processState = globalThis as typeof globalThis & { raahiSecret?: string; raahiQueue?: Promise<unknown> };
processState.raahiSecret ??= randomBytes(32).toString('hex');
function signature(body: string) { return createHmac('sha256', processState.raahiSecret!).update(body).digest('hex'); }
export function quoteFor(sessionId: string, revision: number, now = Date.now()) {
  const expires = now + 10 * 60 * 1000;
  const body = `${sessionId}:${revision}:${expires}`;
  return `${expires}.${signature(body)}`;
}
function verifyQuote(sessionId: string, revision: number, quote: string) {
  const [expiry, mac] = quote.split('.');
  if (!/^\d+$/.test(expiry ?? '') || !/^[a-f0-9]{64}$/.test(mac ?? '') || Number(expiry) < Date.now()) throw new InvalidPlan('This review has expired. Refresh the options before applying.');
  const expected = signature(`${sessionId}:${revision}:${expiry}`);
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) throw new InvalidPlan('This review is no longer valid. Refresh the options.');
}

/** Persistent local Node demo. One process, serialized transactions, atomic file replacement. */
export class TripRepository {
  constructor(private directory = process.env.RAAHI_DATA_DIR ?? path.join(process.cwd(), '.raahi')) {}
  private file(id: string) {
    if (!/^[a-f0-9]{64}$/.test(id)) throw new Error('Invalid session');
    return path.join(this.directory, `${id}.json`);
  }
  private async load(id: string): Promise<TripState> {
    try { return JSON.parse(await readFile(this.file(id), 'utf8')) as TripState; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return initialState(); throw error; }
  }
  private async save(id: string, state: TripState) {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const destination = this.file(id), temporary = `${destination}.${randomBytes(6).toString('hex')}.tmp`;
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, destination);
  }
  private exclusive<T>(work: () => Promise<T>): Promise<T> {
    const next = (processState.raahiQueue ?? Promise.resolve()).then(work, work);
    processState.raahiQueue = next.catch(() => undefined);
    return next;
  }
  read(id: string) { return this.exclusive(() => this.load(id)); }
  update(id: string, command: Command): Promise<TripState> {
    return this.exclusive(async () => {
      const state = await this.load(id);
      const fingerprint = command.action === 'apply' ? JSON.stringify({ planId: command.planId, expectedRevision: command.expectedRevision }) : '';
      if (command.action === 'apply') {
        const prior = state.requests.find(r => r.key === command.idempotencyKey);
        if (prior) {
          if (prior.fingerprint !== fingerprint) throw new Conflict('This request key was already used for a different plan.');
          return state;
        }
      }
      if (state.revision !== command.expectedRevision) throw new Conflict('The itinerary changed in another tab. Latest state loaded; review it before retrying.');
      let next = structuredClone(state);
      if (command.action === 'reset') next = { ...initialState(), revision: state.revision };
      else if (state.applied) throw new Conflict('This recovery is already applied. Reset the demo to explore another scenario.');
      else if (command.action === 'scenario') next.scenario = command.scenario;
      else if (command.action === 'preferences') next.preferences = command.preferences;
      else if (command.action === 'apply') {
        verifyQuote(id, state.revision, command.quote);
        const result = recover(state.scenario, state.preferences);
        const plan = result.plans.find(p => p.id === command.planId);
        if (!plan) throw new InvalidPlan('That plan is not feasible under the current constraints.');
        next.applied = plan;
        next.history.push({ revision: state.revision + 1, label: plan.title, at: new Date().toISOString(), cashNow: plan.ledger.cashNow, before: result.timeline, after: plan.segments, actions: plan.ledger.items.map(item => `${item.label}: simulated; supplier action pending`) });
        next.history = next.history.slice(-20);
        next.requests.push({ key: command.idempotencyKey, fingerprint, revision: state.revision + 1 });
        next.requests = next.requests.slice(-100);
      }
      next.revision = state.revision + 1;
      await this.save(id, next);
      return next;
    });
  }
}
export const repository = new TripRepository();
