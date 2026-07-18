import { REDIRECTS, type RedirectRule } from './data/redirects';

export type Route =
  { type: 'home' } | { type: 'redirect'; rule: RedirectRule } | { type: 'notFound' };

/**
 * Resolve a pathname to a route. Pure function (no DOM access) - callers pass
 * `window.location.pathname`. Mirrors the previous inline logic in App.tsx:
 * '/' -> home, a path listed in REDIRECTS -> redirect, anything else -> 404.
 * No popstate listening, no router library.
 */
export const resolveRoute = (pathname: string): Route => {
  if (pathname === '/') return { type: 'home' };
  const rule = REDIRECTS.find((r) => r.path === pathname);
  if (rule) return { type: 'redirect', rule };
  return { type: 'notFound' };
};
