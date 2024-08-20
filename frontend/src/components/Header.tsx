import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          CV Builder
        </Typography>
        <Box>
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
