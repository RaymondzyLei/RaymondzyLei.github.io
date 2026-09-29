---
feature: spatial-portfolio
status: delivered
updated: 2026-09-29
branch: feat/spatial-portfolio
commits:
  - a742bf9ef2c3a0067f54bef170811ad5474383d6
  - 82c1d3c38a0b4aed8e340d3ce0ebdb434504a5d5
---

# Spatial Portfolio

## Report

### Accepted delivery — 2026-09-29

- User accepted the final preview and explicitly requested service shutdown, merge, and push. The port 4173 preview has been stopped; feature commits are ready for fast-forward integration into `main`. No worktree or branch removal is requested.
- Implementation range: `7c30f8bd6a93229af103d6f4b28f8034fa01f99a..82c1d3c38a0b4aed8e340d3ce0ebdb434504a5d5`, excluding the final documentation-only commit. This captures the reviewed working-tree implementation and the accepted Hero/navigation refinement.
- Latest validation: 28 test files / 134 tests; typecheck, lint, formatting, production build, browser acceptance, and focused independent follow-up review passed. No unresolved review findings remain.
- Main-checkout local changes (`CLAUDE.md` deletion, untracked `AGENTS.md` and `introduction.md`) are excluded from feature commits and must remain intact during integration.

### Requested refinement — 2026-09-29

- User follow-up supersedes the original Hero projects CTA and active-ring styling: the primary action now says `See my resume` / `查看我的简历` and links to `/resume?lang=<current language>`. Contact action is unchanged.
- A small glass down-arrow breathes through opacity at the page top, disappears once scrolled, and reappears on return. Clicking uses `useScrollToSection` for Skills. It sits bottom-center on desktop and bottom-right on mobile to avoid the portrait; reduced motion disables the pulse. It is home-only and hidden from print.
- Navbar active items retain their bottom highlight but no longer have a persistent outline/shadow ring; keyboard focus indicators remain.
- Follow-up validation: 28 test files / 134 tests passed; typecheck, lint, format, and production build passed. English/Chinese resume navigation, top/scroll/return cue behavior, breathing opacity, reduced motion, underline-only nav, and 390/320px layout were checked in the independent browser. Screenshots `hero-update-desktop.png`, `hero-update-scrolled.png`, and `hero-update-mobile-final.png` were viewed. The user-facing preview ran on port 4173 for acceptance and was stopped on the subsequent merge/push request.

### Verification — 2026-09-29

