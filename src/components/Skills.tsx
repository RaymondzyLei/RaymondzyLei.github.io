import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { getSkillsByCategory, type Skill } from '../data/skills';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { glass } from '../theme';

const SkillPaper = styled(Paper)(({ theme }) => ({
  ...glass(theme),
  padding: theme.spacing(3),
  transition: theme.transitions.create(['boxShadow', 'borderLeft'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: theme.shadows[4],
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
    <Box
      ref={revealRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        transition:
          'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${index * 100}ms`,
        willChange: 'opacity, transform',
      }}
    >
      <SkillPaper ref={tiltRef}>
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
      </SkillPaper>
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
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        transition:
          'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            mb: 6,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text.primary',
          }}
        >
          {t('skills.title')}
        </Typography>

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
