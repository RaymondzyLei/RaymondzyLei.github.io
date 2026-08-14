# Code Health Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix a Navbar IntersectionObserver perf bug, delete ~30 lines of dead code, add security depth (CSP / redirect protocol whitelist / rel / eslint rules), and make small DRY extractions — no large refactor.

**Architecture:** Five-phase, one commit per task. Extractions create the shared file and rewire consumers in the same task (no dead new files). New security logic gets a pure-function test (TDD); existing hooks/components are NOT retrofitted with tests this round (user-excluded).

**Tech Stack:** Vite 8 + React 19 + TS 6 (`strict`/`noUnusedLocals`/`noUnusedParameters`/`verbatimModuleSyntax`) + MUI v9 + i18next + Lenis. pnpm. Vitest (jsdom).

## Global Constraints

- Branch: `code-health-cleanup` (already created; spec committed at `74841bb`).
- Package manager: **pnpm only** (`pnpm-lock.yaml` is the sole lockfile; never `npm install`).
- Prettier: single-quote, semicolon, 2-space, `trailingComma: all`, `printWidth: 100`. Run `pnpm run format` if `format:check` fails.
- i18n: en.json + zh.json must stay symmetric. Every key touched is touched in BOTH files.
- Glass/reveal/tilt conventions (CLAUDE.md): never hand-write `backdrop-filter`; never put `useTilt` + `useReveal` on the same DOM element.
- Every task ends with the full verify suite (alias `V`):
  `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
- Out of scope (do NOT do): `resume.typ` edits, `Skill.proficiency` removal, phone-number removal, OG image change, retrofit tests for `useTilt`/`useReveal`/components.

---

## Task 1: Section registry + Navbar/App rewire (fixes observer bug)

The headline bug: `Navbar.tsx:107` passes `sections.map((s) => s.id)` (a fresh array each render) to `useActiveSection`, whose `useEffect` deps are `[sectionIds, offset]` (`useActiveSection.ts:60`) → observer teardown+recreate on every scroll-driven re-render. Fix: a module-level stable `SECTION_IDS`.

**Files:**
- Create: `src/sections.ts`
- Modify: `src/components/layout/Navbar.tsx` (remove local `Section` interface + `sections` array lines 24-27, 95-102; rewire lines 106-109 + 113-138)
- Modify: `src/App.tsx` (remove individual section imports 8-13; render via `SECTIONS`)

**Interfaces:**
- Produces: `SECTIONS: readonly SectionDef[]`, `SECTION_IDS: string[]` from `src/sections.ts`.

- [ ] **Step 1: Create `src/sections.ts`**

```ts
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
```

- [ ] **Step 2: Rewire `Navbar.tsx`**

Edit 1 — add import (after the `glass` import on line 16):
```ts
import { glass } from '../../theme';
import { SECTIONS, SECTION_IDS } from '../../sections';
```

Edit 2 — delete the local `Section` interface (lines 24-27):
```ts
interface Section {
  id: string;
  label: string;
}
```
(gone)

Edit 3 — delete the `sections` array (lines 95-102):
```ts
  const sections: Section[] = [
    { id: 'hero', label: t('nav.about') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'qualifications', label: t('nav.qualifications') },
    { id: 'academic', label: t('nav.academic') },
    { id: 'portfolio', label: t('nav.portfolio') },
    { id: 'contact', label: t('nav.contact') },
  ];
```
(gone)

Edit 4 — replace the `activeSection` call (lines 106-109):
```ts
  const activeSection = useActiveSection(
    sections.map((s) => s.id),
    64,
  );
```
→
```ts
  // Stable SECTION_IDS (module-level) — see src/sections.ts. Without this the
  // observer effect recreated on every render (scroll -> setActive -> re-render
  // -> new array -> teardown+reobserve loop).
  const activeSection = useActiveSection(SECTION_IDS, 64);
```

Edit 5 — in `navContent`, replace `sections.map` with `SECTIONS.map` and `section.label` with `t(section.labelKey)` (lines 113-138):
```ts
      {sections.map((section) => {
        const isActive = !isNotFound && activeSection === section.id;
        return (
          <StyledNavButton
            key={section.id}
            {...(isNotFound
              ? { component: 'a', href: '/' }
              : { onClick: () => handleNavClick(section.id) })}
            sx={{
              color: isActive ? 'primary.main' : 'text.primary',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: isActive ? 600 : 500,
              ...(isActive && {
                '&::before': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
              }),
            }}
          >
            {section.label}
          </StyledNavButton>
        );
      })}
```
→
```ts
      {SECTIONS.map((section) => {
        const isActive = !isNotFound && activeSection === section.id;
        return (
          <StyledNavButton
            key={section.id}
            {...(isNotFound
              ? { component: 'a', href: '/' }
              : { onClick: () => handleNavClick(section.id) })}
            sx={{
              color: isActive ? 'primary.main' : 'text.primary',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: isActive ? 600 : 500,
              ...(isActive && {
                '&::before': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
              }),
            }}
          >
            {t(section.labelKey)}
          </StyledNavButton>
        );
      })}
```

- [ ] **Step 3: Rewire `App.tsx`**

Edit 1 — replace the 6 individual section imports (lines 8-13):
```ts
import { Hero } from './components/Hero';
import { Skills } from './components/Skills';
import { Qualifications } from './components/Qualifications';
import { Academic } from './components/Academic';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
```
→
```ts
import { SECTIONS } from './sections';
```

Edit 2 — replace the home-branch JSX (lines 72-79):
```tsx
                  <>
                    <Hero />
                    <Skills />
                    <Qualifications />
                    <Academic />
                    <Portfolio />
                    <Contact />
                  </>
