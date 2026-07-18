import React from 'react';
import Box from '@mui/material/Box';
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
  useHashScroll();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isNotFound={isNotFound} />
      <BackgroundOrbs />
      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        {children}
      </Box>
      <BackToTopButton />
    </Box>
  );
};
