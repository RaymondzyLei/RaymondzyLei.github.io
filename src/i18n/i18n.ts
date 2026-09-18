import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import zhTranslations from './zh.json';
// Re-exported so existing consumers keep importing from './i18n'.
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_OPTIONS,
  isSupportedLanguage,
  matchBrowserLanguage,
  resolveInitialLanguage,
  type SupportedLanguage,
} from './languages';

export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_OPTIONS,
  isSupportedLanguage,
  matchBrowserLanguage,
  resolveInitialLanguage,
};
export type { SupportedLanguage };

const resources = {
  en: { translation: enTranslations },
  zh: { translation: zhTranslations },
};

// Initial language: a valid `?lang=` URL query wins, then the saved
// preference, then the browser language (first-visit zh browser -> Chinese),
// then English. A valid URL language also seeds localStorage so following
// bare navigations keep it. The URL is read once here — runtime language
// changes mirror to the URL at the action point (LanguageMenu), never in the
// languageChanged listener (i18next fires it during init(), which would
// rewrite every bare URL to the saved language).
const urlLang = new URLSearchParams(window.location.search).get('lang');
const saved = localStorage.getItem('language');
const browserLang = matchBrowserLanguage(navigator.languages ?? [navigator.language]);
const initialLng = resolveInitialLanguage(urlLang, saved, browserLang);
if (isSupportedLanguage(urlLang) && urlLang !== saved) {
  localStorage.setItem('language', urlLang);
}

// Keep <html lang> in sync with the active language so screen readers pronounce
// content correctly and search engines index the right language.
const setHtmlLang = (lng: string) => {
  document.documentElement.lang = lng;
};
setHtmlLang(initialLng);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  setHtmlLang(lng);
});

export default i18n;