```
→
```tsx
                  <>
                    {SECTIONS.map(({ id, Component }) => (
                      <Component key={id} />
                    ))}
                  </>
```

- [ ] **Step 4: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: all pass. If `format:check` fails, run `pnpm run format` then re-run.

- [ ] **Step 5: Commit**

```bash
git add src/sections.ts src/components/layout/Navbar.tsx src/App.tsx
git commit -m "refactor(nav): single SECTIONS registry + fix observer rebuild loop

Navbar passed sections.map(s=>s.id) (fresh array each render) to
useActiveSection, whose effect deps [sectionIds, offset] caused the
IntersectionObserver to teardown+recreate on every scroll-driven
re-render. Module-level SECTION_IDS (src/sections.ts) stabilizes it.
Navbar + App now read from one SECTIONS registry (single source of
truth) so nav items and rendered sections can't drift."
```

---

## Task 2: Extract shared `CertDownloadButton`

`Qualifications.tsx:24-46` and `Academic.tsx:88-105` are the same button.

**Files:**
- Create: `src/components/CertDownloadButton.tsx`
- Modify: `src/components/Qualifications.tsx` (remove local `CertDownloadButton` lines 24-46 + `DownloadIcon`/`Button` imports if now unused; import shared)
- Modify: `src/components/Academic.tsx` (replace inline Button lines 88-106 with shared component; prune `DownloadIcon`/`Button` imports if unused)

**Interfaces:**
- Produces: `CertDownloadButton` (props `{ file: { path: string }; label: string }`) from `src/components/CertDownloadButton.tsx`.

- [ ] **Step 1: Create `src/components/CertDownloadButton.tsx`**

```tsx
import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

/**
 * Shared outlined "download certificate" button for Qualifications (timeline)
 * and Academic (achievements). Same styling/logic so the two sections can't
 * diverge.
 */
export interface CertDownloadButtonProps {
  file: { path: string };
  label: string;
}

export const CertDownloadButton: React.FC<CertDownloadButtonProps> = ({ file, label }) => (
  <Button
    size="small"
    startIcon={<DownloadIcon />}
    href={file.path}
    download={file.path.split('/').pop() || true}
    variant="outlined"
    sx={{
      borderColor: 'primary.main',
      color: 'primary.main',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      },
    }}
  >
    {label}
  </Button>
);
```

- [ ] **Step 2: Rewire `Qualifications.tsx`**

Edit 1 — replace import lines 12-14 (`SchoolIcon`/`DownloadIcon`/`Button`):
```ts
import SchoolIcon from '@mui/icons-material/School';
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
```
→
```ts
import SchoolIcon from '@mui/icons-material/School';
import { CertDownloadButton } from './CertDownloadButton';
```

Edit 2 — delete the local `CertDownloadButton` definition (lines 24-46, the whole `const CertDownloadButton: React.FC<...> = ({ file, label }) => ( ... );` block).

The two usages (`<CertDownloadButton file={item.file} label={...} />` at lines 76-79 and 118-121) stay unchanged — they now resolve to the imported shared component.

- [ ] **Step 3: Rewire `Academic.tsx`**

Edit 1 — replace import lines 20-22 (`DownloadIcon`/`Button`):
```ts
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
```
→
```ts
import { CertDownloadButton } from './CertDownloadButton';
```
(Keep `ExpandMoreIcon`/`EmojiEventsIcon` lines 19/20 — they're still used.)

Edit 2 — replace the inline Button (lines 88-106) inside `AchievementCardView`:
```tsx
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              href={achievement.file.path}
              download={achievement.file.path.split('/').pop() || true}
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              {certLabel || t('academic.download')}
            </Button>
```
→
```tsx
            <CertDownloadButton file={achievement.file} label={certLabel || t('academic.download')} />
```

- [ ] **Step 4: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass. Watch for `noUnusedLocals` on pruned imports.

- [ ] **Step 5: Commit**

```bash
git add src/components/CertDownloadButton.tsx src/components/Qualifications.tsx src/components/Academic.tsx
git commit -m "refactor: extract shared CertDownloadButton (Qualifications + Academic)"
```

---

## Task 3: Extract shared `<Section>` shell

The 5 homepage sections (Skills/Qualifications/Academic/Portfolio/Contact) repeat `<Box id ref=sectionRef component=section sx={{py:8, ...revealSx(visible)}}><Container><SectionHeading/></Container></Box>`. Extract it. NotFound/RedirectPage keep their own full-height shells.

**Files:**
- Create: `src/components/Section.tsx`
- Modify: `src/components/Skills.tsx`, `src/components/Qualifications.tsx`, `src/components/Academic.tsx`, `src/components/Portfolio.tsx`, `src/components/Contact.tsx`

**Interfaces:**
- Produces: `Section` (props `{ id: string; title: string; maxWidth?: 'md'|'lg'|'sm'; revealDelay?: number; children }`) from `src/components/Section.tsx`.

- [ ] **Step 1: Create `src/components/Section.tsx`**

```tsx
import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { SectionHeading } from './SectionHeading';

export interface SectionProps {
  id: string;
  title: string;
  maxWidth?: 'md' | 'lg' | 'sm';
  /** Scroll-reveal delay in ms (default 0). */
  revealDelay?: number;
  children: React.ReactNode;
}

