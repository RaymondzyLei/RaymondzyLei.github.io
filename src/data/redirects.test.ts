import { describe, it, expect } from 'vitest';
import { isHttpUrl } from './redirects';

describe('isHttpUrl', () => {
  it('accepts http and https absolute URLs', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('http://example.com/path')).toBe(true);
  });

  it('rejects dangerous schemes', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>')).toBe(false);
    expect(isHttpUrl('vbscript:foo')).toBe(false);
  });

  it('rejects relative/invalid URLs', () => {
    expect(isHttpUrl('/relative')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
    expect(isHttpUrl('not-a-url')).toBe(false);
  });
});
