import { describe, it, expect } from 'vitest';
import { revealSx } from './reveal';

describe('revealSx', () => {
  it('visible: opacity 1, no y offset, no delay', () => {
    const s = revealSx(true, 0);
    expect(s.opacity).toBe(1);
    expect(s.transform).toBe('translate3d(0, 0, 0)');
    expect(s.transitionDelay).toBe('0ms');
  });

  it('hidden: opacity 0, translateY 24px', () => {
    const s = revealSx(false);
    expect(s.opacity).toBe(0);
    expect(s.transform).toBe('translate3d(0, 24px, 0)');
  });

  it('respects delayMs parameter for stagger', () => {
    expect(revealSx(true, 100).transitionDelay).toBe('100ms');
    expect(revealSx(false, 250).transitionDelay).toBe('250ms');
  });
});