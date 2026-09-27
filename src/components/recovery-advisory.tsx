'use client';
import { useEffect, useRef, useState } from 'react';
import type { Advisory } from '../server/recovery-advisor';
export function RecoveryAdvisory({ revision }: { revision: number }) {
  const [result, setResult] = useState<Advisory | null>(null), [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function explain() {
    controller.current?.abort();
    const request = new AbortController(); controller.current = request; setBusy(true);
    try {
      const response = await fetch('/api/recovery/insight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision }), signal: AbortSignal.any([request.signal, AbortSignal.timeout(7000)]) });
      if (!response.ok) throw new Error('unavailable');
      const next: Advisory = await response.json();
      if (!request.signal.aborted && next.revision === revision) setResult(next);
    } catch { if (!request.signal.aborted) setResult({ source: 'simulation', reason: 'unavailable', revision, message: 'The explanation service is unavailable. Use the engine-checked simulated recovery options below; review and apply still work.' }); }
    finally { if (!request.signal.aborted) setBusy(false); }
  }
  return <div className="recovery-assumptions"><button className="button outline" onClick={explain} disabled={busy}>{busy ? 'Checking explanation…' : 'Explain recovery options'}</button><div role="status" aria-live="polite">{result ? <><strong>{result.source === 'nugen' ? 'Nugen AI explanation · advisory only' : 'Simulated fallback · Nugen unavailable or disabled'}</strong><p>{result.message}</p></> : <p>Optional Nugen explanation. If unavailable, the demo uses its engine-checked simulated data.</p>}</div></div>;
}