/**
 * Shared homepage section shell: scroll-reveal Box[component=section] +
 * Container + SectionHeading. DRYs the 5 homepage sections. NotFound /
 * RedirectPage keep their own full-height centered shells.
 */
export const Section: React.FC<SectionProps> = ({
  id,
  title,
  maxWidth = 'md',
  revealDelay = 0,
  children,
}) => {
  const { ref, isVisible } = useReveal();
  return (
    <Box
      id={id}
      ref={ref}
      component="section"
      sx={{ py: 8, ...revealSx(isVisible, revealDelay) }}
    >
      <Container maxWidth={maxWidth}>
        <SectionHeading title={title} />
        {children}
      </Container>
    </Box>
  );
};
```

- [ ] **Step 2: Rewire `Skills.tsx`**

Edit 1 — drop now-unused imports `Container`, `SectionHeading` (lines 3, 14) and the section-level `useReveal` call. Keep `useReveal` import (used by `SkillCategory` line 40) and `Box` (used in `SkillCategory`).

Replace import line 3 `import Container from '@mui/material/Container';` → remove.
Replace import line 14 `import { SectionHeading } from './SectionHeading';` → `import { Section } from './Section';`.

Edit 2 — in `Skills` body, remove the section-level reveal call (line 77):
```ts
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();
```
(gone)

Edit 3 — replace the section shell (lines 86-96 + closing 109):
```tsx
    <Box
      id="skills"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible),
      }}
    >
      <Container maxWidth="md">
        <SectionHeading title={t('skills.title')} />
```
→
```tsx
    <Section id="skills" title={t('skills.title')} maxWidth="md">
```
And the closing tags (lines 108-109) `</Container></Box>` → `</Section>`.

- [ ] **Step 3: Rewire `Qualifications.tsx`**

Edit 1 — drop `Container` (line 3) and `SectionHeading` (line 22) imports. Add `import { Section } from './Section';`. Keep `Box`, `useReveal` (cards), `revealSx` (cards).

Edit 2 — remove section-level reveal call (line 133) `const { ref: sectionRef, isVisible: sectionVisible } = useReveal();` (gone). Keep `useTheme`/`useMediaQuery` (used for `isMobile`).

Edit 3 — replace shell (lines 136-146) + closing (171-172):
```tsx
    <Box
      id="qualifications"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible),
      }}
    >
      <Container maxWidth="md">
        <SectionHeading title={t('qualifications.title')} />
```
→
```tsx
    <Section id="qualifications" title={t('qualifications.title')} maxWidth="md">
```
Closing `</Container></Box>` → `</Section>`.

- [ ] **Step 4: Rewire `Academic.tsx`**

Edit 1 — drop `Container` (line 9), `SectionHeading` (line 29), `useReveal` (line 26), `revealSx` (line 27) imports (Academic cards are intentionally NOT reveal-staggered; the section-level reveal was the only use). Add `import { Section } from './Section';`.

Edit 2 — remove section-level reveal call (line 115) `const { ref: sectionRef, isVisible: sectionVisible } = useReveal();` (gone).

Edit 3 — replace shell (lines 133-143) + closing (166-167):
```tsx
    <Box
      id="academic"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible),
      }}
    >
      <Container maxWidth="md">
        <SectionHeading title={t('academic.title')} />
```
→
```tsx
    <Section id="academic" title={t('academic.title')} maxWidth="md">
```
Closing `</Container></Box>` → `</Section>`.

- [ ] **Step 5: Rewire `Portfolio.tsx`**

Edit 1 — drop `Container` (line 3), `SectionHeading` (line 22) imports. Add `import { Section } from './Section';`. Keep `Box`, `useReveal` (ProjectCardCell), `revealSx` (ProjectCardCell).

Edit 2 — remove section-level reveal call (line 174) `const { ref: sectionRef, isVisible: sectionVisible } = useReveal();` (gone).

Edit 3 — replace shell (lines 177-187) + closing (202-203):
```tsx
    <Box
      id="portfolio"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible),
      }}
    >
      <Container maxWidth="lg">
        <SectionHeading title={t('portfolio.title')} />
```
→
```tsx
    <Section id="portfolio" title={t('portfolio.title')} maxWidth="lg">
```
Closing `</Container></Box>` → `</Section>`.

- [ ] **Step 6: Rewire `Contact.tsx`**

Edit 1 — drop `Container` (line 3), `SectionHeading` (line 16) imports. Add `import { Section } from './Section';`. Keep `useReveal` (cells), `revealSx` (cells), `Box`.

Edit 2 — remove section-level reveal call (line 23) `const { ref: sectionRef, isVisible: sectionVisible } = useReveal();` (gone). Keep `connectTiltRef`/`linksTiltRef` + the two cell `useReveal` calls.

Edit 3 — replace shell (lines 28-38) + closing (195-196):
```tsx
    <Box
      id="contact"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        ...revealSx(sectionVisible, 0),
      }}
    >
      <Container maxWidth="md">
        <SectionHeading title={t('contact.title')} />
```
→
```tsx
    <Section id="contact" title={t('contact.title')} maxWidth="md" revealDelay={0}>
