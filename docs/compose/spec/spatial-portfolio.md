---
feature: spatial-portfolio
status: in-progress
updated: 2026-09-29
branch: feat/spatial-portfolio
commits:
---

# Spatial Portfolio

## Report

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

- [ ] T1: Strengthen shared depth and motion foundations — acceptance: consistent surfaces, correct bounded tilt, live input/reduced-motion gating, and cleanup regression tests pass. (covers: S2)
- [ ] T2: Recompose hero and six-section content — acceptance: layered hero and featured project render with all original content and working actions; skills, education, academic, and contact have responsive differentiated layouts. (covers: S2; depends: T1)
- [ ] T3: Integrate navigation and route compatibility — acceptance: active states, progress, theme/language controls, hash navigation, and mobile drawer work; resume and auxiliary routes retain their contracts. (covers: S2; depends: T1)
- [ ] T4: Verify integrated experience and resolve independent review — acceptance: repository checks pass or baseline failures are explicitly evidenced; the browser matrix is inspected; no unresolved critical review findings remain. (covers: S2; depends: T2, T3)
