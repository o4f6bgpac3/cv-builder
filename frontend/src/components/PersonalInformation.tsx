import React from 'react';
import { Grid, Paper, TextField, Typography } from '@mui/material';
import { useCVBuilderContext } from './CVBuilderContext';
import { CVData, useStore } from './state';

export const PersonalInformation: React.FC = () => {
  const { cvData } = useStore();
  const { updateCvData } = useCVBuilderContext();

  const handleChange = (field: keyof CVData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCvData({ [field]: e.target.value });
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 3 }, mb: 3 }}>
      <Typography variant='h5' gutterBottom>
        Personal Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Name'
            value={cvData.name}
            onChange={(e) => handleChange('name')(e as React.ChangeEvent<HTMLInputElement>)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Address'
            value={cvData.address}
            onChange={(e) => handleChange('address')(e as React.ChangeEvent<HTMLInputElement>)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Phone1'
            value={cvData.phone1}
            onChange={(e) => handleChange('phone1')(e as React.ChangeEvent<HTMLInputElement>)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Phone2'
            value={cvData.phone2}
            onChange={(e) => handleChange('phone2')(e as React.ChangeEvent<HTMLInputElement>)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Email'
            type='email'
            value={cvData.email}
            onChange={(e) => handleChange('email')(e as React.ChangeEvent<HTMLInputElement>)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