- Baseline: `7c30f8bd6a93229af103d6f4b28f8034fa01f99a`. At the initial verification gate the feature HEAD was `a742bf9ef2c3a0067f54bef170811ad5474383d6`, with the remaining implementation in the worktree and seven new source/test files. No merge, push, deployment, or worktree removal occurred before explicit user acceptance.
- Final repository checks: `pnpm run test:run` passed (27 files / 131 tests); `typecheck`, `lint`, `format:check`, `build` (1029 modules), and `git diff --check` passed. Active-section and reduced-motion reveal regressions were observed failing before their fixes.
- Browser environment: one exclusively controlled, independent Playwright browser; local feature server on port 4173. Baseline checkout served on 4174 only for the final resume comparison. No personal browser profile, external submissions, or dependency changes. Both servers and the testing page were stopped before code review.
- Homepage layout matrix: English/Chinese × light/dark × 1440×900, 390×844, 320×844. All six sections inspected in section and full-page screenshots; incomplete off-screen reveal captures supplemented by real scrolling. Additional navbar width checks at 900, 1024, and 1200px passed. Final 320px horizontal-wheel check returned `scrollX: 0`; document scrollWidth equalled clientWidth.
- Verified interaction paths: desktop navigation, mobile drawer, both Hero actions, initial and runtime hash navigation, language query/hash preservation and localStorage, theme switching, academic category expansion, mobile page-end back-to-top, section-active highlighting, and reading progress. Project/contact/certificate hrefs and project image aspect ratio were inspected; external destinations and mail handlers were not opened. Existing two `#` contact placeholders were retained.
- Motion: actual pointer input produced ±3° tilt, exit returned to rest; runtime reduced-motion cleared tilt, stopped both background transforms and CSS animations, removed the mouse orb, and made all sections opacity 1 with 0s transitions. Restoring motion re-enabled tilt. Coarse-pointer emulation disabled tilt and the mouse orb. Unit tests cover angle bounds, scheduling, listener cleanup, and idle mouse-orb frames.
- Auxiliary routes: 404 return action passed; `/google` displayed its three-second countdown and navigated to an intercepted external document (no request to the external destination). Resume English/Chinese screen and print CSS were inspected. A screenshot right-edge concern reproduces on baseline: all 100 resume elements in each language have identical text, rectangles, font, color, and display between baseline and feature. No resume source/data changes; actual PDF pagination was not tested or changed.
- Responsive acceptance fixes: compact mobile navbar and tablet drawer; visible-pixel section selection instead of stale relative intersection ratios; <=359px headings stack the number above the title; mobile back-to-top sits after content rather than covering text/actions; reduced-motion reveal styles remove transitions; mobile portrait reserves rotation space; hidden skip-link uses literal 1px dimensions with padding only when focused. Section vertical padding remains 64px.
- Evidence is local and ignored under `output/playwright/`: `zcode-matrix-{en,zh}-{light,dark}-1440-*`, `zcode-final-{en,zh}-{light,dark}-{390,320}-*`, and focused `zcode-fixed-*` / `zcode-verified-*` captures. The original timed-out `zcode-matrix-en-dark-*` set is invalid (light theme) and superseded by `zcode-final-en-dark-1440-*`. Focused education/footer captures supersede incomplete off-screen reveal content; fixed menu captures wait for the drawer animation. Latest `zcode-final-light-overflow.png` supersedes earlier subpixel-scrollbar screenshots; after reserving the portrait rotation margin the horizontal-wheel check returned exactly `scrollX: 0`. Keyboard skip-link focus and runtime hash evidence are `zcode-skip-focused.png` and `zcode-runtime-hash.png`. Screen/print comparison evidence: `zcode-print-comparison-{4174,4173}.png`.
- Independent review: separate standards and spec/correctness reviewers inspected baseline `7c30f8b` through the complete integrated worktree, including all seven new source/test files (not only committed HEAD). Both identified invalid whitespace-containing Academic Award ARIA references and stale reading progress after content resizing. Both were reproduced with failing tests, fixed, and independently rereviewed; no unresolved correctness, standards, consistency, or critical spec findings remain. The final browser regression confirmed the named Academic Award region and progress changing from 0.647609 to 0.620933 at unchanged scroll position, matching current geometry. `zcode-review-before.png` and `zcode-review-fixed.png` are the viewed evidence.
- The initial delivery was the verified local worktree on `feat/spatial-portfolio`; the subsequent user-authorized implementation commit and closing action are recorded above. The original main checkout remains unchanged (`CLAUDE.md` deleted; `AGENTS.md` and `introduction.md` untracked). No package/lockfile or resume/data modifications. Repository checks were rerun after review fixes; the final type-only test-option correction also passed typecheck, lint, formatting, and production build. Test previews and browsers are stopped.

## [S1] Problem

The portfolio already provides glass materials, tilt, reveal, and smooth scrolling, but repeated card layouts and a small single-project tile underuse those foundations. Visitors need a stronger first impression and clearer visual hierarchy without sacrificing reading, navigation, or mobile performance.

## [S2] Design

### Scope and visual direction

- Redesign all six homepage sections and shared navigation as a spatial portfolio. Retain the existing violet light theme, teal dark theme, glass language, font families, and real content. Do not introduce WebGL or a new animation dependency.
- Hero: spacious responsive split composition with clear introductory typography, a layered portrait presentation using the existing avatar, and visually distinct content planes. Keep the contact action and social links; add a clearly labeled action to the projects section through the shared scroll helper. Decorative layers never obscure text or capture input.
- Skills: replace the repeated vertical stack with a balanced desktop composition and single-column mobile cards. Use category hierarchy and real skill labels rather than fabricated proficiency scores.
- Qualifications: retain chronological order, dates, and all education details while refining timeline hierarchy and card depth. Desktop and mobile must expose the same content.
- Academic: retain accessible expandable categories and certificate actions; improve category and achievement hierarchy without introducing nested reveal delays inside collapsed content.
- Portfolio: present the existing single project as a full-width featured composition with a prominent existing screenshot and adjacent description/actions on desktop, stacked on mobile. Continue supporting multiple projects from the data source without blank grid columns. Preserve image aspect ratio and both external actions.
- Contact: distinguish primary contact/social actions from supplementary links with responsive asymmetric composition and consistent surfaces. Preserve existing destinations; do not invent missing external URLs.
- Shared section headings use consistent numbering, typographic hierarchy, and spacing to connect the six sections. Keep section IDs and order stable. Do not change the 64px section vertical padding without validating scroll-snap title clearance.
- Navigation receives clearer active-state feedback and a non-interactive reading-progress indicator. Preserve sticky positioning, language/theme controls, mobile drawer, hash behavior, and dynamically measured scroll offsets. The progress indicator must not cause layout shifts or per-frame React renders.
- 404 and redirect pages inherit the refined shared surfaces; retain return navigation and redirect countdown behavior.

