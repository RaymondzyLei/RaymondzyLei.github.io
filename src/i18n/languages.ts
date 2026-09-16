/**
 * Side-effect-free language constants. Lives apart from i18n.ts (which
 * initializes i18next at import time) so pure modules — routing, tests — can
 * validate language codes without dragging in i18next or touching localStorage.
 */

export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Single source of truth for the language picker. code derives the type;
 * labelKey is the i18n key for the menu item label. Add a language here only
 * (plus en.json/zh.json translations).
 */
export const LANGUAGE_OPTIONS = [
  { code: 'en', labelKey: 'nav.langEn' },
  { code: 'zh', labelKey: 'nav.langZh' },
] as const;

export const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
  value !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * Initial language for a fresh page load: a valid `?lang=` URL query wins,
 * then the saved preference, then English. Both inputs are validated
 * explicitly (no `||` fallback). Pure - the i18n bootstrap applies the result.
 */
export const resolveInitialLanguage = (
  urlLang: string | null,
  savedLang: string | null,
): SupportedLanguage => {
  if (isSupportedLanguage(urlLang)) return urlLang;
  if (isSupportedLanguage(savedLang)) return savedLang;
  return 'en';
};
