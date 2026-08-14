import type { ComponentType } from 'react';
import { Hero } from './components/Hero';
import { Skills } from './components/Skills';
import { Qualifications } from './components/Qualifications';
import { Academic } from './components/Academic';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';

export interface SectionDef {
  id: string;
  /** i18n key for the nav label (hero reuses nav.about). */
  labelKey: string;
  Component: ComponentType;
}

/**
 * Single source of truth for the homepage sections. Navbar (nav items +
 * active-section tracking) and App (rendering) both read from here so the two
 * never drift — adding/removing a section is one edit, not two. Order = nav
 * order = render order.
 */
export const SECTIONS: readonly SectionDef[] = [
  { id: 'hero', labelKey: 'nav.about', Component: Hero },
  { id: 'skills', labelKey: 'nav.skills', Component: Skills },
  { id: 'qualifications', labelKey: 'nav.qualifications', Component: Qualifications },
  { id: 'academic', labelKey: 'nav.academic', Component: Academic },
  { id: 'portfolio', labelKey: 'nav.portfolio', Component: Portfolio },
  { id: 'contact', labelKey: 'nav.contact', Component: Contact },
];

// Module-level stable array so useActiveSection's IntersectionObserver effect
// (deps [sectionIds, offset]) does not teardown+recreate on every Navbar
// re-render. Computed once; reference never changes.
export const SECTION_IDS: string[] = SECTIONS.map((s) => s.id);
