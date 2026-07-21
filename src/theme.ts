import type { CSSProperties } from 'react';
import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

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
      ? 'inset 0 1px 0 0 rgba(255,255,255,0.08)'
      : 'inset 0 1px 0 0 rgba(255,255,255,0.6), 0 8px 32px rgba(124,58,237,0.08)',
});

const HEADING_FONT = '"Ubuntu Mono", "Cascadia Code", "Fira Code", monospace';
const BODY_FONT = '"Neo Sans Pro", "SmileySans", sans-serif';
const headingTypography = { fontFamily: HEADING_FONT };

/** Hero display name font (Playfair Display bold italic). */
export const DISPLAY_FONT = '"Playfair Display", serif';

/**
 * Easing tokens (emil-design-eng: built-in CSS easings are too weak).
 * Use these for all UI transitions instead of `ease` / `ease-out` defaults.
 */
export const easing = {
  /** Strong ease-out for entering elements & feedback (dropdowns, hovers). */
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** Strong ease-in-out for on-screen movement. */
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
} as const;

/** Duration tokens (emil: UI animations stay under 300ms). */
export const duration = {
  press: 160, // button :active feedback
  hover: 200, // chip / icon hover
  standard: 300, // card elevation, color shifts
} as const;

let theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#7c3aed',
        },
        // TODO: secondary palette currently mirrors primary; pick a real accent when needed
        secondary: {
          main: '#7c3aed',
        },
        background: {
          default: '#ffffff',
          paper: '#ffffff',
        },
        text: {
          primary: '#000000',
          secondary: '#333333',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#a78bfa',
        },
        // TODO: secondary palette currently mirrors primary; pick a real accent when needed
        secondary: {
          main: '#a78bfa',
        },
        background: {
          default: '#0d0d0d',
          paper: '#1a1a1a',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e5e7eb',
        },
      },
    },
  },
  typography: {
    fontFamily: BODY_FONT,
    // Optical typography (apple-design §15): tracking tightens as size grows,
    // leading tracks size inversely. Weight+size+leading as a set, not size alone.
    h1: { ...headingTypography, letterSpacing: '-0.03em', lineHeight: 1.05 },
    h2: { ...headingTypography, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h3: { ...headingTypography, letterSpacing: '-0.015em', lineHeight: 1.2 },
    h4: { ...headingTypography, letterSpacing: '-0.01em', lineHeight: 1.25 },
    h5: { ...headingTypography, letterSpacing: '-0.005em', lineHeight: 1.3 },
    h6: { ...headingTypography, letterSpacing: '0', lineHeight: 1.4 },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
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
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: 2,
          },
        },
      },
    },
    // Global focus-visible policy (ui-ux-pro-max `focus-states` CRITICAL).
    // Uses the palette CSS variable so the ring follows light/dark primary.
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: -2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: 2,
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
