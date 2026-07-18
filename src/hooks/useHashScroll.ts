import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';

/**
 * Resolve a URL hash to a DOM element, or null if it doesn't target a real
 * section. Strips a single leading `#`; empty hash -> null; unknown id -> null
 * (the "invalid hash is silently ignored" rule).
 */
export const getHashTarget = (hash: string): HTMLElement | null => {
  const id = hash.replace(/^#/, '');
  return id ? document.getElementById(id) : null;
};

/**
 * Scroll to the section named by `window.location.hash`, and keep responding
 * to `hashchange` at runtime. Must be called inside a <ReactLenis> subtree so
 * `useLenis()` resolves. Invalid/empty hashes are ignored. On mount and when
 * the lenis instance becomes available, the current hash is applied once.
 */
export const useHashScroll = (): void => {
  const lenis = useLenis();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const duration = reducedMotion ? 0 : 1.2;

  useEffect(() => {
    const scrollToHash = () => {
      const el = getHashTarget(window.location.hash);
      if (el) lenis?.scrollTo(el, { duration });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [lenis, duration]);
};
