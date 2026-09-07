import { useCallback } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Shared scroll-to-section helper: scrolls to a DOM element with the sticky
 * AppBar's height as offset, so the section heading lands just below the bar
 * instead of underneath it.
 *
 * The AppBar height is measured at click time (not cached) so it stays correct
 * across breakpoints, language switches, and zoom levels.
 */
export const useScrollToSection = (): ((element: HTMLElement) => void) => {
  const lenis = useLenis();

  return useCallback(
    (element: HTMLElement) => {
      const appbar = document.querySelector('.MuiAppBar-root');
      const offset = appbar ? -appbar.getBoundingClientRect().height : 0;
      lenis?.scrollTo(element, { offset });
    },
    [lenis],
  );
};
