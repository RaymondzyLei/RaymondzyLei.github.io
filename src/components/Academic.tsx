// Achievement cards inside <Accordion> are intentionally NOT staggered via
// useReveal: AccordionDetails stays mounted (height 0 when collapsed) so the
// IntersectionObserver fires `inView: true` while the panel is hidden, and
// the cards are already `isVisible` by the time the user expands the panel.
// Staggering them on scroll would either re-fire on expansion (flash) or
// never fire at all. Section-level reveal on the outer Box is enough.
import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { achievementsData, type Achievement } from '../data/achievements';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { glass } from '../theme';

const AchievementCard = styled(Card)(({ theme }) => ({
  ...glass(theme),
  transition: theme.transitions.create(['boxShadow', 'borderTop'], {
    duration: theme.transitions.duration.standard,
  }),
  borderTop: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  transition: theme.transitions.create(['boxShadow', 'backgroundColor'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:before': {
    backgroundColor: 'transparent',
  },
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const AchievementCardView: React.FC<{ achievement: Achievement; category: string }> = ({
  achievement,
  category,
}) => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  return (
    <AchievementCard ref={tiltRef}>
      <CardHeader
        title={achievement.title}
        subheader={achievement.date}
        slotProps={{
          title: { variant: 'h6', sx: { fontWeight: 600 } },
          subheader: { sx: { color: 'text.secondary' } },
        }}
      />
      <CardContent>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          {achievement.description}
        </Typography>
        {achievement.details && (
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {achievement.details}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
          <Chip
            label={category}
            size="small"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            }}
          />
          {achievement.file && (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              href={achievement.file.path}
              download={achievement.file.path.split('/').pop() || true}
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              {achievement.file.label || t('academic.download')}
            </Button>
          )}
        </Box>
      </CardContent>
    </AchievementCard>
  );
};

export const Academic: React.FC = () => {
  const { t } = useTranslation();
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();

  const groupedByCategory = achievementsData.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );

  return (
    <Box
      id="academic"
      ref={sectionRef}
      component="section"
      sx={{
        py: 8,
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        transition:
          'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
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
          {t('academic.title')}
        </Typography>

        <Stack spacing={2}>
          {Object.entries(groupedByCategory).map(([category, achievements]) => (
            <StyledAccordion key={category}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <EmojiEventsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {category}
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
      </Container>
    </Box>
  );
};
