/** Align a section's top edge with the bottom of the sticky navigation bar. */
export function sectionScrollTarget(element: HTMLElement): number {
  const appbar = document.querySelector('.MuiAppBar-root');
  const height = appbar?.getBoundingClientRect().height ?? 0;
  return Math.max(0, element.getBoundingClientRect().top + window.scrollY - height);
}