```
Closing `</Container></Box>` → `</Section>`.

- [ ] **Step 7: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass. Watch `noUnusedLocals` for leftover `Container`/`SectionHeading`/`revealSx`/`useReveal` imports per the per-section pruning above.

- [ ] **Step 8: Commit**

```bash
git add src/components/Section.tsx src/components/Skills.tsx src/components/Qualifications.tsx src/components/Academic.tsx src/components/Portfolio.tsx src/components/Contact.tsx
git commit -m "refactor: extract shared <Section> shell (5 homepage sections)"
```

---

## Task 4: `focusVisibleRing` helper in theme.ts

5 MUI component overrides repeat `'&:focus-visible': { outline, outlineOffset }`.

**Files:**
- Modify: `src/theme.ts` (add helper; refactor 5 overrides)

- [ ] **Step 1: Add helper after `glass()` (after line 20)**

```ts
/**
 * Focus-visible ring (ui-ux-pro-max `focus-states`). Uses the palette CSS
 * variable so the ring follows light/dark primary. Spread into a component's
 * `styleOverrides.root`.
 */
export const focusVisibleRing = (offset = 2): Record<string, CSSProperties> => ({
  '&:focus-visible': {
    outline: '2px solid var(--mui-palette-primary-main)',
    outlineOffset: offset,
  },
});
```

- [ ] **Step 2: Refactor the 5 overrides**

MuiButton root (lines 126-129) — replace:
```ts
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: 2,
          },
```
→
```ts
          ...focusVisibleRing(2),
```

MuiIconButton root (lines 138-141):
```ts
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: 2,
          },
```
→ `...focusVisibleRing(2),`

MuiMenuItem root (lines 148-151) — note offset is `-2`:
```ts
          '&:focus-visible': {
            outline: '2px solid var(--mui-palette-primary-main)',
            outlineOffset: -2,
          },
```
→ `...focusVisibleRing(-2),`

MuiChip root (lines 158-161):
→ `...focusVisibleRing(2),`

MuiAccordionSummary root (lines 168-171):
→ `...focusVisibleRing(2),`

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass. `theme.test.ts` "exposes focus-visible ring" still passes — `root['&:focus-visible']` resolves through the spread.

- [ ] **Step 4: Commit**

```bash
git add src/theme.ts
git commit -m "refactor(theme): focusVisibleRing helper (5 component overrides)"
```

---

## Task 5: `ctaButtonSx` for NotFound/RedirectPage CTAs

NotFound + RedirectPage×2 repeat `{ textTransform:'none', px:4, py:1.2, fontSize:'1rem', fontWeight:600 }`. Hero's `StyledButton` (py:1.5) stays separate.

**Files:**
- Modify: `src/theme.ts` (add `ctaButtonSx`)
- Modify: `src/components/NotFound.tsx`, `src/components/RedirectPage.tsx`

**Interfaces:**
- Produces: `ctaButtonSx: SxProps` from `src/theme.ts`.

- [ ] **Step 1: Add `ctaButtonSx` to `src/theme.ts`** (after `focusVisibleRing`)

```ts
import type { SxProps } from '@mui/material/styles';
```
(add to the existing `@mui/material/styles` import on line 2: `import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';` → add `type SxProps`)

```ts
/** Shared CTA button sx (NotFound + RedirectPage). Hero keeps its own. */
export const ctaButtonSx: SxProps = {
  textTransform: 'none',
  px: 4,
  py: 1.2,
  fontSize: '1rem',
  fontWeight: 600,
};
```

- [ ] **Step 2: Rewire `NotFound.tsx`**

Add import (after line 10 `import { GlassCard } from './GlassCard';`):
```ts
import { ctaButtonSx } from '../theme';
```
Replace the Button sx (lines 72-78):
```tsx
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 600,
            }}
```
→ `sx={ctaButtonSx}`

- [ ] **Step 3: Rewire `RedirectPage.tsx`**

Add import (after line 13 `import { GlassCard } from './GlassCard';`):
```ts
import { ctaButtonSx } from '../theme';
```
Replace BOTH Button sx blocks (lines 112-118 and 126-132) with `sx={ctaButtonSx}`.

- [ ] **Step 4: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/theme.ts src/components/NotFound.tsx src/components/RedirectPage.tsx
git commit -m "refactor: ctaButtonSx for NotFound/RedirectPage CTAs"
```

---

## Task 6: Single-source language list (LanguageMenu)

`Navbar.tsx`-adjacent `LanguageMenu.tsx:8-11` `LANGUAGES` duplicates `i18n.ts:6` `SUPPORTED_LANGUAGES`. Export one source from `i18n.ts`.

**Files:**
- Modify: `src/i18n/i18n.ts` (export `LANGUAGE_OPTIONS`)
- Modify: `src/components/layout/LanguageMenu.tsx` (drop local `LANGUAGES`, import)

- [ ] **Step 1: Export `LANGUAGE_OPTIONS` from `src/i18n/i18n.ts`**

After line 6 (`const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;`) add:
```ts
/**
 * Single source of truth for the language picker. code derives the type;
 * labelKey is the i18n key for the menu item label. Add a language here only
 * (plus en.json/zh.json translations).
 */
