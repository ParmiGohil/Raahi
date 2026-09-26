import { ArrowRight, Check, Clock3, ShieldCheck, Wallet } from 'lucide-react';
import type { Plan } from '../domain/types';
import { formatMoney, time } from '../engine/recover';
export function PlanCard({ plan, onReview, disabled }: { plan: Plan; onReview: (plan: Plan) => void; disabled: boolean }) {
  const event = plan.segments.find(s => s.id === 'event')!;
  return <article className={`plan-card ${plan.originalEvent ? 'featured' : ''}`}>
    <div className="plan-tag">{plan.originalEvent ? <ShieldCheck size={14} /> : plan.restMinutes > 0 ? <Clock3 size={14} /> : <Wallet size={14} />}{plan.originalEvent ? 'Original moment saved' : plan.restMinutes > 0 ? 'More breathing room' : 'Lowest cash option'}</div>
    <h3>{plan.title}</h3><p className="plan-subtitle">{plan.subtitle}</p>
    <div className="price">{formatMoney(plan.ledger.cashNow)}<span>cash needed now</span></div>
    <dl className="comparison"><div><dt>Concert session</dt><dd>{time(event.start)}</dd></div><div><dt>Rest at hotel</dt><dd>{plan.restMinutes} min</dd></div><div><dt>Itinerary items changed*</dt><dd>{plan.changedIds.length}</dd></div><div><dt>Later refund</dt><dd>{formatMoney(plan.ledger.futureRefund)}</dd></div><div><dt>Prepaid loss</dt><dd>{formatMoney(plan.ledger.prepaidLoss)}</dd></div></dl>
    <p className={plan.warnings.length ? 'plan-warning' : 'plan-valid'}>{plan.warnings.length ? plan.warnings[0] : <><Check size={14} /> All required timing checks pass</>}</p>
    <button className={plan.originalEvent ? 'button primary' : 'button outline'} onClick={() => onReview(plan)} disabled={disabled}>Review this plan <ArrowRight size={16} /></button>
  </article>;
}
