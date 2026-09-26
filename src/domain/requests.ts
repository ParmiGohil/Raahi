import { z } from 'zod';
const revision = z.number().int().positive();
export const commandSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('scenario'), expectedRevision: revision, scenario: z.enum(['original', 'delay', 'activity-cancelled', 'delay-later-cancelled']) }),
  z.object({ action: z.literal('preferences'), expectedRevision: revision, preferences: z.object({ protectOriginal: z.boolean(), budget: z.number().int().min(0).max(10000000) }) }),
  z.object({ action: z.literal('apply'), expectedRevision: revision, planId: z.enum(['budget', 'comfort', 'original', 'later']), idempotencyKey: z.string().uuid(), quote: z.string().max(200) }),
  z.object({ action: z.literal('reset'), expectedRevision: revision }),
]);
export type Command = z.infer<typeof commandSchema>;
