import React, { useState } from 'react';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import CVBuilder from './components/CVBuilder';
import { darkTheme, lightTheme } from './styles/theme';
import Header from './components/Header';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleTheme = (): void => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <Container
          maxWidth='lg'
          sx={{
            '&.MuiContainer-root': {
              paddingLeft: { xs: 0, sm: 16 },
              paddingRight: { xs: 0, sm: 16 },
            },
          }}
        >
          <CVBuilder />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
