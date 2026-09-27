import type { Plan, TravelerProfile } from '../domain/types';

/** Presentation order only. Feasibility and the set of plans remain engine-owned. */
export function orderPlansForProfile(plans: Plan[], priority?: TravelerProfile['recoveryPriority']) {
  if (!priority) return plans;
  const score = (plan: Plan) => {
    switch (priority) {
      case 'Lower cost': return plan.ledger.cashNow;
      case 'More rest': return -plan.restMinutes;
      case 'Keep experiences': return plan.originalEvent ? 0 : 1;
      case 'Fewer changes': return plan.changedIds.length;
    }
  };
  return [...plans].sort((a, b) => score(a) - score(b));
}
