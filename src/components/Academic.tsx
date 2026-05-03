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
import { styled } from '@mui/material/styles';
import { achievementsData } from '../data/achievements';

const AchievementCard = styled(Card)(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'boxShadow', 'borderTop'], {
    duration: theme.transitions.duration.standard,
  }),
  borderTop: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  transition: theme.transitions.create(['boxShadow', 'backgroundColor'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const Academic: React.FC = () => {
  const { t } = useTranslation();

  const groupedByCategory = achievementsData.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, typeof achievementsData>
  );

  return (
    <Box
      id="academic"
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
                      <AchievementCard>
                        <CardHeader
                          title={achievement.title}
                          subheader={achievement.date}
                          titleTypographyProps={{
                            variant: 'h6',
                            sx: { fontWeight: 600 },
                          }}
                          subheaderTypographyProps={{
                            sx: { color: 'text.secondary' },
                          }}
                        />
                        <CardContent>
                          <Typography
                            variant="body2"
                            sx={{ mb: 1, color: 'text.secondary' }}
                          >
                            {achievement.description}
                          </Typography>
                          {achievement.details && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.disabled', display: 'block' }}
                            >
                              {achievement.details}
                            </Typography>
                          )}
                          <Chip
                            label={category}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                            }}
                          />
                        </CardContent>
                      </AchievementCard>
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
