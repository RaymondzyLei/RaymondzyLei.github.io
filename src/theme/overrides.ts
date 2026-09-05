import type { Components, Theme } from '@mui/material/styles';
import { ACCENT_RGB, TEXT_RGB } from '../styles/colors';
import { focusVisibleRing } from './glass';
import { duration, easing } from './tokens';

/**
 * Component-level styleOverrides, consumed by palette.ts's createTheme.
 * Comments below are load-bearing pitfall records -- keep them with the code.
 */
export const componentOverrides: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        // emil: buttons must feel responsive -- scale down on press.
        // NOTE: Hero CTA's StyledButton mounts useTilt, which writes an inline
        // `el.style.transform` (perspective + rotateX/Y) on mousemove. Inline
        // styles override this CSS `:active`, so the CTA won't visibly scale on
        // press -- the tilt itself provides the interaction feedback there.
        transition: `transform ${duration.press}ms ${easing.easeOut}`,
        '&:active': {
          transform: 'scale(0.97)',
        },
        // H2: global focus-visible policy (ui-ux-pro-max `focus-states` CRITICAL).
        ...focusVisibleRing(2),
      },
    },
  },
  // Global focus-visible policy (ui-ux-pro-max `focus-states` CRITICAL).
  // Uses the palette CSS variable so the ring follows light/dark primary.
  MuiIconButton: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(2),
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(-2),
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(2),
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(2),
      },
    },
  },
  // Decorative global styles: violet selection tint + slim rounded scrollbar.
  // Dual-selector static rules keyed off <html data-mui-color-scheme> (the
  // runtime theme is unavailable in styleOverrides — see palette.ts).
  // Pseudo-elements only -- NEVER set html font-size here (emotion would
  // override the static fonts.css rem baseline).
  MuiCssBaseline: {
    styleOverrides: {
      '::selection': {
        backgroundColor: `rgba(${ACCENT_RGB.light}, 0.20)`,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: `rgba(${ACCENT_RGB.dark}, 0.30)`,
        },
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `rgba(${TEXT_RGB.light}, 0.18) transparent`,
        '[data-mui-color-scheme="dark"] &': {
          scrollbarColor: `rgba(${TEXT_RGB.dark}, 0.18) transparent`,
        },
      },
      '::-webkit-scrollbar': { width: 10, height: 10 },
      '::-webkit-scrollbar-track': { background: 'transparent' },
      '::-webkit-scrollbar-thumb': {
        borderRadius: 999,
        backgroundColor: `rgba(${TEXT_RGB.light}, 0.18)`,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: `rgba(${TEXT_RGB.dark}, 0.18)`,
        },
      },
      '::-webkit-scrollbar-thumb:hover': {
        backgroundColor: `rgba(${TEXT_RGB.light}, 0.28)`,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: `rgba(${TEXT_RGB.dark}, 0.28)`,
        },
      },
    },
  },
};