### Interaction and motion contracts

- Build depth through surface weight, shadow, layout overlap in decorative regions, and restrained motion; keep tilt within the existing maximum of 5 degrees. Reveal and tilt remain on separate DOM nodes.
- Refine the shared tilt implementation for correct pointer-axis mapping, bounded angles, stable pointer measurement, smooth retargeting, and cleanup. Fine-pointer hover is required; touch/coarse input does not tilt. Pointer exit returns to rest. Runtime reduced-motion changes cancel animation and clear transforms.
- Retain Lenis and proximity snap with current gating. All section actions use useScrollToSection; no scrollIntoView or competing native scroll animation. Test navigation targets after layout changes.
- Fix background animation gating so runtime reduced-motion changes stop both JavaScript drift and CSS animation. Mouse-follow motion stops scheduling frames once settled and resumes on input; animation resources are cleaned up on unmount. Preserve existing color tokens and bounded background placement.
- With reduced motion enabled, content is immediately readable, decorative parallax/tilt/drift stop, and interactions remain functional. No content requires hover to reveal essential information.
- Preserve keyboard focus indicators and semantic buttons/links. Decorative elements are hidden from accessibility APIs and do not intercept pointer events.

### Architecture and compatibility

- Keep React, MUI styled/sx, existing data modules, section registry, routing, and translation architecture. Introduce only small shared presentation helpers where multiple sections need the same behavior.
- All color values remain in styles/colors.ts; shared material definitions live in theme/glass.ts and motion values in theme tokens where appropriate. Do not enable MUI cssVariables or change the root font-size.
- New user-facing text is provided in both en.json and zh.json. Preserve URL language mirroring, localStorage preference handling, hash links, and route resolution.
- ResumePage and its print layout are unchanged except if a narrowly necessary compatibility fix is identified and documented. Shared changes must not leak decorative motion into printed resumes.
- Preserve original checkout changes: deleted CLAUDE.md, untracked AGENTS.md, and introduction.md. Work only in the linked worktree, following the supplied AGENTS.md rules; the worktree is based on origin/main at 7c30f8b.

### Verification boundaries

- Add focused regression tests for changed motion behavior, runtime media-query changes, cleanup, project rendering, and new navigation actions. For cheaply reproducible behavior changes, demonstrate a failing test before implementation.
- Run pnpm run test:run, pnpm run typecheck, pnpm run lint, pnpm run format:check, and pnpm run build after integration. Identify baseline failures separately.
- Use the user-authorized independent Playwright browser against local preview: desktop 1440x900 and mobile 390x844, English/Chinese and light/dark states; inspect every section and confirm no horizontal overflow. Check an additional 320px mobile width for clipping.
- Verify theme/language changes, mobile menu, section navigation and hash entry, project and contact destinations, academic expansion, and reduced-motion behavior including runtime preference changes. Capture screenshots and inspect actual renders; report limitations rather than treating screenshots alone as motion proof.
- Check /resume in both languages with print emulation, unknown routes, and redirect behavior using intercepted external navigation when needed. No external deployment or live messages.
- After all verification exits, obtain an independent review covering spec compliance, correctness, and local conventions. Fix critical findings before finalizing delivery.

## [S3] Out of Scope

- WebGL scenes, video backgrounds, fabricated personal facts, replacement branding, new backend services, new public routes, and dependency upgrades.
- Redesigning or regenerating the resume, changing certificate assets, editing Typst sources, or changing existing contact information.
- Automatic push, PR creation, merge, deployment, or worktree removal. The user chooses the closing action after delivery.

## Tasks

- [x] T1: Strengthen shared depth and motion foundations — acceptance: consistent surfaces, correct bounded tilt, live input/reduced-motion gating, and cleanup regression tests pass. (covers: S2)
- [x] T2: Recompose hero and six-section content — acceptance: layered hero and featured project render with all original content and working actions; skills, education, academic, and contact have responsive differentiated layouts. (covers: S2; depends: T1)
- [x] T3: Integrate navigation and route compatibility — acceptance: active states, progress, theme/language controls, hash navigation, and mobile drawer work; resume and auxiliary routes retain their contracts. (covers: S2; depends: T1)
- [x] T4: Verify integrated experience and resolve independent review — acceptance: repository checks pass or baseline failures are explicitly evidenced; the browser matrix is inspected; no unresolved critical review findings remain. (covers: S2; depends: T2, T3)