export const LANGUAGE_OPTIONS = [
  { code: 'en', labelKey: 'nav.langEn' },
  { code: 'zh', labelKey: 'nav.langZh' },
] as const;
```

- [ ] **Step 2: Rewire `LanguageMenu.tsx`**

Edit 1 — replace the local `LANGUAGES` const (lines 8-11):
```ts
const LANGUAGES = [
  { code: 'en', labelKey: 'nav.langEn' as const },
  { code: 'zh', labelKey: 'nav.langZh' as const },
] as const;
```
→ remove. Add import at top (after line 6 `import LanguageIcon from '@mui/icons-material/Language';`):
```ts
import { LANGUAGE_OPTIONS } from '../../i18n/i18n';
```

Edit 2 — replace `LANGUAGES.map` (line 38) with `LANGUAGE_OPTIONS.map`.

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/i18n.ts src/components/layout/LanguageMenu.tsx
git commit -m "refactor(i18n): single LANGUAGE_OPTIONS source for LanguageMenu"
```

---

## Task 7: Delete 6 groups of dead i18n keys (en + zh)

Delete symmetrically in `src/i18n/en.json` and `src/i18n/zh.json`:
1. `_TODO_about_title`, `_TODO_about_description` (lines 28-29)
2. `contact.name`, `contact.email`, `contact.message`, `contact.send`, `_TODO_nameError`, `_TODO_emailError`, `_TODO_messageError` (lines 56-62)
3. `data.achievements.empty` object (lines 108-113)
4. `skills.frameworks` (line 33)
5. `data.redirects.google.label`, `data.redirects.the-book-of-answers.label` (lines 172-175) — but keep the `data.redirects` object if it still holds anything; if these are its only keys, remove the whole `redirects` object.

**Files:**
- Modify: `src/i18n/en.json`, `src/i18n/zh.json`

- [ ] **Step 1: Edit `en.json`**

- Delete lines 28-29 (`_TODO_about_title`, `_TODO_about_description`).
- In `contact` (lines 50-63), delete keys `name`, `email`, `message`, `send`, `_TODO_nameError`, `_TODO_emailError`, `_TODO_messageError`. Keep `title`, `connectTitle`, `connectDesc`, `linksTitle`, `linksDesc`.
- Delete `data.achievements.empty` object (lines 108-113).
- Delete `skills.frameworks` (line 33).
- Delete `data.redirects.google.label` and `data.redirects.the-book-of-answers.label`. Since those are the only keys under `data.redirects`, delete the whole `redirects` object (lines 172-175).

- [ ] **Step 2: Apply the identical deletions to `zh.json`** (same line ranges; keys mirror en).

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass. Build's i18n import is static JSON; missing keys surface only at runtime — verify by `pnpm run build` (no compile-time key check, but JSON parse errors would surface).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.json src/i18n/zh.json
git commit -m "chore(i18n): remove 6 groups of dead keys (about/contact-form/achievements.empty/skills.frameworks/redirects.label)"
```

---

## Task 8: Delete `src/data/types.ts` (`BaseLink`)

`BaseLink` is never imported; `social.ts`/`contact.ts` define their own (narrower) interfaces.

**Files:**
- Delete: `src/data/types.ts`

- [ ] **Step 1: Confirm zero imports**

Run: `rg "from '\.\./data/types'|from '\.\./\.\./data/types'|data/types'" src` (via `rg`/ripgrep)
Expected: no hits. If any hit, STOP — fix the importer first.

- [ ] **Step 2: Delete the file**

```bash
git rm src/data/types.ts
```

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove unused BaseLink (src/data/types.ts)"
```

---

## Task 9: `redirects.ts` — drop `label` field + stale TODO

`RedirectRule.label` is never read (Task 7 already removed its i18n). Also the `TODO: 在此填写...` comment is stale (rules already exist).

**Files:**
- Modify: `src/data/redirects.ts`

- [ ] **Step 1: Edit `redirects.ts`**

Replace the whole file content:
```ts
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
```

