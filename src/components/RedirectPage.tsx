import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LinkIcon from '@mui/icons-material/Link';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import type { RedirectRule } from '../data/redirects';

interface RedirectPageProps {
  rule: RedirectRule;
}

export const RedirectPage: React.FC<RedirectPageProps> = ({ rule }) => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { ref: sectionRef, isVisible } = useReveal();

  const initialSeconds = reducedMotion ? 0 : 3;
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      window.location.href = rule.targetUrl;
      return;
    }
    const id = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, rule.targetUrl]);

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
        <GlassCard ref={tiltRef} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <LinkIcon sx={{ fontSize: 40, color: 'primary.contrastText' }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {t('redirect.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            {t('redirect.description', {
              url: rule.targetUrl,
              seconds,
            })}
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 4,
            }}
          >
            {seconds}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              href={rule.targetUrl}
              size="large"
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.2,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {t('redirect.goNow')}
            </Button>
            <Button
              variant="outlined"
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
              {t('redirect.backHome')}
            </Button>
          </Stack>
        </GlassCard>
      </Container>
    </Box>
  );
};
