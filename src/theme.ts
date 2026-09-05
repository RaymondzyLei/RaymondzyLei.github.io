// Barrel file: implementation lives in src/theme/ (tokens / glass / palette /
// overrides). All `from '../theme'` / `from './theme'` imports keep working —
// feature code must keep importing from this barrel, never from './theme/*'.
export { glass, glassHoverShadow, focusVisibleRing, ctaButtonSx } from './theme/glass';
export { easing, duration, zIndex, DISPLAY_FONT } from './theme/tokens';
import theme from './theme/palette';

export default theme;
