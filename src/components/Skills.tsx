import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CodeIcon from '@mui/icons-material/Code';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
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
    <Box ref={revealRef} sx={{ minWidth: 0, ...revealSx(isVisible, index * 60) }}>
      <GlassCard accent="top" ref={tiltRef} sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
        <Box sx={{ color: 'primary.main', mb: 4 }} aria-hidden="true">
          {index === 0 ? (
            <CodeIcon sx={{ fontSize: 36 }} />
          ) : (
            <BuildOutlinedIcon sx={{ fontSize: 36 }} />
          )}
        </Box>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 3,
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
    <Section id="skills" title={t('skills.title')} maxWidth="lg">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}
      >
        {categories.map(({ key, label }, index) => (
          <SkillCategory key={key} label={label} skills={getSkillsByCategory(key)} index={index} />
        ))}
      </Box>
    </Section>
  );
};
