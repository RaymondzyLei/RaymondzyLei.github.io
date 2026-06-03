import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import zhTranslations from './zh.json';

const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
  value !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

const resources = {
  en: { translation: enTranslations },
  zh: { translation: zhTranslations },
};

const saved = localStorage.getItem('language');
const initialLng: SupportedLanguage = isSupportedLanguage(saved) ? saved : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
