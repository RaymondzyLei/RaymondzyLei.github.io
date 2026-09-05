import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ACCENT, SURFACE, TEXT, INFO } from '../styles/colors';
import { componentOverrides } from './overrides';

const HEADING_FONT = '"Ubuntu Mono", "Cascadia Code", "Fira Code", monospace';
const BODY_FONT = '"Neo Sans Pro", "SmileySans", sans-serif';
const headingTypography = { fontFamily: HEADING_FONT };

let theme = createTheme({
  // NOTE: cssVariables is intentionally OFF. With it on, `theme.palette` in
  // styled()/sx callbacks freezes at the default (light) scheme, breaking
  // every `palette.mode === 'dark'` branch (glass(), SoftChip, hover shadows).
  // Mode-dependent CSS that cannot read the runtime theme uses dual-selector
  // rules keyed off data-mui-color-scheme instead (see glass.ts); App.tsx
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
    borderRadius: 16,
  },
  components: componentOverrides,
});

theme = responsiveFontSizes(theme);

export default theme;
