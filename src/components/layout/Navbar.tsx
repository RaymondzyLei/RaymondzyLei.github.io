import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, useTheme, styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useLenis } from 'lenis/react';
import { glass } from '../../theme';
import { LanguageMenu } from './LanguageMenu';

interface NavbarProps {
  isNotFound?: boolean;
}

interface Section {
  id: string;
  label: string;
}

const StyledNavButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: theme.transitions.create(['color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: theme.palette.primary.main,
    transform: 'scaleX(0)',
    transformOrigin: 'right',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shorter,
    }),
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    color: theme.palette.primary.main,
    '&::before': {
      transform: 'scaleX(1)',
      transformOrigin: 'left',
    },
  },
  // H3: respect reduced-motion (Motion-Driven style a11y debt) -- keep hover
  // amplitude, just disable the transform transition.
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:hover': {
      transform: 'none',
      '&::before': {
        transition: 'none',
      },
    },
  },
}));

export const Navbar: React.FC<NavbarProps> = ({ isNotFound = false }) => {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lenis = useLenis();

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      lenis?.scrollTo(element);
      history.replaceState(null, '', `#${sectionId}`);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleModeChange = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const sections: Section[] = [
    { id: 'hero', label: t('nav.about') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'qualifications', label: t('nav.qualifications') },
    { id: 'academic', label: t('nav.academic') },
    { id: 'portfolio', label: t('nav.portfolio') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const navContent = (
    <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
      {sections.map((section) => (
        <StyledNavButton
          key={section.id}
          {...(isNotFound
            ? { component: 'a', href: '/' }
            : { onClick: () => handleNavClick(section.id) })}
          sx={{
            color: 'text.primary',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          {section.label}
        </StyledNavButton>
      ))}
    </Stack>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => ({
          ...glass(theme),
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        })}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Button
              {...(isNotFound
                ? { component: 'a', href: '/' }
                : { onClick: () => handleNavClick('hero') })}
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              {t('layout.logo')}
            </Button>
          </Box>

          {!isMobile && <Box sx={{ display: 'flex', gap: 1 }}>{navContent}</Box>}

          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
            <LanguageMenu />
            <IconButton
              onClick={handleModeChange}
              size="small"
              aria-label={t('layout.toggleTheme')}
              title={t('layout.toggleTheme')}
            >
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {isMobile && (
              <IconButton
                onClick={handleMobileMenuToggle}
                aria-label={t('layout.openMenu')}
                title={t('layout.openMenu')}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ p: 2 }}>{navContent}</Box>
      </Drawer>
    </>
  );
};
