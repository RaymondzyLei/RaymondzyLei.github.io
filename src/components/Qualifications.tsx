import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Paper from '@mui/material/Paper';
import SchoolIcon from '@mui/icons-material/School';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { timelineData, type TimelineItem as TimelineDataItem } from '../data/timeline';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { glass } from '../theme';

const TimelineCard = styled(Paper)(({ theme }) => ({
  ...glass(theme),
  transition: theme.transitions.create(['boxShadow', 'borderLeft'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const DesktopTimelineItem: React.FC<{ item: TimelineDataItem; index: number }> = ({ item, index }) => {
  const tiltRef = useTilt();
  const { ref: revealRef, isVisible } = useReveal();
  return (
    <Box
      ref={revealRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        transition:
          'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${index * 100}ms`,
        willChange: 'opacity, transform',
      }}
    >
      <TimelineCard ref={tiltRef} sx={{ p: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
          {item.institution}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
          {item.date}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {item.description}
        </Typography>
      </TimelineCard>
    </Box>
  );
};

const MobileTimelineItem: React.FC<{ item: TimelineDataItem; index: number }> = ({ item, index }) => {
  const theme = useTheme();
  const tiltRef = useTilt();
  const { ref: revealRef, isVisible } = useReveal();
  return (
    <Box
      ref={revealRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        transition:
          'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${index * 100}ms`,
        willChange: 'opacity, transform',
      }}
    >
      <Paper
        ref={tiltRef}
        sx={{
          ...glass(theme),
          p: 3,
          borderTop: `4px solid ${theme.palette.primary.main}`,
          transition: theme.transitions.create(['boxShadow']),
          '&:hover': {
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SchoolIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {item.date}
          </Typography>
        </Box>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {item.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
          {item.institution}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {item.description}
        </Typography>
      </Paper>
    </Box>
  );
};

export const Qualifications: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { ref: sectionRef, isVisible: sectionVisible } = useReveal();

  return (
    <Box
      id="qualifications"
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
          {t('qualifications.title')}
        </Typography>

        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {timelineData.map((item, index) => (
              <MobileTimelineItem key={item.id} item={item} index={index} />
            ))}
          </Box>
        ) : (
          <Timeline position="alternate">
            {timelineData.map((item, index) => (
              <TimelineItem key={item.id}>
                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: 'primary.main', boxShadow: 1 }}>
                    <SchoolIcon />
                  </TimelineDot>
                  {index < timelineData.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: 2 }}>
                  <DesktopTimelineItem item={item} index={index} />
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Container>
    </Box>
  );
};
