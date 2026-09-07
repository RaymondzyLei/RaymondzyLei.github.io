import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';
import Snap from 'lenis/snap';
import { SECTION_IDS } from '../sections';

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
    if (elements.length > 0) {
      // ignoreTransform: sections mount with the reveal effect's
      // translateY(24px) (see revealSx); SnapElement's default rect math uses
      // getBoundingClientRect() and would bake that offset into the snap
      // point permanently (transforms don't fire its ResizeObserver).
      // offsetTop chain ignores transforms, so points stay at true layout
      // positions.
      snap.addElements(elements, { align: 'start', ignoreTransform: true });
    }
    return () => {
      snap.destroy();
    };
  }, [lenis, reducedMotion, coarsePointer]);

  return null;
};
