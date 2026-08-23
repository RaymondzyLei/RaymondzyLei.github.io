// Achievement cards inside <Accordion> are intentionally NOT staggered via
// useReveal: AccordionDetails stays mounted (height 0 when collapsed) so the
// IntersectionObserver fires `inView: true` while the panel is hidden, and
// the cards are already `isVisible` by the time the user expands the panel.
// Staggering them on scroll would either re-fire on expansion (flash) or
// never fire at all. Section-level reveal on the outer Box is enough.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { CertDownloadButton } from './CertDownloadButton';
import { styled } from '@mui/material/styles';
import { achievementsData, type Achievement } from '../data/achievements';
import { useTilt } from '../hooks/useTilt';
import { glassHoverShadow } from '../theme';
import { GlassCard } from './GlassCard';
import { Section } from './Section';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  transition: theme.transitions.create(['boxShadow', 'backgroundColor'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:before': {
    backgroundColor: 'transparent',
  },
  '&:hover': {
    boxShadow: glassHoverShadow(theme),
  },
}));

const AchievementCardView: React.FC<{ achievement: Achievement; category: string }> = ({
  achievement,
  category,
}) => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  const prefix = `data.achievements.${achievement.id}`;
  const title = t(`${prefix}.title`);
  const description = t(`${prefix}.description`);
  const date = t(`${prefix}.date`);
  const details = t(`${prefix}.details`, '');
  const certLabel = t(`${prefix}.certLabel`, '');

  return (
    <GlassCard accent="top" ref={tiltRef}>
      <CardHeader
        title={title}
        subheader={date}
        slotProps={{
          title: { variant: 'h6', sx: { fontWeight: 600 } },
          subheader: { sx: { color: 'text.secondary' } },
        }}
      />
      <CardContent>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          {description}
        </Typography>
        {details && (
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {details}
          </Typography>
        )}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}
        >
          <Chip
            label={t(`data.achievements.category.${category}`)}
            size="small"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            }}
          />
          {achievement.file && (
            <CertDownloadButton
              file={achievement.file}
              label={certLabel || t('academic.download')}
            />
          )}
        </Box>
      </CardContent>
    </GlassCard>
  );
};

export const Academic: React.FC = () => {
  const { t } = useTranslation();

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Achievement[]>();
    for (const achievement of achievementsData) {
      const list = map.get(achievement.category);
      if (list) {
        list.push(achievement);
      } else {
        map.set(achievement.category, [achievement]);
      }
    }
    return Array.from(map.entries());
  }, []);

  return (
    <Section id="academic" title={t('academic.title')} maxWidth="md">
      <Stack spacing={2}>
        {groupedByCategory.map(([category, achievements]) => (
          <StyledAccordion key={category}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <EmojiEventsIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                {t(`data.achievements.category.${category}`)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {achievements.map((achievement) => (
                  <Box key={achievement.id}>
                    <AchievementCardView achievement={achievement} category={category} />
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </Stack>
    </Section>
  );
};