- [ ] **Step 2: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/data/redirects.ts
git commit -m "chore(redirects): drop unused label field + stale TODO"
```

---

## Task 10: Delete dead theme tokens + update theme.test.ts

`duration.hover`, `duration.standard`, `easing.easeInOut` are unused (only `theme.test.ts` references them). Keep `duration.press` + `easing.easeOut` (used by MuiButton/Contact/BackToTop).

**Files:**
- Modify: `src/theme.ts` (lines 33-45)
- Modify: `src/theme.test.ts` (lines 27-39)

- [ ] **Step 1: Edit `src/theme.ts` easing block (lines 33-38)**

```ts
export const easing = {
  /** Strong ease-out for entering elements & feedback (dropdowns, hovers). */
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** Strong ease-in-out for on-screen movement. */
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
} as const;
```
→
```ts
export const easing = {
  /** Strong ease-out for entering elements & feedback (dropdowns, hovers). */
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const;
```

- [ ] **Step 2: Edit `src/theme.ts` duration block (lines 40-45)**

```ts
export const duration = {
  press: 160, // button :active feedback
  hover: 200, // chip / icon hover
  standard: 300, // card elevation, color shifts
} as const;
```
→
```ts
export const duration = {
  press: 160, // button :active feedback
} as const;
```

- [ ] **Step 3: Edit `src/theme.test.ts` (lines 27-39)**

```ts
describe('easing & duration tokens', () => {
  it('exposes custom cubic-bezier easings (not built-in weak ones)', () => {
    expect(easing.easeOut).toMatch(/^cubic-bezier\(/);
    expect(easing.easeOut).not.toBe('ease-out');
    expect(easing.easeInOut).toMatch(/^cubic-bezier\(/);
  });

  it('keeps UI durations under 300ms (emil rule)', () => {
    expect(duration.press).toBeLessThan(300);
    expect(duration.hover).toBeLessThan(300);
    expect(duration.standard).toBeLessThanOrEqual(300);
  });
});
```
→
```ts
describe('easing & duration tokens', () => {
  it('exposes custom cubic-bezier easeOut (not built-in weak ease-out)', () => {
    expect(easing.easeOut).toMatch(/^cubic-bezier\(/);
    expect(easing.easeOut).not.toBe('ease-out');
  });

  it('keeps UI press duration under 300ms (emil rule)', () => {
    expect(duration.press).toBeLessThan(300);
  });
});
```

- [ ] **Step 4: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/theme.ts src/theme.test.ts
git commit -m "chore(theme): drop unused duration.hover/standard + easing.easeInOut tokens"
```

---

## Task 11: Remove unused devDep `@testing-library/user-event`

Zero `@testing-library/user-event` imports across `src`.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (auto)

- [ ] **Step 1: Confirm zero imports**

Run: `rg "@testing-library/user-event" src`
Expected: no hits.

- [ ] **Step 2: Remove the dep**

Run: `pnpm remove @testing-library/user-event`
Expected: `package.json` + `pnpm-lock.yaml` updated.

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: remove unused @testing-library/user-event devDep"
```

---

## Task 12: Clean commented dead code

`skills.ts` framework comment rows + Figma comment, `Skills.tsx:81` commented `frameworks` line, `theme.ts` duplicate secondary TODO.

**Files:**
- Modify: `src/data/skills.ts` (lines 19-22, 28), `src/components/Skills.tsx` (line 81), `src/theme.ts` (lines 64, 83)

- [ ] **Step 1: `skills.ts`** — delete the commented framework rows (lines 19-22) and the commented Figma row (line 28):
```ts
  // Frameworks
  // TODO: list frameworks/libraries
  // { id: '12', name: 'React', category: 'frameworks', proficiency: 90 },
  // { id: '13', name: 'Vue.js', category: 'frameworks', proficiency: 75 },
  // { id: '14', name: 'Node.js', category: 'frameworks', proficiency: 85 },
  // { id: '15', name: 'Material-UI', category: 'frameworks', proficiency: 88 },
```
→ remove the whole block. And:
```ts
  //{ id: '12', name: 'Figma', category: 'tools', proficiency: 75 },
```
→ remove.

- [ ] **Step 2: `Skills.tsx`** — delete the commented frameworks line (line 81):
```ts
    //{ key: 'frameworks', label: t('skills.frameworks') },
```
(gone)

- [ ] **Step 3: `theme.ts`** — the `// TODO: secondary palette currently mirrors primary; pick a real accent when needed` comment appears twice (lines 64, 83). Keep one (the light palette block, line 64) and remove the dark duplicate (line 83).

- [ ] **Step 4: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/skills.ts src/components/Skills.tsx src/theme.ts
git commit -m "chore: remove commented-out dead code (skills frameworks, dup secondary TODO)"
```

---

## Task 13 (TDD): Redirect `targetUrl` protocol whitelist

NEW pure logic → TDD. Guard the auto-redirect + "Go Now" against a future `javascript:`/`data:` entry.

**Files:**
- Modify: `src/data/redirects.ts` (add `isHttpUrl`)
- Create: `src/data/redirects.test.ts`
- Modify: `src/components/RedirectPage.tsx` (guard effect + button)

**Interfaces:**
- Produces: `isHttpUrl(url: string): boolean` from `src/data/redirects.ts`.

- [ ] **Step 1: Write the failing test `src/data/redirects.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { isHttpUrl } from './redirects';

describe('isHttpUrl', () => {
  it('accepts http and https absolute URLs', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('http://example.com/path')).toBe(true);
  });

  it('rejects dangerous schemes', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>')).toBe(false);
    expect(isHttpUrl('vbscript:foo')).toBe(false);
  });

  it('rejects relative/invalid URLs', () => {
    expect(isHttpUrl('/relative')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
    expect(isHttpUrl('not-a-url')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run test:run -- redirects`
Expected: FAIL — `isHttpUrl is not a function` / import error.

- [ ] **Step 3: Implement `isHttpUrl` in `src/data/redirects.ts`**

Add (after `REDIRECTS`):
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run test:run -- redirects`
Expected: PASS (3 tests).

- [ ] **Step 5: Guard `RedirectPage.tsx`**

Add import (after line 14 `import type { RedirectRule } from '../data/redirects';`):
```ts
import { isHttpUrl } from '../data/redirects';
```

Edit the effect (lines 29-38) — skip auto-redirect if unsafe:
```ts
  useEffect(() => {
    if (seconds <= 0) {
      window.location.href = rule.targetUrl;
      return;
    }
    const id = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, rule.targetUrl]);
```
→
```ts
  useEffect(() => {
    if (seconds <= 0) {
      // Defense-in-depth: never navigate to a non-http(s) target.
      if (isHttpUrl(rule.targetUrl)) {
        window.location.href = rule.targetUrl;
      }
      return;
    }
    const id = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, rule.targetUrl]);
```

Edit the "Go Now" button (line 110) — only link if safe:
```tsx
            <Button
              variant="contained"
              href={rule.targetUrl}
              size="large"
              sx={ctaButtonSx}
            >
```
→
```tsx
            <Button
              variant="contained"
              {...(isHttpUrl(rule.targetUrl) ? { href: rule.targetUrl } : { disabled: true })}
              size="large"
              sx={ctaButtonSx}
            >
```

- [ ] **Step 6: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/data/redirects.ts src/data/redirects.test.ts src/components/RedirectPage.tsx
git commit -m "security: isHttpUrl whitelist guards redirect target (TDD)"
```

---

## Task 14: Content-Security-Policy meta in index.html

Static SPA; MUI Emotion injects runtime `<style>` → `style-src 'unsafe-inline'`.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add CSP meta** (after the `theme-color` metas, before `<title>` on line 10)

```html
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'"
    />
```

- [ ] **Step 2: Run `V` + manual note**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass (build doesn't enforce CSP). NOTE: verify visually after deploy — if MUI/a font breaks, the `style-src 'unsafe-inline'` is required (already included); `img-src https:` covers the OG/avatar.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "security: add Content-Security-Policy meta (MUI needs style-src unsafe-inline)"
```

---

## Task 15: Contact external links `target`/`rel`

`Contact.tsx:138-153` renders `contactLinks` as `<Box component="a" href={link.url}>` with no `target`/`rel`. External links (`http*`) should open in a new tab safely; `url: '#'` placeholders stay same-tab.

**Files:**
- Modify: `src/components/Contact.tsx` (lines 138-141)

- [ ] **Step 1: Edit the `<Box component="a">`**

```tsx
                    <Box
                      key={link.id}
                      component="a"
                      href={link.url}
                      sx={{
```
→
```tsx
                    <Box
                      key={link.id}
                      component="a"
                      href={link.url}
                      {...(link.url.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      sx={{
```

- [ ] **Step 2: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "security: Contact external links open in new tab with rel=noopener noreferrer"
```

---

## Task 16: eslint — ban `scrollIntoView` / `window.scrollTo`

CLAUDE.md forbids both; eslint currently only bans the global `scrollTo`.

**Files:**
- Modify: `eslint.config.js` (rules block, lines 25-35)

- [ ] **Step 1: Add `no-restricted-syntax`**

Replace the rules block (lines 24-35):
```js
  {
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'scrollTo',
          message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
        },
      ],
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },
```
→
```js
  {
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'scrollTo',
          message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='scrollIntoView']",
          message: 'Use lenis?.scrollTo(element) instead of element.scrollIntoView (see CLAUDE.md)',
        },
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='scrollTo']",
          message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
        },
      ],
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },
```

- [ ] **Step 2: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass. If lint fails on an existing `scrollIntoView`/`window.scrollTo` call, fix that call to `lenis?.scrollTo(...)`.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "chore(eslint): ban scrollIntoView + window.scrollTo (enforce CLAUDE.md nav rule)"
```

