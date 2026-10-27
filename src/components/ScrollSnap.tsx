import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';
import Snap from 'lenis/snap';
import { SECTION_IDS } from '../sections';
import { sectionScrollTarget } from '../hooks/sectionScrollTarget';

/**
 * Proximity scroll snap for the homepage: after the user stops scrolling,
 * snap to the nearest section top when within the threshold (20% viewport,
 * ~150-200px). Mounted once inside <ReactLenis> on the home route only
 * (404 / redirect / resume have no sections to snap to).
 *
 * distanceThreshold stays well below the library default of '50%': homepage
 * section gaps are 500-800px, so a 50% radius (~370-500px) covers essentially
 * the whole page and the behavior degrades to near-mandatory. 20% keeps the
 * promised gentle "snap assist" — mid-section stops stay free.
 *
 * Gated off for prefers-reduced-motion (snapping is an animation) and
 * pointer: coarse (Lenis doesn't take over touch scrolling, so snap points
 * would fight the native momentum scroll). Same gating pair as the
 * mouse-follow orb in BackgroundOrbs.
 *
 * Section lookups reuse SECTION_IDS from sections.ts — same single source as
 * useActiveSection, so the two can never drift.
 */
export const ScrollSnap: React.FC = () => {
  const lenis = useLenis();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const coarsePointer = useMediaQuery('(pointer: coarse)');

  useEffect(() => {
    if (!lenis || reducedMotion || coarsePointer) return undefined;

    const snap = new Snap(lenis, { type: 'proximity', distanceThreshold: '20%' });
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    // lenis/snap has no element offset option. Numeric points let the section
    // edge align with the same live AppBar offset as navigation and hashes.
    let removePoints: Array<() => void> = [];
    const updatePoints = () => {
      removePoints.forEach((remove) => remove());
      removePoints = elements.map((element) => snap.add(sectionScrollTarget(element)));
    };
    updatePoints();
    const observer = new ResizeObserver(updatePoints);
    observer.observe(document.body);
    elements.forEach((element) => observer.observe(element));
    const appbar = document.querySelector('.MuiAppBar-root');
    if (appbar) observer.observe(appbar);
    window.addEventListener('resize', updatePoints);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePoints);
      removePoints.forEach((remove) => remove());
      snap.destroy();
    };
  }, [lenis, reducedMotion, coarsePointer]);

  return null;
};
