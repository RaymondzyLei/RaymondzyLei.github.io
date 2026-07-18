import { REDIRECTS, type RedirectRule } from './data/redirects';

export type Route =
  | { type: 'home' }
  | { type: 'resume' }
  | { type: 'redirect'; rule: RedirectRule }
  | { type: 'notFound' };

/**
 * Resolve a pathname to a route. Pure function (no DOM access) - callers pass
 * `window.location.pathname`. '/' -> home, '/resume' -> resume, a path listed
 * in REDIRECTS -> redirect, anything else -> 404. No popstate, no router lib.
 */
export const resolveRoute = (pathname: string): Route => {
  if (pathname === '/') return { type: 'home' };
  if (pathname === '/resume') return { type: 'resume' };
  const rule = REDIRECTS.find((r) => r.path === pathname);
  if (rule) return { type: 'redirect', rule };
  return { type: 'notFound' };
};
