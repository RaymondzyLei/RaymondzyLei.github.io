import { useCallback } from 'react';
import { useLenis } from 'lenis/react';
import { sectionScrollTarget } from './sectionScrollTarget';

/**
 * Shared scroll-to-section helper. Measure the section and sticky AppBar at
 * click time so the section starts just below the bar at every breakpoint.
 */
export const useScrollToSection = (): ((element: HTMLElement) => void) => {
  const lenis = useLenis();

  return useCallback(
    (element: HTMLElement) => {
      lenis?.scrollTo(sectionScrollTarget(element));
    },
    [lenis],
  );
};
