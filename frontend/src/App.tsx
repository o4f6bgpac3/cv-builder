import React from 'react';
import { Container } from '@mui/material';
import CVBuilder from './components/CVBuilder';

const App: React.FC = () => {
  return (
    <Container
      maxWidth='md'
      sx={{
        '&.MuiContainer-root': {
          paddingLeft: { xs: 0, sm: 16 },
          paddingRight: { xs: 0, sm: 16 },
        },
      }}
    >
      <CVBuilder />
    </Container>
  );
};

export default App;
