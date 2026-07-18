import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { glass } from '../theme';

type Accent = 'none' | 'left' | 'top';

export interface GlassCardProps {
  /** Direction of the 4px primary accent border. Defaults to 'none'. */
  accent?: Accent;
}

/**
 * Base liquid-glass surface for cards floating above the background orbs.
 * Wraps `glass(theme)` + a hover elevation. The accent border is static
 * (never animated on hover), so only `boxShadow` is transitioned.
 *
 * For the project card's sweep effect, see `StyledProjectCard` in Portfolio —
 * kept separate because its visuals (sweep + shadows[16]) differ.
 */
export const GlassCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'accent',
})<GlassCardProps>(({ theme, accent = 'none' }) => ({
  ...glass(theme),
  transition: theme.transitions.create(['boxShadow'], {
    duration: theme.transitions.duration.standard,
  }),
  ...(accent === 'left' && {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  }),
  ...(accent === 'top' && {
    borderTop: `4px solid ${theme.palette.primary.main}`,
  }),
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));
