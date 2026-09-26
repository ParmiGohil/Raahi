'use client';
import { useState } from 'react';
import { Plane, CarFront, Hotel, Music2, Luggage, TrainFront, ArrowDown, ShieldCheck } from 'lucide-react';
import type { Recovery, Segment } from '../domain/types';
import { connectionBuffer } from '../engine/journey';
import { time } from '../engine/recover';
const icons = { flight: Plane, train: TrainFront, transfer: CarFront, checkin: Hotel, activity: Music2, exit: Luggage, storage: Luggage };
export function DependencyGraph({ segments, recovery, applied = false }: { segments: Segment[]; recovery: Recovery; applied?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  if (!segments.length) return <div className="empty-card"><h2>Your connections will appear here.</h2><p>Add two or more bookings and select which earlier booking each depends on.</p></div>;
  return <div className="dependency-graph">{segments.map((s, index) => {
    const impact = recovery.impacts.find(i => i.id === s.id); const status = applied ? 'unaffected' : impact?.state ?? 'unaffected'; const Icon = icons[s.kind];
    const parents = s.requires.map(id => segments.find(p => p.id === id)).filter((p): p is Segment => !!p);
    return <div key={s.id} className="graph-step" style={{ '--step': index } as React.CSSProperties}>
      {parents.map(parent => { const b = connectionBuffer(parent, s); const upstreamBlocked = !applied && recovery.impacts.some(i => i.id === parent.id && (i.state === 'blocked' || (i.state === 'direct' && parent.available === false))); return <div className={`buffer-bridge ${upstreamBlocked ? 'risky' : b.status.toLowerCase()}`} key={parent.id}><span className="bridge-line" /><ArrowDown size={16} /><div><small>FROM {parent.title}</small><strong>{b.actual} min available <span> / {b.recommended} min suggested</span></strong><div className="buffer-track"><span style={{ width: `${Math.min(100, b.ratio)}%` }} /></div><p>{b.ratio}% scheduled buffer · {upstreamBlocked ? 'Blocked upstream' : b.status}<span>{upstreamBlocked ? 'This gap cannot be relied on until the earlier booking is repaired.' : 'Planning guideline, not a probability'}</span></p></div></div>; })}
      <div className={`graph-node ${status} ${selected === s.id ? 'focused' : ''}`}>
        <button className="graph-node-button" onClick={() => setSelected(selected === s.id ? null : s.id)} aria-expanded={selected === s.id}><span className="node-icon"><Icon size={22} /></span><span><small>{s.kind === 'checkin' ? 'HOTEL' : s.kind.toUpperCase()} · {time(s.start)}–{time(s.end)}</small><strong>{s.title}</strong><span>{s.from} → {s.to}</span></span><span className={`node-status ${status}`}>{applied ? 'Recovery planned' : status === 'blocked' ? 'Needs repair' : status === 'direct' ? 'Disrupted' : status === 'at-risk' ? 'At risk' : 'On schedule'}</span></button>
        <div className={`node-inspector ${selected === s.id ? 'open' : ''}`}><p>{applied ? s.evidence : impact?.reason}</p><dl><div><dt>Reference</dt><dd>{s.reference || 'Not supplied'}</dd></div><div><dt>Arrival / end</dt><dd>{time(s.end)}</dd></div><div><dt>Priority</dt><dd>{s.priority ? 'Must save' : 'Standard'}</dd></div></dl><small><ShieldCheck size={12} /> {s.evidence}</small></div>
      </div>
    </div>;
  })}</div>;
}