---

## Task 17: `Academic.tsx` reduce → Map (drop `as Record`)

`Academic.tsx:127` `{} as Record<string, Achievement[]>` is an avoidable assertion.

**Files:**
- Modify: `src/components/Academic.tsx` (lines 117-130, 146)

- [ ] **Step 1: Replace the `useMemo` + iteration**

Replace lines 117-130:
```ts
  const groupedByCategory = useMemo(
    () =>
      achievementsData.reduce(
        (acc, achievement) => {
          if (!acc[achievement.category]) {
            acc[achievement.category] = [];
          }
          acc[achievement.category].push(achievement);
          return acc;
        },
        {} as Record<string, Achievement[]>,
      ),
    [],
  );
```
→
```ts
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Achievement[]>();
    for (const achievement of achievementsData) {
      const list = map.get(achievement.category);
      if (list) {
        list.push(achievement);
      } else {
        map.set(achievement.category, [achievement]);
      }
    }
    return Array.from(map.entries());
  }, []);
```

Replace the iteration (line 146):
```tsx
          {Object.entries(groupedByCategory).map(([category, achievements]) => (
```
→
```tsx
          {groupedByCategory.map(([category, achievements]) => (
```

- [ ] **Step 2: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass. Map preserves insertion order, so accordion order is unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/components/Academic.tsx
git commit -m "refactor(academic): group by Map (drop 'as Record' assertion)"
```

---

## Task 18: `Portfolio.tsx` sweep → `alpha(primary.main, 0.05)`

`StyledProjectCard` `::before` hardcodes `rgba(124, 58, 237, 0.05)` (light primary rgb), so the sweep is the wrong hue in dark mode.

**Files:**
- Modify: `src/components/Portfolio.tsx` (lines 2, 41)

- [ ] **Step 1: Add `alpha` import** (line 2 `import { styled } from '@mui/material/styles';`)
```ts
import { styled, alpha } from '@mui/material/styles';
```

- [ ] **Step 2: Replace the sweep color** (line 41)
```ts
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
```
→
```ts
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
```

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/Portfolio.tsx
git commit -m "fix(portfolio): sweep tint follows theme primary via alpha()"
```

---

## Task 19: `Contact.tsx` transition → `theme.transitions.create`

`Contact.tsx:149` hardcodes `0.2s`.

**Files:**
- Modify: `src/components/Contact.tsx` (lines 17, 138-153)

- [ ] **Step 1: Add theme import** (line 17 `import { easing } from '../theme';`)
```ts
import { easing, default as theme } from '../theme';
```

- [ ] **Step 2: Replace the transition** (line 149)
```ts
                        transition: `background-color 0.2s ${easing.easeOut}`,
```
→
```ts
                        transition: theme.transitions.create(['background-color'], {
                          duration: theme.transitions.duration.shorter,
                          easing: easing.easeOut,
                        }),
```

