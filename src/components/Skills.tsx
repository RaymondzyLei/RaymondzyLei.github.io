import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getSkillsByCategory } from '../data/skills';
import { HomeCard } from './HomeCard';
import { SoftChip } from './SoftChip';
import { Section } from './Section';

export const Skills: React.FC = () => {
  const { t } = useTranslation();
  const categories = [
    { key: 'languages', label: t('skills.languages') },
    { key: 'tools', label: t('skills.tools') },
  ] as const;

  return (
    <Section id="skills" title={t('skills.title')}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}
      >
        {categories.map(({ key, label }) => (
          <HomeCard key={key}>
            <Typography component="h3" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {label}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getSkillsByCategory(key).map((skill) => (
                <SoftChip key={skill.id} label={skill.name} />
              ))}
            </Box>
          </HomeCard>
        ))}
      </Box>
    </Section>
  );
};
