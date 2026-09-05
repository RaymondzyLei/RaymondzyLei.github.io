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
