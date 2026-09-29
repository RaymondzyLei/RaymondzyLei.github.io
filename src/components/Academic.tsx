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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { CertDownloadButton } from './CertDownloadButton';
import { styled } from '@mui/material/styles';
import { achievementsData, type Achievement } from '../data/achievements';
import { useTilt } from '../hooks/useTilt';
import { glassHoverShadow } from '../theme';
import { GlassCard } from './GlassCard';
import { SoftChip } from './SoftChip';
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
    <GlassCard
      accent="left"
      ref={tiltRef}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardHeader
        title={title}
        subheader={date}
        sx={{ px: 3, pt: 3, pb: 1 }}
        slotProps={{
          title: { variant: 'h6', component: 'h3', sx: { fontWeight: 600, lineHeight: 1.45 } },
          subheader: { sx: { color: 'text.secondary' } },
        }}
      />
      <CardContent sx={{ px: 3, pt: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          {description}
        </Typography>
        {details && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {details}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mt: 'auto',
            pt: 3,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <SoftChip label={t(`data.achievements.category.${category}`)} size="small" />
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
    <Section id="academic" title={t('academic.title')} maxWidth="lg">
      <Stack spacing={2}>
        {groupedByCategory.map(([category, achievements]) => (
          <StyledAccordion key={category} defaultExpanded={category === 'Competition'}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              id={'academic-' + encodeURIComponent(category) + '-header'}
              aria-controls={'academic-' + encodeURIComponent(category) + '-content'}
              sx={{ px: { xs: 1, md: 2 }, minHeight: 80 }}
            >
              <EmojiEventsIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                {t(`data.achievements.category.${category}`)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 0, md: 2 }, pb: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 3,
                }}
              >
                {achievements.map((achievement) => (
                  <Box key={achievement.id}>
                    <AchievementCardView achievement={achievement} category={category} />
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </Stack>
    </Section>
  );
};
