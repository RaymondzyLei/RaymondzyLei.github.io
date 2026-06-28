import React from 'react';
import { alpha, styled } from '@mui/material/styles';
import { glass } from '../theme';

const SIZE = 48;

const Root = styled('a')(({ theme }) => ({
  ...glass(theme),
  width: SIZE,
  height: SIZE,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  textDecoration: 'none',
  transition: theme.transitions.create(['transform', 'box-shadow', 'color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '& svg': {
    fontSize: 24,
  },
  '&:hover': {
    transform: 'scale(1.08)',
    color: theme.palette.primary.dark,
    boxShadow:
      theme.palette.mode === 'dark'
        ? 'inset 0 1px 0 0 rgba(255,255,255,0.14), 0 12px 36px rgba(167,139,250,0.2)'
        : `inset 0 1px 0 0 rgba(255,255,255,0.7), 0 12px 36px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
  '&:active': {
    transform: 'scale(0.96)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 4,
  },
  '@media (pointer: coarse)': {
    '&:hover': {
      transform: 'none',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:hover': {
      transform: 'none',
    },
    '&:active': {
      transform: 'none',
    },
  },
}));

interface LiquidGlassButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  external?: boolean;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  icon,
  label,
  href,
  external = true,
}) => {
  if (external) {
    return (
      <Root href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {icon}
      </Root>
    );
  }
  return (
    <Root href={href} aria-label={label}>
      {icon}
    </Root>
  );
};
