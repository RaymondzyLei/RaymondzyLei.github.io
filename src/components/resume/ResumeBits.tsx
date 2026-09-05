import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RESUME as C } from '../../styles/colors';

/**
 * Presentational building blocks of the /resume page (ResumePage.tsx).
 * Pure data props; the print palette comes from colors.ts's RESUME namespace
 * (mode-independent by design). All user-facing text is resolved by the caller
 * (ResumePage's getFixedT('en')) and passed in as plain strings.
 */

// Print palette — values live in src/styles/colors.ts (RESUME namespace),
// the app-wide color single source; mode-independent by design.
const INK = C.ink;
const SUB = C.sub;
const LINE = C.line;
const CHIP_BG = C.chipBg;
const CHIP_INK = C.chipInk;

// Skill sub-group labels (fixed English; resume doesn't translate).
export const PROGRAMMING_LANGUAGES_LABEL = 'Programming Languages';
export const LANGUAGES_LABEL = 'Languages';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

export const EducationItem: React.FC<{
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

export const AwardItem: React.FC<{
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

export const SkillGroup: React.FC<{
  label: string;
  items: { text: string; strong?: boolean }[];
}> = ({ label, items }) => (
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
