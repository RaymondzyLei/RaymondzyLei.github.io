/**
 * Single source of truth for every color value in the app.
 *
 * theme.ts derives its palette / glass shadows / focus ring / selection &
 * scrollbar rules from here; BackgroundOrbs and LiquidGlassButton read the
 * accent tokens directly; vite.config.ts injects the scheme backgrounds into
 * index.html's anti-FOUC inline CSS (placeholders `__COLOR_LIGHT__` /
 * `__COLOR_DARK__`, which cannot reference JS at pre-paint time).
 *
 * To retune any color, edit only this file.
 */

/** Text/link/accent color per mode (drives palette.primary/secondary). */
export const ACCENT = {
  /** Violet — light mode. Also orb1's light-mode color. */
  light: '#7c3aed',
  /** Blue-teal — dark mode. Same family as orb2, deliberately not identical. */
  dark: '#29b6f6',
  /** Lightened violet — orb1 in dark mode only (decoupled from text accent). */
  orbDark: '#a78bfa',
} as const;

/** Page/card background colors per mode (palette.background + index.html). */
export const SURFACE = {
  light: { default: '#ffffff', paper: '#ffffff' },
  dark: { default: '#0d0d0d', paper: '#1a1a1a' },
} as const;

/** Body text hierarchy per mode (palette.text). */
export const TEXT = {
  light: { primary: '#18181b', secondary: '#52525b' },
  dark: { primary: '#f4f4f5', secondary: '#a1a1aa' },
} as const;

/** Orb2 blue — pins MUI's framework-default info.main explicitly. */
export const INFO = { main: '#03a9f4' } as const;

/**
 * 'R,G,B' channel triples for use inside rgba() strings (selection tint,
 * scrollbar thumb, hover glows). Derived from the hex tokens above so there
 * is exactly one place to change a hue.
 */
export const rgbChannels = (hex: string): string => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const ACCENT_RGB = {
  light: rgbChannels(ACCENT.light),
  dark: rgbChannels(ACCENT.dark),
} as const;

export const TEXT_RGB = {
  light: rgbChannels(TEXT.light.primary),
  dark: rgbChannels(TEXT.dark.primary),
} as const;

/**
 * Resume (/resume) print palette — deliberately mode-independent (always
 * reads like printed paper), but kept here so all colors share one home.
 */
export const RESUME = {
  ink: '#1a1a1a',
  sub: '#6b7280',
  line: '#e5e7eb',
  paper: '#ffffff',
  chipBg: '#1f2937',
  chipInk: '#ffffff',
  /** Paper drop-shadow (screen only; print strips it). */
  paperShadow: '0 4px 24px rgba(0,0,0,0.08)',
} as const;
