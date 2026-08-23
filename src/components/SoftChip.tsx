import Chip from '@mui/material/Chip';
import { alpha, styled } from '@mui/material/styles';

/**
 * Shared soft-filled chip (2026-08-23 frontend-polish spec §5): tinted
 * primary background + hairline inset ring + primary text. Replaces the
 * three divergent chip styles (solid in Skills/Academic, outlined in
 * Portfolio) with one language. Hover deepens the tint one notch; focus ring
 * comes from the global MuiChip styleOverride.
 */
export const SoftChip = styled(Chip)(({ theme }) => {
  const dark = theme.palette.mode === 'dark';
  return {
    backgroundColor: alpha(theme.palette.primary.main, dark ? 0.12 : 0.09),
    color: dark ? theme.palette.primary.light : theme.palette.primary.dark,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, dark ? 0.26 : 0.22)}`,
    fontWeight: 500,
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, dark ? 0.18 : 0.14),
    },
  };
});
