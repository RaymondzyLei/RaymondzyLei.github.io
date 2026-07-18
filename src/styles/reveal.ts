import type { CSSProperties } from 'react';

/**
 * Shared scroll-reveal style fragment.
 *
 * Apply via `sx={{ ...revealSx(isVisible, delayMs) }}` on the OUTER wrapper
 * element (the one holding the useReveal ref). Do NOT attach to the same
 * element as useTilt — reveal writes `translate3d`, tilt writes `rotate3d`
 * (see CLAUDE.md "transform 写入隔离").
 *
 * opacity 0->1 + translateY(24px)->0, 1200ms cubic-bezier(0.22,1,0.36,1).
 * Stagger via `delayMs` (callers pass `index * 100`); section-level reveals
 * pass 0 (default).
 */
export const revealSx = (isVisible: boolean, delayMs = 0): CSSProperties => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
  transition:
    'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
  transitionDelay: `${delayMs}ms`,
  willChange: 'opacity, transform',
});
