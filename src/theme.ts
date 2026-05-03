import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#7c3aed',
        },
        secondary: {
          main: '#7c3aed',
        },
        background: {
          default: '#ffffff',
          paper: '#ffffff',
        },
        text: {
          primary: '#000000',
          secondary: '#333333',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#a78bfa',
        },
        secondary: {
          main: '#a78bfa',
        },
        background: {
          default: '#1e1b4b',
          paper: '#2e2b5f',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e5e7eb',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

theme = responsiveFontSizes(theme);

export default theme;
