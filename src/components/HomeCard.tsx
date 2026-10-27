import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

/** Solid surface shared by homepage content cards. */
export const HomeCard = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: 24,
  boxShadow: theme.shadows[1],
}));
