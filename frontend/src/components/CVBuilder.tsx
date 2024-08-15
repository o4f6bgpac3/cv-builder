import React, { useEffect, useRef } from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { CVBuilderProvider } from './CVBuilderContext';
import { useCVBuilder } from './CVBuilder.hook';
import { PersonalInformation } from './PersonalInformation';
import { PersonalStatement } from './PersonalStatement';
import { KeySkills } from './KeySkills';
import { ProfessionalExperience } from './ProfessionalExperience';
import { PersonalInterests } from './PersonalInterests';
import { PDFPreview } from './PDFPreview';
import { useStore } from './state';

const CVBuilder: React.FC = () => {
  const { isExportingJSON, isGeneratingPDF, setIsMobile } = useStore();
  const { exportJSON, generatePDF, isMobile, importJSON } = useCVBuilder();
  const iframeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <CVBuilderProvider>
      <Container maxWidth='md'>
        <Box my={4}>
          <Box display='flex' justifyContent='space-between' mb={2}>
            <Typography variant='h4' component='h1'>
              CV Builder
            </Typography>
            <Button
              variant='outlined'
              size='small'
              color='info'
              onClick={() => iframeRef.current?.click()}
            >
              Import Data (JSON)
            </Button>
            <input
              type='file'
              ref={iframeRef}
              style={{ display: 'none' }}
              accept='.json'
              onChange={importJSON}
            />
          </Box>

          <PersonalInformation />
          <PersonalStatement />
          <KeySkills />
          <ProfessionalExperience />
          <PersonalInterests />

          <Box display='flex' mt={4} justifyContent='space-between'>
            <Button
              variant='contained'
              color='primary'
              onClick={generatePDF}
              disabled={isGeneratingPDF || isExportingJSON}
              sx={{ mr: 2 }}
            >
              {isGeneratingPDF ? 'Generating...' : isMobile ? 'Download PDF' : 'Preview PDF'}
            </Button>
            <Button
              variant='contained'
              color='secondary'
              onClick={exportJSON}
              disabled={isGeneratingPDF || isExportingJSON}
            >
              Export Data (JSON)
            </Button>
          </Box>

          <PDFPreview />
        </Box>
      </Container>
    </CVBuilderProvider>
  );
};

export default CVBuilder;
