import { Paper, TextField, Typography } from '@mui/material';
import React from 'react';
import { useStore } from './state';

export const PersonalStatement: React.FC = () => {
  const { cvData, setCvData } = useStore();
  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 3 }, mb: 3 }}>
      <Typography variant='h5' gutterBottom>
        Personal Statement
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label='Your personal statement'
        value={cvData.statement}
        onChange={(e) => setCvData({ ...cvData, statement: e.target.value })}
      />
    </Paper>
  );
};
