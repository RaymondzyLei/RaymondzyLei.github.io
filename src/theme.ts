import type { CSSProperties } from 'react';
import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';
import type { Theme, SxProps } from '@mui/material/styles';
import type { CSSObject } from '@emotion/react';
import { ACCENT, ACCENT_RGB, TEXT_RGB, SURFACE, TEXT, INFO } from './styles/colors';

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
 * runtime mode (see ACCENT note above). Spread into a component's
 * `styleOverrides.root`.
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

// Color values live in src/styles/colors.ts (single source of truth — also
// consumed by BackgroundOrbs, LiquidGlassButton, ResumePage and vite.config's
// index.html token injection). The dual-selector rules below are plain CSS
// keyed off <html data-mui-color-scheme> because theme.palette is frozen at
// the default scheme inside style callbacks — runtime JS branching cannot
// follow the active mode there.

let theme = createTheme({
  // NOTE: cssVariables is intentionally OFF. With it on, `theme.palette` in
  // styled()/sx callbacks freezes at the default (light) scheme, breaking
  // every `palette.mode === 'dark'` branch (glass(), SoftChip, hover shadows).
  // Mode-dependent CSS that cannot read the runtime theme uses dual-selector
  // rules keyed off data-mui-color-scheme instead (see ACCENT above); App.tsx
  // keeps that attribute in sync with useColorScheme().
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: ACCENT.light,
        },
        // TODO: secondary palette currently mirrors primary; pick a real accent when needed
        secondary: {
          main: ACCENT.light,
        },
        info: { main: INFO.main },
        background: {
          default: SURFACE.light.default,
          paper: SURFACE.light.paper,
        },
        text: {
          primary: TEXT.light.primary,
          secondary: TEXT.light.secondary,
        },
      },
    },
    dark: {
      palette: {
        // Blue-teal accent — same family as orb2 but NOT the same value (orb2
        // is the framework-default info blue, pinned above as INFO.main).
        // Orb1 keeps its violet via ACCENT.orbDark in BackgroundOrbs.
        primary: {
          main: ACCENT.dark,
        },
        secondary: {
          main: ACCENT.dark,
        },
        info: { main: INFO.main },
        background: {
          default: SURFACE.dark.default,
          paper: SURFACE.dark.paper,
        },
        text: {
          primary: TEXT.dark.primary,
          secondary: TEXT.dark.secondary,
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
    // Dual-selector static rules keyed off <html data-mui-color-scheme> (the
    // runtime theme is unavailable in styleOverrides — see ACCENT note).
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
  },
});

theme = responsiveFontSizes(theme);

export default theme;
