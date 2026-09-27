import { describe, it, expect, vi } from 'vitest';
import { createNugenReadiness } from '../src/server/nugen-readiness';

describe('Nugen serving readiness', () => {
  it('requires DEPLOYED and caches the serving check', async () => {
    const fetcher = vi.fn(async () => Response.json({status:'DEPLOYED'}));
    const ready = createNugenReadiness(fetcher);
    expect(await ready('test-key','model-test')).toBe(true);
    expect(await ready('test-key','model-test')).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('checks again after an unavailable model recovers', async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn().mockResolvedValueOnce(Response.json({status:'UNDEPLOYED'})).mockResolvedValueOnce(Response.json({status:'DEPLOYED'}));
      const ready = createNugenReadiness(fetcher);
      expect(await ready('test-key','model-test')).toBe(false);
      vi.advanceTimersByTime(5001);
      expect(await ready('test-key','model-test')).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('fails closed on authentication errors and malformed replies', async () => {
    for (const response of [new Response('',{status:401}),Response.json({}),new Response('invalid')]) {
      expect(await createNugenReadiness(async () => response)('test-key','model-test')).toBe(false);
    }
  });
  it('bounds a stalled status request', async () => {
    const ready = createNugenReadiness((_url, options) => new Promise((_resolve, reject) => {
      options!.signal!.addEventListener('abort', () => reject(new Error('timeout')), {once:true});
    }),10);
    expect(await ready('test-key','model-test')).toBe(false);
  });
});
