import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import React from 'react';
import { useCVBuilder } from './CVBuilder.hook';
import { useStore } from './state';

export const PDFPreview: React.FC = () => {
  const { cvData, openPdfDialog, pdfBlob } = useStore();
  const { handleClosePdfDialog, handleDownload, isMobile } = useCVBuilder();

  if (isMobile || !pdfBlob) return null;
  return (
    <Dialog
      open={openPdfDialog}
      onClose={handleClosePdfDialog}
      fullScreen
      sx={{ border: '1px solid red' }}
    >
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>Your CV Preview</Typography>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload(pdfBlob, `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`)}
            variant='contained'
            color='primary'
          >
            Download PDF
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          component='iframe'
          src={pdfBlob}
          sx={{
            width: '100%',
            height: '98%',
            border: 'none',
          }}
          title={`${cvData.name}'s CV`}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClosePdfDialog}
          color='secondary'
          variant='contained'
          sx={{ mb: 1, mr: 2 }}
        >
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};
