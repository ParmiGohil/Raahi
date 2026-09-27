import { describe, expect, it } from 'vitest';
import { parseNugenJson } from '../src/server/nugen-json';

describe('Nugen response boundary', () => {
  it('accepts JSON and the observed single missing closing brace', () => {
    expect(parseNugenJson('{"risk":"high"}')).toEqual({ risk: 'high' });
    expect(parseNugenJson('{"risk":"high"')).toEqual({ risk: 'high' });
  });
  it('rejects non-JSON and incomplete fields', () => {
    expect(() => parseNugenJson('high risk')).toThrow();
    expect(() => parseNugenJson('{"risk":')).toThrow();
  });
});
