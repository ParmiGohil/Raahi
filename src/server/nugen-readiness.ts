// Check the serving state, not the alignment badge. Nugen can accept inference
// requests while an unavailable adapter waits until the request times out.
export function createNugenReadiness(fetcher: typeof fetch = fetch, timeoutMs = 3000) {
  const cache = new Map<string, { until: number; ready: boolean }>();
  return async (key: string, model: string): Promise<boolean> => {
    const cached = cache.get(model);
    if (cached && cached.until > Date.now()) return cached.ready;
    try {
      const response = await fetcher(`https://api.nugen.in/api/v3/models/${encodeURIComponent(model)}/deployment/status`, {
        headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store',
      });
      if (!response.ok) return false;
      const body = await response.json();
      const ready = body.status === 'DEPLOYED';
      if (cache.size >= 20) cache.clear();
      cache.set(model, { ready, until: Date.now() + (ready ? 15000 : 5000) });
      return ready;
    } catch { return false; }
  };
}
export const nugenReady = createNugenReadiness();
