import type { CSSProperties } from 'react';
import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';
import type { Theme, SxProps } from '@mui/material/styles';

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

/**
 * Hover shadow for glass surfaces -- same violet family as glass()'s static
 * shadow, deepened one notch. Replaces MUI's neutral grey shadows on hover
 * (GlassCard / StyledProjectCard / StyledAccordion).
 */
export const glassHoverShadow = (theme: Theme): string =>
  theme.palette.mode === 'dark'
    ? 'inset 0 1px 0 0 rgba(255,255,255,0.10), 0 12px 36px rgba(45,212,191,0.10)'
    : '0 12px 40px rgba(124,58,237,0.16)';

/**
 * Focus-visible ring (ui-ux-pro-max `focus-states`). Uses the palette CSS
 * variable so the ring follows light/dark primary. Spread into a component's
 * `styleOverrides.root`.
 */
export const focusVisibleRing = (offset = 2): Record<string, CSSProperties> => ({
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: offset,
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
} as const;

/** Duration tokens (emil: UI animations stay under 300ms). */
export const duration = {
  press: 160, // button :active feedback
} as const;

/**
 * z-index scale (ui-ux-pro-max `z-index-management`).
 * MUI defaults: appBar 1100, drawer 1200, modal 1300, snackbar 1400, tooltip 1500.
 * Use these named tokens instead of magic numbers so layering stays auditable.
 */
export const zIndex = {
  backgroundOrb: 0, // behind all content
  backToTop: 1150, // above AppBar (1100), below drawer/modal
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
          primary: '#18181b',
          secondary: '#52525b',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#2dd4bf',
        },
        secondary: {
          main: '#2dd4bf',
        },
        background: {
          default: '#0d0d0d',
          paper: '#1a1a1a',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
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
    // color-mix() against CSS vars follows light/dark automatically. Pseudo-
    // elements only -- NEVER set html font-size here (emotion would override
    // the static fonts.css rem baseline).
    MuiCssBaseline: {
      styleOverrides: {
        '::selection': {
          backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor:
            'color-mix(in srgb, var(--mui-palette-text-primary) 18%, transparent) transparent',
        },
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          borderRadius: 999,
          backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 18%, transparent)',
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 28%, transparent)',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
