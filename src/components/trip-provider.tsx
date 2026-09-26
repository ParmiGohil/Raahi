'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Recovery } from '../domain/types';
import type { PublicTrip } from '../engine/journey';
type Data = { state: PublicTrip; recovery: Recovery; quote: string; persistence?: string };
type Store = { data: Data | null; busy: boolean; error: string; mutate: (command: Record<string, unknown>) => Promise<boolean>; reload: () => Promise<void> };
const Context = createContext<Store | null>(null);
export function TripProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const reload = useCallback(async () => {
    const response = await fetch('/api/trip', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Could not load your trip.');
    setData(result); setError('');
  }, []);
  useEffect(() => { reload().catch(e => setError(e.message)); }, [reload]);
  async function mutate(command: Record<string, unknown>) {
    if (!data || lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      const response = await fetch('/api/trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...command, expectedRevision: data.state.revision }) });
      const next = await response.json();
      if (!response.ok) { if (response.status === 409) await reload(); throw new Error(next.error ?? 'Could not save. Please retry.'); }
      setData(next); return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Connection interrupted. Your saved trip is preserved.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  return <Context.Provider value={{ data, busy, error, mutate, reload }}>{children}</Context.Provider>;
}
export function useTrip() { const value = useContext(Context); if (!value) throw new Error('TripProvider missing'); return value; }
