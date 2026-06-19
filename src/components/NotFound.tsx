import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { glass } from '../theme';

const NotFoundPaper = styled(Paper)(({ theme }) => ({
  ...glass(theme),
  transition: theme.transitions.create(['boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const revealSx = (isVisible: boolean) => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
  transition:
    'opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1), transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
  willChange: 'opacity, transform',
});

export const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  const { ref: sectionRef, isVisible } = useReveal();

  return (
    <Box
      ref={sectionRef}
      component="section"
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        ...revealSx(isVisible),
      }}
    >
      <Container maxWidth="sm">
        <NotFoundPaper ref={tiltRef} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', md: '8rem' },
              fontWeight: 900,
              color: 'primary.main',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              mb: 2,
            }}
          >
            {t('notFound.code')}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {t('notFound.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            {t('notFound.description')}
          </Typography>

          <Button
            variant="contained"
            href="/"
            size="large"
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {t('notFound.home')}
          </Button>
        </NotFoundPaper>
      </Container>
    </Box>
  );
};
