import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { CertDownloadButton } from './CertDownloadButton';
import { styled } from '@mui/material/styles';
import { achievementsData, type Achievement } from '../data/achievements';
import { SoftChip } from './SoftChip';
import { HomeCard } from './HomeCard';
import { Section } from './Section';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  boxShadow: theme.shadows[1],
  '&:before': { display: 'none' },
}));

const AchievementCardView: React.FC<{ achievement: Achievement; category: string }> = ({
  achievement,
  category,
}) => {
  const { t } = useTranslation();
  const prefix = `data.achievements.${achievement.id}`;
  const title = t(`${prefix}.title`);
  const description = t(`${prefix}.description`);
  const date = t(`${prefix}.date`);
  const details = t(`${prefix}.details`, '');
  const certLabel = t(`${prefix}.certLabel`, '');

  return (
    <HomeCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {date}
      </Typography>
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
          <CertDownloadButton file={achievement.file} label={certLabel || t('academic.download')} />
        )}
      </Box>
    </HomeCard>
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
    <Section id="academic" title={t('academic.title')}>
      <Stack spacing={2}>
        {groupedByCategory.map(([category, achievements]) => (
          <StyledAccordion key={category} defaultExpanded={category === 'Competition'}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              id={'academic-' + encodeURIComponent(category) + '-header'}
              aria-controls={'academic-' + encodeURIComponent(category) + '-content'}
              sx={{ px: 3, minHeight: 80 }}
            >
              <EmojiEventsIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                {t(`data.achievements.category.${category}`)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
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
