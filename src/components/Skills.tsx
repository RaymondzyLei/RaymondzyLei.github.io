import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { getSkillsByCategory, type Skill } from '../data/skills';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import { SoftChip } from './SoftChip';
import { Section } from './Section';

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
            <SoftChip key={skill.id} label={skill.name} />
          ))}
        </Box>
      </GlassCard>
    </Box>
  );
};

export const Skills: React.FC = () => {
  const { t } = useTranslation();

  const categories = [
    { key: 'languages', label: t('skills.languages') },
    { key: 'tools', label: t('skills.tools') },
  ] as const;

  return (
    <Section id="skills" title={t('skills.title')} maxWidth="md">
      <Stack spacing={4}>
        {categories.map(({ key, label }, index) => (
          <SkillCategory key={key} label={label} skills={getSkillsByCategory(key)} index={index} />
        ))}
      </Stack>
    </Section>
  );
};