- [ ] **Step 3: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "refactor(contact): use theme.transitions.create for hover"
```

---

## Task 20: CLAUDE.md doc drift fixes

Spec Phase 4. CLAUDE.md lags `resume` route, `useActiveSection`, `SectionHeading`, the new shared files, `useActiveSection.test.ts`, nav-highlight convention; uses stale component names; references deleted `BaseLink`.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: App.tsx desc** — `resolveRoute() 分发 home/redirect/404` → `resolveRoute() 分发 home/resume/redirect/404`.

- [ ] **Step 2: routing.ts desc** — `'/'→home、REDIRECTS 命中→redirect、其余→notFound` → `'/'→home、'/resume'→resume、REDIRECTS 命中→redirect、其余→notFound`.

- [ ] **Step 3: hooks list** — add `useActiveSection.ts` to the `hooks/` tree (after `useHashScroll.ts`):
```
│   ├── useActiveSection.ts  # IntersectionObserver 驱动的 nav active-section 高亮（sectionIds 稳定引用,避免 observer 重建）
```

- [ ] **Step 4: components list** — add new shared components + `SectionHeading.tsx`. In the `components/` tree, after `GlassCard.tsx` add:
```
│   ├── SectionHeading.tsx     # 共享区块标题（variant h3/h2 + mb/居中）
│   ├── Section.tsx            # 共享区块外壳（scroll-reveal Box + Container + SectionHeading，5 个 section 复用）
│   ├── CertDownloadButton.tsx # 共享证书下载按钮（Qualifications + Academic 复用）
```

- [ ] **Step 5: data tree** — remove the `types.ts` line:
```
│   ├── types.ts        # 共享 `BaseLink` 接口（social/contact 复用）
```
(gone). Add `sections.ts` note at top-level `src/` tree (after `routing.ts`):
```
├── sections.ts        # 首页区块注册表（SECTIONS single source + SECTION_IDS 稳定引用供 useActiveSection）
```

- [ ] **Step 6: test list** — add `redirects.test.ts` + `useActiveSection.test.ts` to the existing test list.

- [ ] **Step 7: nav active-section convention** — in 动效约定, add a paragraph:
```
- **Nav active-section 高亮**（`useActiveSection`）：IntersectionObserver 监听 6 个 section，视口内占比最高者高亮。`SECTION_IDS` 必须是模块级稳定引用（`src/sections.ts`），否则 effect 每次渲染 teardown+recreate observer。404/redirect 页 nav 退化为普通链接。
```

- [ ] **Step 8: stale component names** — `SkillPaper` → `SkillCategory`，`ContactPaper` → `Contact`（在动效约定"挂 useTilt ref 的卡片"清单里）。

- [ ] **Step 9: Run `V`**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: pass (CLAUDE.md isn't typechecked, but format:check covers it).

- [ ] **Step 10: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude.md): fix drift — resume route, useActiveSection, Section/SectionHeading/CertDownloadButton, tests, nav-highlight convention, rename SkillPaper/ContactPaper, drop BaseLink"
```

---

## Self-Review (run before handing off)

**1. Spec coverage:**
- A (Navbar observer bug) → Task 1. ✓
- B dead code: `BaseLink` → Task 8; 6 dead i18n groups → Task 7; `RedirectRule.label` → Task 9; `Skill.proficiency` → OUT OF SCOPE (kept); dead theme tokens → Task 10; `@testing-library/user-event` → Task 11; frameworks/Skills:81/theme dup TODO → Task 12. ✓
- C extractions: `CertDownloadButton` → Task 2; `focus-visible` helper → Task 4; `<Section>` → Task 3; CTA `ctaButtonSx` → Task 5; `LANGUAGES` single source → Task 6. ✓
- D security: CSP → Task 14; protocol whitelist → Task 13; Contact rel → Task 15; OG image → OUT OF SCOPE (avatar.jpg kept, correct). eslint `scrollIntoView`/`window.scrollTo` → Task 16. ✓
- E friction/small: `sections.ts` registry → Task 1; `SocialRow`/`ContactLinkRow` extraction → **DROPPED** (the two `.map` blocks differ enough — social uses `LiquidGlassButton`, contact uses a plain `<a>` — that extracting a shared row adds props/branches without real DRY win; the inline forms are already short. Documented as a deliberate YAGNI cut). `Academic as Record` → Task 17; `Portfolio alpha` → Task 18; `Contact transitions` → Task 19. ✓
- CLAUDE.md drift → Task 20. ✓

**2. Placeholder scan:** no "TBD"/"implement later"; every code step shows actual code. The `SocialRow` extraction was dropped with a stated reason (not left as a vague TODO). ✓

**3. Type consistency:** `SECTION_IDS: string[]` matches `useActiveSection(sectionIds: string[], ...)` (no readonly mismatch). `isHttpUrl(url: string): boolean` matches the test + both `RedirectPage` call sites. `Section` props `{ id, title, maxWidth?, revealDelay?, children }` match all 5 section rewrites (Contact passes `revealDelay={0}`, others omit). `focusVisibleRing(offset=2): Record<string, CSSProperties>` spreads into `styleOverrides.root` (CSSObject) — valid. `ctaButtonSx: SxProps` assigned to `sx` prop — valid. ✓

**Note on spec deviation — `sections.ts` location:** spec said `src/data/sections.ts`; plan uses `src/sections.ts` (top-level, next to `routing.ts`) because `data/` holds plain data and this file holds React `Component` refs — an orchestration concern, not data. Documented here for visibility.
