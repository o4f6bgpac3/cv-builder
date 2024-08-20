import React, { useEffect, useRef } from 'react';
import { Button, Container, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Container
        maxWidth='md'
        sx={{
          [theme.breakpoints.only('xs')]: {
            '&.MuiContainer-root': {
              paddingLeft: 0,
              paddingRight: 0,
            },
          },
        }}
      >
        <Box my={isMobile ? 1 : 4}>
          <Box display='flex' justifyContent='space-between' mb={2}>
            <Typography variant='h4' component='h1'>
              CV Builder
            </Typography>
            {isMobile ? (
              <Button
                variant='outlined'
                size='small'
                color='secondary'
                startIcon={<UploadIcon />}
                onClick={() => iframeRef.current?.click()}
              >
                Import
              </Button>
            ) : (
              <Button
                variant='outlined'
                size='small'
                color='secondary'
                startIcon={<UploadIcon />}
                onClick={() => iframeRef.current?.click()}
              >
                Import Data (JSON)
              </Button>
            )}
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

          <Box
            display='flex'
            mt={isMobile ? 2 : 4}
            flexDirection={isMobile ? 'column-reverse' : 'row'}
            gap={2}
            justifyContent='space-between'
          >
            <Button
              variant='contained'
              color='primary'
              onClick={generatePDF}
              startIcon={isMobile ? <AutoAwesomeIcon /> : ''}
              disabled={isGeneratingPDF || isExportingJSON}
            >
              {isGeneratingPDF ? 'Generating...' : isMobile ? 'Download PDF' : 'Preview PDF'}
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={exportJSON}
              startIcon={<DownloadIcon />}
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
