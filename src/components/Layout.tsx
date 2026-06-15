import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from '@mui/material/styles';
import { useLenis } from 'lenis/react';
import { BackgroundOrbs } from './BackgroundOrbs';
import { glass } from '../theme';

interface LayoutProps {
  children: React.ReactNode;
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
}));

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [backToTopOpacity, setBackToTopOpacity] = useState(0);
  const lenis = useLenis();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useLenis((lenis) => {
    setBackToTopOpacity(Math.min(lenis.scroll / 300, 1));
  });

  const handleBackToTop = () => {
    lenis?.scrollTo(0, { duration: reducedMotion ? 0 : 1.2 });
  };

  const sections: Section[] = [
    { id: 'hero', label: t('nav.about') },
    { id: 'skills', label: t('nav.skills') },
    { id: 'qualifications', label: t('nav.qualifications') },
    { id: 'academic', label: t('nav.academic') },
    { id: 'portfolio', label: t('nav.portfolio') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchor(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleLanguageClose();
  };

  const handleModeChange = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      lenis?.scrollTo(element);
    }
  };

  const navContent = (
    <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
      {sections.map((section) => (
        <StyledNavButton
          key={section.id}
          onClick={() => handleNavClick(section.id)}
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
              onClick={() => handleNavClick('hero')}
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'transparent' },
              }}
            >
              Portfolio
            </Button>
          </Box>

          {!isMobile && <Box sx={{ display: 'flex', gap: 1 }}>{navContent}</Box>}

          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
            <IconButton
              onClick={handleLanguageClick}
              size="small"
              title="Change Language"
            >
              <LanguageIcon />
            </IconButton>
            <Menu
              anchorEl={langAnchor}
              open={Boolean(langAnchor)}
              onClose={handleLanguageClose}
            >
              <MenuItem
                onClick={() => handleLanguageChange('en')}
                selected={i18n.language === 'en'}
              >
                English
              </MenuItem>
              <MenuItem
                onClick={() => handleLanguageChange('zh')}
                selected={i18n.language === 'zh'}
              >
                中文
              </MenuItem>
            </Menu>

            <IconButton onClick={handleModeChange} size="small" title="Toggle dark mode">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {isMobile && (
              <IconButton onClick={handleMobileMenuToggle}>
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

      <BackgroundOrbs />

      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        {children}
      </Box>

      <IconButton
          onClick={handleBackToTop}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            opacity: backToTopOpacity,
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.1)',
            },
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
    </Box>
  );
};
