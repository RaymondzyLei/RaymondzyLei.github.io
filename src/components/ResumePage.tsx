import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
// Avatar import hidden alongside the header avatar JSX (restore together).
// import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import GlobalStyles from '@mui/material/GlobalStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import i18n from '../i18n/i18n';
import { LANGUAGE_OPTIONS } from '../i18n/languages';
import { resumeLangUrl, type ResumeLang } from '../routing';
import { timelineData } from '../data/timeline';
import { achievementsData } from '../data/achievements';
import { skillsData, type Skill } from '../data/skills';
import { socialLinks, type SocialLink } from '../data/social';
import {
  // resumeAvatar, // hidden with the header avatar; restore together
  resumePhone,
  resumeContactIds,
  resumeSkillIds,
  resumeStrongSkillIds,
} from '../data/resume';
import { RESUME as C } from '../styles/colors';
import { SectionTitle, EducationItem, AwardItem, SkillGroup } from './resume/ResumeBits';

/**
 * Standalone resume preview page (/resume). Language comes from the `?lang=`
 * query (default English); an in-page toggle rewrites the query via
 * history.replaceState so the URL can be shared with the chosen language
 * baked in (like a printed résumé).
 *
 * Data-driven: education / awards / skills / social contacts are reused from
 * src/data (timelineData, achievementsData, skillsData, socialLinks) so this
 * page never drifts from the home page. Resume-only fields (full name,
 * location, phone, about, GPA, TOEFL, which skills to bold) live in
 * src/data/resume.ts + the i18n `resume.*` namespace.
 *
 * Language is fixed per render via i18n.getFixedT(lang) - the page ignores the
 * active language picker so each URL always renders one stable document.
 * Deliberately decoupled from <Layout>: no Navbar /
 * background orbs / back-to-top / Lenis reveal. Hardcoded light theme (white
 * paper, dark ink) - ignores useColorScheme. Print via browser (Ctrl+P) uses
 * the inline @media print rules below. resume.typ (Typst source) is kept in
 * sync manually for PDF export.
 *
 * Display sub-components (SectionTitle / EducationItem / AwardItem /
 * SkillGroup) live in ./resume/ResumeBits and take plain-string props.
 */

// Print palette — values live in src/styles/colors.ts (RESUME namespace),
// the app-wide color single source; mode-independent by design.
const INK = C.ink;
const LINE = C.line;
const PAPER = C.paper;

