import { REDIRECTS, type RedirectRule } from './data/redirects';
import { isSupportedLanguage, type SupportedLanguage } from './i18n/languages';

/** Language of a resume page — determined by the URL, not the language picker. */
export type ResumeLang = SupportedLanguage;

export type Route =
  | { type: 'home' }
  | { type: 'resume'; lang: ResumeLang }
  | { type: 'redirect'; rule: RedirectRule }
  | { type: 'notFound' };

/**
 * Resolve a pathname to a route. Pure function (no DOM access) - callers pass
 * `window.location.pathname` (+ `window.location.search`). '/' -> home,
 * '/resume' -> resume (language from the `?lang=` query, default English),
 * a path listed in REDIRECTS -> redirect, anything else -> 404.
 * No popstate, no router lib.
 */
export const resolveRoute = (pathname: string, search = ''): Route => {
  if (pathname === '/') return { type: 'home' };
  if (pathname === '/resume') {
    const lang = new URLSearchParams(search).get('lang');
    return { type: 'resume', lang: isSupportedLanguage(lang) ? lang : 'en' };
  }
  const rule = REDIRECTS.find((r) => r.path === pathname);
  if (rule) return { type: 'redirect', rule };
  return { type: 'notFound' };
};

/**
 * Canonical URL for a language choice: the explicit choice mirrors into the
 * `?lang=` query (en and zh alike) so the URL states which language it is
 * serving. Bare URLs (no query) keep resolving through the init priority
 * chain (URL > saved preference > browser language > English) — nothing
 * rewrites them on first visit. `hash` is a bare fragment (no '#'), e.g.
 * 'skills' -> '/?lang=zh#skills'. Shared by LanguageMenu and the resume
 * page's language toggle via history.replaceState.
 */
export const langQueryUrl = (pathname: string, lang: ResumeLang, hash = ''): string => {
  const suffix = hash ? `#${hash}` : '';
  return `${pathname}?lang=${lang}${suffix}`;
};

/**
 * Canonical URL for a resume language. Thin wrapper over langQueryUrl so the
 * "explicit choice mirrors ?lang=<code>" convention lives in one place.
 */
export const resumeLangUrl = (lang: ResumeLang): string => langQueryUrl('/resume', lang);
