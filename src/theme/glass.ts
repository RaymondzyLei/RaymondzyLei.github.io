import type { CSSProperties } from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme, SxProps } from '@mui/material/styles';
import type { CSSObject } from '@emotion/react';
import { ACCENT } from '../styles/colors';

export const glass = (theme: Theme): CSSProperties => ({
  backgroundColor: alpha(
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.background.paper,
    0.65,
  ),
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid',
  borderColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.12 : 0.5),
  boxShadow:
    theme.palette.mode === 'dark'
      ? `inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.08)}`
      : `inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.6)}, 0 8px 32px ${alpha(ACCENT.light, 0.08)}`,
});

/**
 * Hover shadow for glass surfaces -- same violet family as glass()'s static
 * shadow, deepened one notch. Replaces MUI's neutral grey shadows on hover
 * (GlassCard / StyledProjectCard / StyledAccordion).
 */
export const glassHoverShadow = (theme: Theme): string =>
  theme.palette.mode === 'dark'
    ? `inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.1)}, 0 12px 36px ${alpha(ACCENT.dark, 0.1)}`
    : `0 12px 40px ${alpha(ACCENT.light, 0.16)}`;

/**
 * Focus-visible ring (ui-ux-pro-max `focus-states`). Static dual-selector CSS
 * keyed off <html data-mui-color-scheme> — theme callbacks cannot read the
 * runtime mode (cssVariables is off, see palette.ts). Spread into a
 * component's `styleOverrides.root`.
 */
export const focusVisibleRing = (offset = 2): Record<string, CSSObject> => ({
  '&:focus-visible': {
    outline: `2px solid ${ACCENT.light}`,
    outlineOffset: offset,
  },
  // Dark override as a TOP-LEVEL sibling selector: MUI's styleOverrides
  // pipeline drops nested selector keys inside '&:focus-visible'.
  '[data-mui-color-scheme="dark"] &:focus-visible': {
    outlineColor: ACCENT.dark,
  },
});

/** Shared CTA button sx (NotFound + RedirectPage). Hero keeps its own. */
export const ctaButtonSx: SxProps = {
  textTransform: 'none',
  px: 4,
  py: 1.2,
  fontSize: '1rem',
  fontWeight: 600,
};
