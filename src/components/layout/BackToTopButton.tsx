import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';
import { useTranslation } from 'react-i18next';
import { easing, zIndex } from '../../theme';

/**
 * Fixed back-to-top button. Fades in as the user scrolls (opacity =
 * min(scroll/300, 1)), subscribes to Lenis scroll events for the opacity
 * update, and respects prefers-reduced-motion for the scroll duration.
 */
export const BackToTopButton: React.FC = () => {
  const { t } = useTranslation();
  const lenis = useLenis();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [opacity, setOpacity] = useState(0);

  useLenis((l) => {
    setOpacity(Math.min(l.scroll / 300, 1));
  });

  const handleClick = () => {
    lenis?.scrollTo(0, { duration: reducedMotion ? 0 : 1.2 });
  };

  return (
    <IconButton
      onClick={handleClick}
      size="medium"
      aria-label={t('layout.backToTop')}
      title={t('layout.backToTop')}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        opacity,
        // M5: when invisible, don't intercept pointer events (emil: handle edge
        // cases invisibly). Tab focus still reveals it via focus-visible outline.
        pointerEvents: opacity === 0 ? 'none' : 'auto',
        '&:hover': {
          backgroundColor: 'primary.dark',
          transform: 'scale(1.1)',
        },
        transition: `opacity 0.3s ${easing.easeOut}, transform 0.3s ${easing.easeOut}`,
        zIndex: zIndex.backToTop,
      }}
    >
      <KeyboardArrowUpIcon />
    </IconButton>
  );
};