export const ResumePage: React.FC<{ lang?: ResumeLang }> = ({ lang: initialLang = 'en' }) => {
  // App resolves the URL once on mount; the in-page toggle takes over from
  // there (replaceState + local state, no reload).
  const [lang, setLang] = useState<ResumeLang>(initialLang);
  // Fixed language per render: read that language's resources regardless of
  // the active language picker.
  const t = i18n.getFixedT(lang);

  // Keep <html lang> on the resume language for screen readers (i18n init set
  // it to the picker language; navigation back is a full reload, so the
  // cleanup below is a belt-and-braces restore).
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = prev;
    };
  }, [lang]);

  const handleLangChange = (next: ResumeLang) => {
    if (next === lang) return;
    history.replaceState(null, '', resumeLangUrl(next));
    setLang(next);
  };

  const contactSocials = resumeContactIds
    .map((id) => socialLinks.find((s) => s.id === id))
    .filter((s): s is SocialLink => Boolean(s));

  const programmingItems = resumeSkillIds
    .map((id) => skillsData.find((s) => s.id === id))
    .filter((s): s is Skill => Boolean(s))
    .map((s) => ({ text: s.name, strong: resumeStrongSkillIds.some((id) => id === s.id) }));

  return (
    <>
      <GlobalStyles
        styles={`
          /* !important: must beat the anti-FOUC inline html[data-mui-color-scheme]
             background and the dark-mode CssBaseline body rule, so no dark
             bars peek above/below the paper in dark mode. */
          html, body { background: ${PAPER} !important; }
          @media print {
            @page { size: A4; margin: 1.5cm; }
            .no-print { display: none !important; }
            .resume-paper {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      />
      <Box
        className="no-print"
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: INK,
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            '&:hover': { color: C.sub },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
          {t('resume.backHome')}
        </Link>
      </Box>

      {/* Language toggle — mirrors back-home on the right; hidden in print.
          Labels reuse nav.* self-named entries (English / 中文). */}
      <Box
        className="no-print"
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'inline-flex',
          gap: 1.5,
        }}
        role="group"
        aria-label={t('layout.changeLanguage')}
      >
        {LANGUAGE_OPTIONS.map(({ code, labelKey }) => {
          const active = code === lang;
          return (
            <Link
              key={code}
              component="button"
              type="button"
              onClick={() => handleLangChange(code)}
              sx={{
                color: active ? INK : C.sub,
                fontWeight: active ? 700 : 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { color: INK },
              }}
            >
              {t(labelKey)}
            </Link>
          );
        })}
      </Box>

      <Box
        className="resume-paper"
        sx={{
          maxWidth: 768,
          mx: 'auto',
          my: { xs: 3, md: 6 },
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          bgcolor: PAPER,
          color: INK,
          boxShadow: C.paperShadow,
          borderRadius: 2,
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: INK, lineHeight: 1.1 }}>
              {t('resume.fullName')}
            </Typography>
            <Typography sx={{ color: C.sub, fontSize: '1.05rem', mt: 0.5 }}>
              {t('resume.tagline')}
            </Typography>
            <Typography sx={{ color: C.sub, fontSize: '0.85rem', mt: 0.25 }}>
              {t('resume.location')}
            </Typography>
          </Box>
          {/* TODO: avatar hidden for now; restore with a real photo. Keep in sync with
              resumeAvatar in src/data/resume.ts. */}
          {/* <Avatar
            src={resumeAvatar.src}
            srcSet={resumeAvatar.srcSet}
            alt={t('resume.avatarAlt')}
            variant="rounded"
            sx={{ width: 96, height: 96, flexShrink: 0 }}
          /> */}
        </Box>

        {/* Contact icons */}
        <Box className="no-print" sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
          {contactSocials.map((link) => {
            const Icon = link.icon;
            return (
              <IconButton
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </IconButton>
            );
          })}
          <IconButton
            href={`tel:${resumePhone}`}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
          >
            <PhoneIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* About */}
        <section>
          <SectionTitle>{t('resume.section.about')}</SectionTitle>
          <Typography sx={{ color: INK, fontSize: '0.9rem', lineHeight: 1.7 }}>
            {t('resume.about')}
          </Typography>
        </section>

        {/* Education */}
        <section>
          <SectionTitle>{t('resume.section.education')}</SectionTitle>
          {timelineData.map((item) => {
            const p = `data.timeline.${item.id}`;
            const bullets = t(`${p}.description`).split('\n').filter(Boolean);
            return (
              <EducationItem
                key={item.id}
                institution={t(`${p}.institution`)}
                location={t(`resume.timelineLocation.${item.id}`)}
                degree={t(`${p}.title`)}
                period={t(`${p}.date`)}
                bullets={bullets}
              />
            );
          })}
        </section>

        {/* Awards & Achievements */}
        <section>
          <SectionTitle>{t('resume.section.awards')}</SectionTitle>
          {achievementsData.map((achievement) => {
            const p = `data.achievements.${achievement.id}`;
            const title = t(`${p}.title`);
            if (!title) return null;
            return (
              <AwardItem
                key={achievement.id}
                title={title}
                level={t(`${p}.description`)}
                date={t(`${p}.date`)}
                details={t(`${p}.details`)}
              />
            );
          })}
        </section>

        {/* Academic Profile */}
        <section>
          <SectionTitle>{t('resume.section.academicProfile')}</SectionTitle>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            <Box component="li" sx={{ color: INK, fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t('resume.academicProfile')}
            </Box>
          </Box>
        </section>

        {/* Skills */}
        <section>
          <SectionTitle>{t('resume.section.skills')}</SectionTitle>
          <SkillGroup label={t('resume.skillLabels.programming')} items={programmingItems} />
          <SkillGroup
            label={t('resume.skillLabels.languages')}
            items={[{ text: t('resume.languages') }]}
          />
        </section>
      </Box>
    </>
  );
};
