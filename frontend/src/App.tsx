import React from 'react';
import { Container } from '@mui/material';
import CVBuilder from './components/CVBuilder';

const App: React.FC = () => {
  return (
    <Container maxWidth='md'>
      <CVBuilder />
    </Container>
  );
};

export default App;
