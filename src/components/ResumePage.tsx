import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import GlobalStyles from '@mui/material/GlobalStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import i18n from '../i18n/i18n';
import { timelineData } from '../data/timeline';
import { achievementsData } from '../data/achievements';
import { skillsData, type Skill } from '../data/skills';
import { socialLinks, type SocialLink } from '../data/social';
import {
  resumeAvatar,
  resumePhone,
  resumeContactIds,
  resumeSkillIds,
  resumeStrongSkillIds,
} from '../data/resume';
import { RESUME as C } from '../styles/colors';

/**
 * Standalone resume preview page (/resume).
 *
 * Data-driven: education / awards / skills / social contacts are reused from
 * src/data (timelineData, achievementsData, skillsData, socialLinks) so this
 * page never drifts from the home page. Resume-only fields (full name,
 * location, phone, about, GPA, TOEFL, which skills to bold) live in
 * src/data/resume.ts + the i18n `resume.*` namespace.
 *
 * Fixed English via i18n.getFixedT('en') - the page ignores the active language
 * so it always reads like a printed English résumé. Deliberately decoupled from
 * <Layout>: no Navbar / background orbs / back-to-top / Lenis reveal. Hardcoded
 * light theme (white paper, dark ink) - ignores useColorScheme. Print via
 * browser (Ctrl+P) uses the inline @media print rules below. resume.typ (Typst
 * source) is kept in sync manually for PDF export.
 */

// Print palette — values live in src/styles/colors.ts (RESUME namespace),
// the app-wide color single source; mode-independent by design.
const INK = C.ink;
const SUB = C.sub;
const LINE = C.line;
const PAPER = C.paper;
const CHIP_BG = C.chipBg;
const CHIP_INK = C.chipInk;

// Skill sub-group labels (fixed English; resume doesn't translate).
const PROGRAMMING_LANGUAGES_LABEL = 'Programming Languages';
const LANGUAGES_LABEL = 'Languages';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontSize: '0.8rem',
      fontWeight: 700,
      color: SUB,
      borderBottom: `1px solid ${LINE}`,
      pb: 0.5,
      mb: 2,
      mt: 5,
    }}
  >
    {children}
  </Typography>
);

const EducationItem: React.FC<{
  institution: string;
  location: string;
  degree: string;
  period: string;
  bullets: string[];
}> = ({ institution, location, degree, period, bullets }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Box>
        <Typography component="span" sx={{ fontWeight: 700, color: INK, fontSize: '1rem' }}>
          {institution}
        </Typography>
        <Typography component="span" sx={{ color: SUB, fontSize: '0.85rem', ml: 1 }}>
          {location}
        </Typography>
      </Box>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
        {period}
      </Typography>
    </Box>
    <Typography sx={{ color: INK, fontSize: '0.9rem', mt: 0.25 }}>{degree}</Typography>
    <Box component="ul" sx={{ m: 0, pl: 3, mt: 0.5 }}>
      {bullets.map((b) => (
        <Box
          component="li"
          key={b}
          sx={{ color: SUB, fontSize: '0.85rem', lineHeight: 1.6, mt: 0.25 }}
        >
          {b}
        </Box>
      ))}
    </Box>
  </Box>
);

const AwardItem: React.FC<{
  title: string;
  level: string;
  date: string;
  details: string;
}> = ({ title, level, date, details }) => (
  <Box sx={{ borderLeft: `2px solid ${LINE}`, pl: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.95rem' }}>{title}</Typography>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{date}</Typography>
    </Box>
    <Typography sx={{ color: SUB, fontSize: '0.85rem', mt: 0.25 }}>{level}</Typography>
    {details && (
      <Typography sx={{ color: SUB, fontSize: '0.8rem', mt: 0.25 }}>{details}</Typography>
    )}
  </Box>
);

const SkillGroup: React.FC<{ label: string; items: { text: string; strong?: boolean }[] }> = ({
  label,
  items,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.85rem', mb: 0.75 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {items.map((item) => (
        <Typography
          key={item.text}
          component="span"
          sx={{
            fontSize: '0.8rem',
            fontWeight: item.strong ? 700 : 400,
            bgcolor: item.strong ? CHIP_BG : 'transparent',
            color: item.strong ? CHIP_INK : INK,
            border: `1px solid ${item.strong ? CHIP_BG : LINE}`,
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
          }}
        >
          {item.text}
        </Typography>
      ))}
    </Box>
  </Box>
);

export const ResumePage: React.FC = () => {
  // Fixed English: read en resources regardless of the active language.
  const t = i18n.getFixedT('en');

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
            '&:hover': { color: SUB },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
          {t('resume.backHome')}
        </Link>
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
            <Typography sx={{ color: SUB, fontSize: '1.05rem', mt: 0.5 }}>
              {t('resume.tagline')}
            </Typography>
            <Typography sx={{ color: SUB, fontSize: '0.85rem', mt: 0.25 }}>
              {t('resume.location')}
            </Typography>
          </Box>
          <Avatar
            src={resumeAvatar.src}
            srcSet={resumeAvatar.srcSet}
            alt={t('resume.avatarAlt')}
            variant="rounded"
            sx={{ width: 96, height: 96, flexShrink: 0 }}
          />
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
          <SkillGroup label={PROGRAMMING_LANGUAGES_LABEL} items={programmingItems} />
          <SkillGroup label={LANGUAGES_LABEL} items={[{ text: t('resume.languages') }]} />
        </section>
      </Box>
    </>
  );
};
