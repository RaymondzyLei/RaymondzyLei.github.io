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
    h1: headingTypography,
    h2: headingTypography,
    h3: headingTypography,
    h4: headingTypography,
    h5: headingTypography,
    h6: headingTypography,
  },
  shape: {
    borderRadius: 24,
  },
});

theme = responsiveFontSizes(theme);

export default theme;
