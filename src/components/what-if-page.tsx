'use client';
import { useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Disruption } from '../domain/types';
import { useTrip } from './trip-provider';
import { PageHeading, LoadingTrip } from './journey-pages';
import { DisruptionForm } from './disruption-form';
import { recoveryForState, tripHealth } from '../engine/journey';
import { DependencyGraph } from './dependency-graph';
import { formatMoney } from '../engine/recover';
export function WhatIfPage() {
  const { data } = useTrip(); const [draft, setDraft] = useState<Disruption | null>(null); const [fixture, setFixture] = useState(false);
  if (!data) return <LoadingTrip />;
  const current = data.state.applied?.segments ?? data.recovery.timeline;
  const hypotheticalState = fixture ? { ...data.state, applied: null, disruption: null, scenario: 'delay' as const } : { ...data.state, mode: 'personal' as const, bookings: current, applied: null, disruption: draft, scenario: 'original' as const };
  const preview = draft || fixture ? recoveryForState(hypotheticalState) : null;
  const currentHealth = tripHealth(data.state, data.recovery); const projected = preview ? tripHealth(hypotheticalState, preview) : null;
  return <><PageHeading eyebrow="A SAFE PLACE TO ASK" title="What if plans change?" description="Explore a hypothetical disruption using your current itinerary. Nothing here is saved to your trip." /><div className="sandbox-banner"><ShieldCheck /><div><strong>Simulation only</strong><p>Your saved itinerary stays at revision {data.state.revision}. Close or clear this preview to return to your current trip.</p></div><span>NO TRIP CHANGES</span></div><section className="overview-card"><div className="section-heading"><div><p className="eyebrow">ASK A CONCRETE WHAT-IF</p><h2>Which connection would you like to test?</h2></div><Sparkles /></div><DisruptionForm bookings={current} hypothetical onRun={d => { setFixture(false); setDraft(d); }} />{data.state.mode !== 'personal' && !data.state.applied && <button className="text-button" onClick={() => { setDraft(null); setFixture(true); }}>Try the full Goa 3-hour delay with recovery offers <ArrowRight size={14} /></button>}</section>{preview && projected && <><div className="simulation-comparison"><div><small>SAVED TRIP HEALTH</small><strong>{currentHealth.provisional ? '—' : currentHealth.score}<span>/100</span></strong></div><ArrowRight /><div><small>HYPOTHETICAL TRIP HEALTH</small><strong>{projected.provisional ? '—' : projected.score}<span>/100</span></strong></div><button className="button outline" onClick={() => { setDraft(null); setFixture(false); }}>Clear simulation</button></div><section className="overview-card"><h2>{preview.impacts.filter(i => i.state === 'blocked').length} connections need repair</h2><p>{projected.message}</p>{preview.plans.length ? preview.plans.map(p => <div className="preview-plan" key={p.id}><strong>{p.title}</strong><span>{formatMoney(p.ledger.cashNow)} cash estimate</span><small>{p.subtitle}</small></div>) : <p>No verified recovery offers for this hypothetical case. Review the causes below and check replacement details with providers.</p>}<Link href="/recovery" className="text-button">Open recovery to choose a saved-trip scenario <ArrowRight size={16} /></Link></section><DependencyGraph segments={preview.timeline} recovery={preview} /></>}</>;
}
