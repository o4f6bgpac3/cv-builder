import { createTheme, ThemeOptions } from '@mui/material/styles';

// Shared theme options
const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '0.02em' },
    h3: { fontSize: '1.75rem', fontWeight: 500, letterSpacing: '0.01em' },
    body1: { fontSize: '1rem', letterSpacing: '0.01em' },
    body2: { fontSize: '0.875rem', letterSpacing: '0.01em' },
  },
};

// Light theme (keeping it as is for contrast)
export const lightTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'light',
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.6)' },
  },
});

// Adventurous dark theme
export const darkTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'dark',
    primary: { main: '#84ffff', light: '#baffff', dark: '#4bcbcc' },
    secondary: { main: '#ff9100', light: '#ffc246', dark: '#c56200' },
    background: {
      default: '#0a192f',
      paper: '#112240',
    },
    text: {
      primary: 'rgba(237, 242, 247, 0.87)',
      secondary: 'rgba(237, 242, 247, 0.6)',
    },
    error: { main: '#ff5252', light: '#ff867f', dark: '#c50e29' },
    warning: { main: '#ffab40', light: '#ffdd71', dark: '#c77c02' },
    info: { main: '#64b5f6', light: '#9be7ff', dark: '#2286c3' },
    success: { main: '#69f0ae', light: '#b9f6ca', dark: '#00c853' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(circle at 10% 20%, #0a192f 0%, #020c1b 90%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #112240 0%, #1d3a5f 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#606a86',
          color: '#e6f1ff',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: '#8892b0',
            boxShadow: '0 2px 10px rgba(136, 146, 176, 0.2)',
          },
        },
        outlined: {
          borderColor: '#8892b0',
          color: '#8892b0',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(136, 146, 176, 0.1)',
            borderColor: '#a8b2d1',
          },
        },
        text: {
          color: '#8892b0',
          '&:hover': {
            backgroundColor: 'rgba(136, 146, 176, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(132, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(132, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#84ffff',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(237, 242, 247, 0.6)',
          },
          '& .MuiInputBase-input': {
            color: 'rgba(237, 242, 247, 0.87)',
          },
        },
      },
    },
  },
});
