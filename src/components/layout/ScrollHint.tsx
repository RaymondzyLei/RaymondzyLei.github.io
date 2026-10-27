import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLenis } from 'lenis/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { keyframes } from '@mui/material/styles';
import { zIndex } from '../../theme';
import { useScrollToSection } from '../../hooks/useScrollToSection';

const nudge = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
`;

export function ScrollHint() {
  const { t } = useTranslation();
  const [atTop, setAtTop] = useState(() => window.scrollY <= 1);
  const [hasPlayed, setHasPlayed] = useState(() => window.scrollY > 1);
  const scrollToSection = useScrollToSection();
  useLenis((lenis) => {
    if (lenis.scroll > 1) setHasPlayed(true);
    setAtTop(lenis.scroll <= 1);
  });

  if (!atTop) return null;

  const handleClick = () => {
    const section = document.getElementById('skills');
    if (section) scrollToSection(section);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: { xs: 'auto', md: '50%' },
        right: { xs: 16, md: 'auto' },
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        transform: { xs: 'none', md: 'translateX(-50%)' },
        zIndex: zIndex.scrollHint,
        '@media print': { display: 'none' },
      }}
    >
      <IconButton
        onClick={handleClick}
        aria-label={t('hero.scrollHint')}
        title={t('hero.scrollHint')}
        sx={{ width: 48, height: 48, color: 'primary.main' }}
      >
        <KeyboardArrowDownIcon
          onAnimationEnd={() => setHasPlayed(true)}
          sx={
            hasPlayed
              ? undefined
              : {
                  '@media (prefers-reduced-motion: no-preference)': {
                    animation: `${nudge} 800ms cubic-bezier(0.65, 0, 0.35, 1) 3600ms 2`,
                  },
                }
          }
        />
      </IconButton>
    </Box>
  );
}
