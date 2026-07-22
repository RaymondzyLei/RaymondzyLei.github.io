import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { getSkillsByCategory, type Skill } from '../data/skills';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import { SectionHeading } from './SectionHeading';

const SkillChip = styled(Chip)(({ theme }) => ({
  // M1: specify exact properties instead of `all` (review-animations trigger).
  transition: theme.transitions.create(['transform', 'boxShadow', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  // H3: respect reduced-motion -- keep hover amplitude, drop the transform.
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:hover': {
      transform: 'none',
    },
  },
}));

const SkillCategory: React.FC<{ label: string; skills: Skill[]; index: number }> = ({
  label,
  skills,
  index,
}) => {
  const tiltRef = useTilt();
  const { ref: revealRef, isVisible } = useReveal();
  return (
    <Box ref={revealRef} sx={revealSx(isVisible, index * 60)}>
      <GlassCard accent="left" ref={tiltRef} sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          {label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill) => (
            <SkillChip
              key={skill.id}
              label={skill.name}
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            />
          ))}
        </Box>
      </GlassCard>
    </Box>
  );
};

export const Skills: React.FC = () => {
  const { t } = useTranslation();
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();

  const categories = [
    { key: 'languages', label: t('skills.languages') },
    //{ key: 'frameworks', label: t('skills.frameworks') },
    { key: 'tools', label: t('skills.tools') },
  ] as const;

  return (
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

        <Stack spacing={4}>
          {categories.map(({ key, label }, index) => (
            <SkillCategory
              key={key}
              label={label}
              skills={getSkillsByCategory(key)}
              index={index}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  );
};
