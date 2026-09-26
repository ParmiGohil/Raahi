import { z } from "zod";
const revision = z.number().int().positive();
const date = z.string().datetime();
const booking = z.object({
  id: z.string().min(1).max(80), title: z.string().min(1).max(120),
  kind: z.enum(['flight', 'train', 'exit', 'transfer', 'checkin', 'activity', 'storage']),
  start: date, end: date, from: z.string().min(1).max(100), to: z.string().min(1).max(100),
  requires: z.array(z.string().max(80)).max(30), cash: z.number().int().min(0).max(100000000),
  cost: z.number().int().min(0).max(100000000).optional(), reference: z.string().max(80).optional(),
  priority: z.boolean().optional(), flexible: z.boolean().optional(), changeDeadline: date.optional(),
  fixedTime: z.boolean().optional(), connectionMode: z.enum(['auto', 'manual', 'independent']).optional(),
  durationUnknown: z.boolean().optional(), locationUnknown: z.boolean().optional(),
  recommendedBuffer: z.number().int().min(0).max(1440).optional(), cutoff: date.optional(),
  windowStart: date.optional(), windowEnd: date.optional(), evidence: z.string().max(300), available: z.boolean().nullable(),
}).refine(s => Date.parse(s.end) >= Date.parse(s.start), 'End must follow start');
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal('profile'), expectedRevision: revision, profile: z.object({ name: z.string().max(80), email: z.union([z.email(), z.literal('')]), city: z.string().max(80), travelStyle: z.string().max(80) }) }),
  z.object({ action: z.literal('itinerary'), expectedRevision: revision, bookings: z.array(booking).max(100) }),
  z.object({ action: z.literal('disruption'), expectedRevision: revision, disruption: z.object({ bookingId: z.string().max(80), type: z.enum(['delay', 'cancelled', 'late-checkin', 'unavailable', 'traveler-change']), minutes: z.number().int().min(0).max(1440) }).nullable() }),
  z.object({
    action: z.literal("copilot"),
    expectedRevision: revision,
    scenario: z.enum(["delay", "activity-cancelled", "delay-later-cancelled"]),
    preferences: z.object({
      protectOriginal: z.boolean(),
      budget: z.number().int().min(0).max(10000000),
    }),
  }),
  z.object({
    action: z.literal("scenario"),
    expectedRevision: revision,
    scenario: z.enum([
      "original",
      "delay",
      "activity-cancelled",
      "delay-later-cancelled",
    ]),
  }),
  z.object({
    action: z.literal("preferences"),
    expectedRevision: revision,
    preferences: z.object({
      protectOriginal: z.boolean(),
      budget: z.number().int().min(0).max(10000000),
    }),
  }),
  z.object({
    action: z.literal("apply"),
    expectedRevision: revision,
    planId: z.enum(["budget", "comfort", "original", "later", "reschedule", "simulated-cab", "simulated-priority"]),
    idempotencyKey: z.string().uuid(),
    quote: z.string().max(200),
  }),
  z.object({ action: z.literal("reset"), expectedRevision: revision }),
]);
export type Command = z.infer<typeof commandSchema>;
