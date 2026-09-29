import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLenis } from 'lenis/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { alpha, keyframes } from '@mui/material/styles';
import { glass, zIndex } from '../../theme';
import { useScrollToSection } from '../../hooks/useScrollToSection';

const breathe = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

export function ScrollHint() {
  const { t } = useTranslation();
  const [atTop, setAtTop] = useState(() => window.scrollY <= 1);
  const scrollToSection = useScrollToSection();
  useLenis((lenis) => setAtTop(lenis.scroll <= 1));

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
        sx={(theme) => ({
          ...glass(theme),
          position: 'relative',
          width: 48,
          height: 48,
          borderRadius: '50%',
          color: 'primary.main',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: `0 0 24px ${alpha(theme.palette.primary.main, 0.3)}`,
            animation: `${breathe} 2400ms cubic-bezier(0.45, 0, 0.55, 1) infinite`,
            pointerEvents: 'none',
          },
          '& .MuiSvgIcon-root': {
            animation: `${breathe} 2400ms cubic-bezier(0.45, 0, 0.55, 1) infinite`,
          },
          '&:hover': { backgroundColor: glass(theme).backgroundColor },
          '@media (prefers-reduced-motion: reduce)': {
            '&::before, & .MuiSvgIcon-root': { animation: 'none' },
          },
        })}
      >
        <KeyboardArrowDownIcon />
      </IconButton>
    </Box>
  );
}
