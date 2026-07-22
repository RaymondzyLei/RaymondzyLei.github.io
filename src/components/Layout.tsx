import React from 'react';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { BackgroundOrbs } from './BackgroundOrbs';
import { Navbar } from './layout/Navbar';
import { BackToTopButton } from './layout/BackToTopButton';
import { useHashScroll } from '../hooks/useHashScroll';

interface LayoutProps {
  children: React.ReactNode;
  isNotFound?: boolean;
}

/**
 * Page shell: sticky glass Navbar, the drifting background orbs, the main
 * content slot, and the fixed back-to-top button. All interactive pieces
 * (nav, language, theme, back-to-top) own their own state in sub-components.
 */
export const Layout: React.FC<LayoutProps> = ({ children, isNotFound = false }) => {
  const { t } = useTranslation();
  useHashScroll();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* a11y: keyboard users can skip the nav bar straight to content */}
      <Box
        component="a"
        href="#main-content"
        className="skip-link"
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 'tooltip',
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          fontWeight: 600,
          // Visually hidden until focused (standard skip-link pattern).
          clipPath: 'inset(50%)',
          clip: 'rect(0 0 0 0)',
          width: 1,
          height: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          '&:focus': {
            clipPath: 'inset(0)',
            clip: 'auto',
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
          },
        }}
      >
        {t('layout.skipToContent')}
      </Box>
      <Navbar isNotFound={isNotFound} />
      <BackgroundOrbs />
      <Box component="main" id="main-content" sx={{ flex: 1, width: '100%' }}>
        {children}
      </Box>
      <BackToTopButton />
    </Box>
  );
};
