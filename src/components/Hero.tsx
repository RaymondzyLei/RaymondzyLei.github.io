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
import { useScrollToSection } from '../hooks/useScrollToSection';
import { revealSx } from '../styles/reveal';
import { DISPLAY_FONT, glass } from '../theme';
import { LiquidGlassButton } from './LiquidGlassButton';
import { resumeLangUrl } from '../routing';
import { isSupportedLanguage } from '../i18n/languages';

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'scale(1.06)',
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
  const { t, i18n } = useTranslation();
  const resumeLang = isSupportedLanguage(i18n.language) ? i18n.language : 'en';
  const ctaTiltRef = useTilt<HTMLButtonElement>();
  const { ref: heroRef, isVisible: heroVisible } = useReveal();
  const scrollToSection = useScrollToSection();
  const handleContactClick = () => {
    const element = document.getElementById('contact');
    if (element) {
      scrollToSection(element);
    }
  };

  return (
    <Box
      id="hero"
      ref={heroRef}
      component="section"
      sx={{
        py: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
        ...revealSx(heroVisible),
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 6, md: 8 }}
          sx={{
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            width: '100%',
          }}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'flex-start',
              textAlign: 'left',
              minWidth: 0,
              flex: 1.5,
              width: '100%',
              order: 1,
            }}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: '-0.06em',
                color: 'primary.main',
                opacity: 0.55,
                pointerEvents: 'none',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              01
            </Typography>
            <Typography
              variant="h5"
              component="p"
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
                fontSize: { xs: 'clamp(1.8rem, 8vw, 3rem)', md: 'clamp(2.5rem, 4.6vw, 3.6rem)' },
                lineHeight: 1.12,
                letterSpacing: '-0.04em',
                overflowWrap: 'anywhere',
                color: 'primary.main',
              }}
            >
              {t('hero.name')}
            </Typography>
            <Typography
              variant="h5"
              component="p"
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
                maxWidth: '36ch',
                fontSize: '1.1rem',
                lineHeight: 1.8,
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
            >
              <StyledButton variant="contained" size="large" href={resumeLangUrl(resumeLang)}>
                {t('hero.resumeCta')}
              </StyledButton>
              <StyledButton
                ref={ctaTiltRef}
                variant="outlined"
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
          </Stack>
          <Box
            sx={{
              position: 'relative',
              width: { xs: 'calc(100% - 32px)', md: '100%' },
              maxWidth: { xs: 280, md: 380 },
              flex: 1,
              order: 2,
              p: 2,
            }}
          >
            <Box
              aria-hidden="true"
              sx={(theme) => ({
                ...glass(theme),
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                transform: 'rotate(-6deg)',
                pointerEvents: 'none',
              })}
            />
            <Box
              sx={(theme) => ({
                position: 'relative',
                p: 2,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: theme.shadows[8],
              })}
            >
              <AnimatedAvatar
                src="/avatar.webp"
                srcSet="/avatar.webp 1x, /avatar-2x.webp 2x"
                alt={t('hero.avatarAlt')}
                slotProps={{ img: { decoding: 'async' } }}
                sx={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1',
                  borderRadius: 2,
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  order: { xs: 1, md: 2 },
                }}
              />
              <Typography
                component="p"
                variant="overline"
                sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}
              >
                {t('hero.subtitle')}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
