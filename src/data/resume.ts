/**
 * Resume-specific metadata. Education / awards / skills / social contacts are
 * reused from timelineData / achievementsData / skillsData / socialLinks so the
 * resume never drifts from the home page. This file only holds resume-only
 * fields the home page doesn't have. Resume is fixed English (see ResumePage's
 * getFixedT('en')); user-facing text lives under the i18n `resume.*` namespace.
 */

// Header avatar - mirrors Hero's assets (NOT the stale /avatar.jpg).
export const resumeAvatar = {
  src: '/avatar.webp',
  srcSet: '/avatar.webp 1x, /avatar-2x.webp 2x',
} as const;

// Phone - socialLinks has no phone entry, so it lives here.
export const resumePhone = '+8615918530509';

// Which socialLinks ids to surface as contact icons on the resume
// (home shows all 4; resume keeps it to school email + github).
export const resumeContactIds = ['email-school', 'github'] as const;

// Programming Languages section: which skillsData ids to show, in order.
// Names come from skillsData (single source of truth); this only selects.
// IDs: 1=C++, 2=Rust, 3=Python, 4=JS/TS, 5=HTML/CSS
export const resumeSkillIds = ['1', '3', '2', '4'] as const; // C++, Python, Rust, JS/TS
export const resumeStrongSkillIds = ['1', '3'] as const; // C++, Python bold
