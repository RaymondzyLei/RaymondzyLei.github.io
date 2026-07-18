/**
 * Resolve a URL hash to a DOM element, or null if it doesn't target a real
 * section. Strips a single leading `#`; empty hash -> null; unknown id -> null
 * (the "invalid hash is silently ignored" rule).
 */
export const getHashTarget = (hash: string): HTMLElement | null => {
  const id = hash.replace(/^#/, '');
  return id ? document.getElementById(id) : null;
};