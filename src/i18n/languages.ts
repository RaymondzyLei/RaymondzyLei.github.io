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
 * First supported language found in a list of BCP-47 tags, or null. Accepts
 * exact tags ('zh'), primary-substring matches ('zh-CN', 'zh-Hans-TW' -> 'zh';
 * 'en-GB' -> 'en') and full-tag equals ('zh-Hans' -> 'zh' only when zh-Hans is
 * supported). Pure - the i18n bootstrap decides where the list comes from
 * (navigator.languages).
 */
export const matchBrowserLanguage = (
  browserLanguages: readonly string[],
): SupportedLanguage | null => {
  for (const tag of browserLanguages) {
    const language = tag.split('-')[0];
    if (isSupportedLanguage(language)) return language;
  }
  return null;
};

/**
 * Initial language for a fresh page load: a valid `?lang=` URL query wins,
 * then the saved preference, then the browser language, then English. All
 * inputs are validated explicitly (no `||` fallback). Pure - the i18n
 * bootstrap applies the result; see `matchBrowserLanguage` for tag matching.
 */
export const resolveInitialLanguage = (
  urlLang: string | null,
  savedLang: string | null,
  browserLang: SupportedLanguage | null = null,
): SupportedLanguage => {
  if (isSupportedLanguage(urlLang)) return urlLang;
  if (isSupportedLanguage(savedLang)) return savedLang;
  if (browserLang !== null) return browserLang;
  return 'en';
};
