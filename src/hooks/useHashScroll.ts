import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';

/**
 * The sticky AppBar's height as a negative scroll offset, measured live so it
 * stays correct across breakpoints/zoom. Keeps hash-targeted section headings
 * just below the bar instead of underneath it.
 */
const appbarOffset = (): number => {
  const appbar = document.querySelector('.MuiAppBar-root');
  return appbar ? -appbar.getBoundingClientRect().height : 0;
};

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
      if (el) lenis?.scrollTo(el, { duration, offset: appbarOffset() });
    };
    // Defer the initial scroll past two rAFs: on first paint the browser's own
    // anchor jump and the layout (images, fonts) haven't settled, so measuring
    // the target immediately can compute a stale scroll position. Two frames
    // let layout commit first; runtime `hashchange` events still scroll
    // immediately.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scrollToHash);
    });
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [lenis, duration]);
};
