'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, HeartPulse } from 'lucide-react';
import { useTrip } from './trip-provider';
import { tripHealth } from '../engine/journey';
export function TripHealth({ compact = false }: { compact?: boolean }) {
  const { data } = useTrip();
  const health = data ? tripHealth(data.state, data.recovery) : null;
  const score = health?.score ?? 0;
  const [shown, setShown] = useState(score); const last = useRef(score); const previous = useRef(score);
  useEffect(() => {
    const from = last.current; previous.current = from; last.current = score;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(score); return; }
    let frame = 0; const start = performance.now();
    const tick = (now: number) => { const t = Math.min(1, (now - start) / 750); setShown(Math.round(from + (score - from) * (1 - (1 - t) ** 3))); if (t < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [score]);
  const tone = health?.provisional ? 'caution' : score >= 80 ? 'healthy' : score >= 55 ? 'caution' : 'critical';
  return <section className={`health-card ${tone} ${compact ? 'compact-health' : ''}`} aria-label="Trip Health">
    <div className="health-heading"><span><HeartPulse size={17} /> TRIP HEALTH</span><span className="health-live">{data ? 'Connected to your trip' : 'Loading'}</span></div>
    <div className="health-body"><div className="health-gauge"><svg viewBox="0 0 180 180" aria-hidden="true"><circle className="gauge-track" cx="90" cy="90" r="73" /><circle className="gauge-value" cx="90" cy="90" r="73" strokeDasharray="458.67" strokeDashoffset={458.67 * (1 - shown / 100)} /></svg><div><strong>{data && !health?.provisional ? shown : '—'}</strong><span>/ 100</span></div></div><div className="health-copy"><h2>{data?.recovery.timeline.some(s => s.durationUnknown || s.locationUnknown) ? 'Details needed.' : health?.recovered ? 'A way forward.' : score >= 80 ? 'Looking good.' : score >= 55 ? 'A little attention.' : 'Let’s repair your trip.'}</h2><p aria-live="polite">{health?.message ?? 'Assessing the connected itinerary…'}</p>{previous.current > 0 && previous.current !== score && data && !health?.provisional && <span className="health-change">{score > previous.current ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{score > previous.current ? 'Improved' : 'Decreased'} after your trip changed</span>}</div></div>
    <details className="health-explanation"><summary>How this score works</summary><p>Starts at 95. Each tight connection reduces it by 4, a directly affected booking by 12, and a blocked booking by 10. Applied plans are recalculated with 8 points reserved for pending provider actions. This is a planning indicator, not a probability of travel success.</p></details>
  </section>;
}

