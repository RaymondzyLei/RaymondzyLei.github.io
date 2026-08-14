export interface RedirectRule {
  /** 子路径，如 '/old-blog'（必须以 / 开头） */
  path: string;
  /** 跳转目标完整 URL */
  targetUrl: string;
}

/** Short-link redirects. Add rules here as needed. */
export const REDIRECTS: RedirectRule[] = [
  { path: '/google', targetUrl: 'https://www.google.com' },
  { path: '/the-book-of-answers', targetUrl: 'https://answers.raymondzylei.me' },
];

/**
 * Defense-in-depth: only allow http(s) targets for `window.location`/`href`
 * assignment. REDIRECTS are static https today, but a future bad entry
 * (`javascript:`/`data:`) must not be able to navigate to DOM XSS.
 */
export const isHttpUrl = (url: string): boolean => {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};
