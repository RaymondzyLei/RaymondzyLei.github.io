import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { getSkillsByCategory } from '../data/skills';

const SkillPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  transition: theme.transitions.create(['transform', 'boxShadow', 'borderLeft'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    transform: 'translateX(8px)',
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

export const Skills: React.FC = () => {
  const { t } = useTranslation();

  const categories = [
    { key: 'languages', label: t('skills.languages') },
    //{ key: 'frameworks', label: t('skills.frameworks') },
    { key: 'tools', label: t('skills.tools') },
  ] as const;

  return (
    <Box
      id="skills"
      component="section"
      sx={{
        py: 8,
        backgroundColor: 'action.hover',
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
          {categories.map(({ key, label }) => {
            const categorySkills = getSkillsByCategory(key as any);
            return (
              <SkillPaper key={key}>
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
                  {categorySkills.map((skill) => (
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
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};
