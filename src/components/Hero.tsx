import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { socialLinks } from '../data/social';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { DISPLAY_FONT } from '../theme';
import { useLenis } from 'lenis/react';
import { LiquidGlassButton } from './LiquidGlassButton';

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.3) rotateZ(5deg)',
    boxShadow: theme.shadows[12],
  },
  // H3: respect reduced-motion -- keep hover amplitude, drop the transform.
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:hover': {
      transform: 'none',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  // H4: removed hand-rolled ::before ripple (animated width/height -- a layout
  // property, GPU-violating per emil/review-animations). MUI Button ships its
  // own TouchRipple which is GPU-friendly and interruptible; rely on that.
  // Hover keeps the elevation bump; :active scale is handled globally in theme.
  transition: theme.transitions.create(['boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const ctaTiltRef = useTilt<HTMLButtonElement>();
  const { ref: heroRef, isVisible: heroVisible } = useReveal();
  const lenis = useLenis();
  const handleContactClick = () => {
    const element = document.getElementById('contact');
    if (element) {
      lenis?.scrollTo(element);
    }
  };

  return (
    <Box
      id="hero"
      ref={heroRef}
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
        ...revealSx(heroVisible),
      }}
    >
      <Container maxWidth="md">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={10}
          sx={{
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            width: '100%',
          }}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              width: '100%',
              order: { xs: 2, md: 1 },
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {t('hero.title')}
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 'bold',
                fontStyle: 'italic',
                color: 'primary.main',
              }}
            >
              {t('hero.name')}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                mb: 2,
              }}
            >
              {t('hero.subtitle')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '600px',
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              {t('hero.bio')}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 2 }}>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <LiquidGlassButton
                    key={link.id}
                    icon={<Icon />}
                    label={t(`data.social.${link.id}.label`)}
                    href={link.url}
                  />
                );
              })}
            </Stack>
            <StyledButton
              ref={ctaTiltRef}
              variant="contained"
              size="large"
              onClick={handleContactClick}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {t('hero.cta')}
            </StyledButton>
          </Stack>
          <AnimatedAvatar
            src="/avatar.webp"
            srcSet="/avatar.webp 1x, /avatar-2x.webp 2x"
            alt={t('hero.avatarAlt')}
            slotProps={{ img: { decoding: 'async' } }}
            sx={{
              width: { xs: 200, md: 320 },
              height: { xs: 200, md: 320 },
              fontSize: '3rem',
              fontWeight: 'bold',
              order: { xs: 1, md: 2 },
            }}
          />
        </Stack>
      </Container>
    </Box>
  );
};
