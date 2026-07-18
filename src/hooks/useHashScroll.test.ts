import { describe, it, expect, beforeEach } from 'vitest';
import { getHashTarget } from './useHashScroll';

describe('getHashTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="skills"></section><section id="hero"></section>';
  });

  it('returns the element for a valid hash', () => {
    const el = getHashTarget('#skills');
    expect(el).not.toBeNull();
    expect(el?.id).toBe('skills');
  });

  it('returns null for an empty hash', () => {
    expect(getHashTarget('')).toBeNull();
    expect(getHashTarget('#')).toBeNull();
  });

  it('returns null for a hash with no matching element', () => {
    expect(getHashTarget('#foobar')).toBeNull();
  });
});