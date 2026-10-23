import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useTranslation } from 'react-i18next';
import { BackgroundOrbs } from './BackgroundOrbs';
import { Navbar } from './layout/Navbar';
import { BackToTopButton } from './layout/BackToTopButton';
import { ScrollHint } from './layout/ScrollHint';
import { useHashScroll } from '../hooks/useHashScroll';
import { focusVisibleRing } from '../theme';

interface LayoutProps {
  children: React.ReactNode;
  isNotFound?: boolean;
}

/**
 * Page shell: sticky glass Navbar, drifting background orbs, main content,
 * back-to-top button, and filing footer. All interactive pieces (nav,
 * language, theme, back-to-top) own their own state in sub-components.
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
          p: 0,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          fontWeight: 600,
          // Visually hidden until focused (standard skip-link pattern).
          clipPath: 'inset(50%)',
          clip: 'rect(0 0 0 0)',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          '&:focus': {
            px: 2,
            py: 1,
            maxWidth: 'calc(100% - 16px)',
            whiteSpace: 'normal',
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
      {!isNotFound && <ScrollHint />}
      <BackToTopButton />
      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: 2,
          px: 2,
          py: 3,
          textAlign: 'center',
          '@media print': { display: 'none' },
        }}
      >
        <Link
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          color="text.secondary"
          underline="hover"
          sx={{
            ...focusVisibleRing(2),
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
          }}
        >
          {t('layout.icpFiling')}
        </Link>
        <Link
          href="https://beian.mps.gov.cn/#/query/webSearch?code=44011202004418"
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          color="text.secondary"
          underline="hover"
          sx={{
            ...focusVisibleRing(2),
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            minHeight: 44,
          }}
        >
          <Box
            component="img"
            src="/public-security-filing.png"
            alt=""
            width={18}
            height={20}
            sx={{ flexShrink: 0 }}
          />
          {t('layout.publicSecurityFiling')}
        </Link>
      </Box>
    </Box>
  );
};
