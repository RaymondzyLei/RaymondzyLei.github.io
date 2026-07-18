import { describe, it, expect } from 'vitest';
import { resolveRoute } from './routing';

describe('resolveRoute', () => {
  it('returns home for "/"', () => {
    expect(resolveRoute('/')).toEqual({ type: 'home' });
  });

  it('returns redirect for a path listed in REDIRECTS', () => {
    const result = resolveRoute('/google');
    expect(result.type).toBe('redirect');
    if (result.type === 'redirect') {
      expect(result.rule.path).toBe('/google');
      expect(result.rule.targetUrl).toBe('https://www.google.com');
    }
  });

  it('returns notFound for an unknown path', () => {
    expect(resolveRoute('/does-not-exist')).toEqual({ type: 'notFound' });
  });
});
