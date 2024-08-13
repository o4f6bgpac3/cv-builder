import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  DialogContent,
  Dialog,
  DialogTitle, DialogActions,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Download as DownloadIcon } from '@mui/icons-material';

const CVBuilder = () => {
  const [cvData, setCvData] = useState({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    statement: '',
    skills: [''],
    experience: [{
      title: '',
      company: '',
      period: '',
      duties: [''],
    }],
    interests: [''],
  });

  const [pdfBlob, setPdfBlob] = useState(null);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = useCallback((section, index, field, value) => {
    setCvData(prev => {
      if (Array.isArray(prev[section])) {
        const newArray = [...prev[section]];
        if (typeof newArray[index] === 'object') {
          newArray[index] = { ...newArray[index], [field]: value };
        } else {
          newArray[index] = value;
        }
        return { ...prev, [section]: newArray };
      }
      return { ...prev, [section]: value };
    });
  }, []);

  const addField = useCallback((section, isNestedArray = false) => {
    setCvData(prev => {
      const newArray = [...prev[section]];
      if (isNestedArray) {
        newArray.push({ title: '', company: '', period: '', duties: [''] });
      } else {
        newArray.push('');
      }
      return { ...prev, [section]: newArray };
    });
  }, []);

  const removeField = useCallback((section, index) => {
    setCvData(prev => {
      const newArray = [...prev[section]];
      newArray.splice(index, 1);
      return { ...prev, [section]: newArray };
    });
  }, []);

  const addDuty = useCallback((expIndex) => {
    setCvData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].duties.push('');
      return { ...prev, experience: newExperience };
    });
  }, []);

  const removeDuty = useCallback((expIndex, dutyIndex) => {
    setCvData(prev => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].duties.splice(dutyIndex, 1);
      return { ...prev, experience: newExperience };
    });
  }, []);

  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      let prefix = '';
      if (window.location.origin === 'http://localhost:3000') {
        prefix = 'http://localhost';
      }

      const response = await fetch(`${prefix}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cvData),
      });

      if (response.ok) {
        const data = await response.json();
        if (isMobile) {
          // window.open(data.download_link, '_blank');
          const link = document.createElement('a');
          link.href = data.download_link;
          link.download = `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const pdfContent = `data:application/pdf;base64,${data.pdf_preview}`;
          setPdfBlob(pdfContent);
          setOpenPdfDialog(true);
        }
      } else {
        console.error('Failed to generate PDF:', response.statusText);
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  }, [cvData, isMobile]);

  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false);
    setIsGeneratingPDF(false);
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const link = document.createElement('a');
      link.href = pdfBlob;
      link.download = `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Unable to download PDF. Please try generating it again.');
    }
  };

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(cvData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cvData.name.replace(/\s+/g, '_')}_CV_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cvData]);

  const importJSON = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setCvData(importedData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Error importing data. Please make sure the file is a valid JSON.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h4" component="h1">
            CV Builder
          </Typography>
          <Button
            variant="outlined"
            size="small"
            color="info"
            onClick={() => iframeRef.current.click()}
          >
            Import Data (JSON)
          </Button>
          <input
            type="file"
            ref={iframeRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={importJSON}
          />
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Personal Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={cvData.name}
                onChange={(e) => handleChange('name', null, null, e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address"
                value={cvData.address}
                onChange={(e) => handleChange('address', null, null, e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone1"
                value={cvData.phone1}
                onChange={(e) => handleChange('phone1', null, null, e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone2"
                value={cvData.phone2}
                onChange={(e) => handleChange('phone2', null, null, e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={cvData.email}
                onChange={(e) => handleChange('email', null, null, e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Personal Statement</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your personal statement"
            value={cvData.statement}
            onChange={(e) => handleChange('statement', null, null, e.target.value)}
          />
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Key Skills</Typography>
          {cvData.skills.length > 0 &&
            <List>
              {cvData.skills.map((skill, index) => (
                <ListItem sx={{ pl: 0 }} key={index}>
                  <ListItemText
                    primary={<TextField
                      fullWidth
                      label={`Skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => handleChange('skills', index, null, e.target.value)}
                    />}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" color="error" onClick={() => removeField('skills', index)}>
                      <RemoveIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          }
          <Button
            startIcon={<AddIcon />}
            onClick={() => addField('skills')}
            variant="outlined"
          >
            Add Skill
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Professional Experience</Typography>
          {cvData.experience.map((exp, index) => (
            <Box key={index} mb={3} p={2} border={1} borderColor="grey.300" borderRadius={1}>
              <Button
                startIcon={<RemoveIcon />}
                onClick={() => removeField('experience', index)}
                variant="outlined"
                color="error"
                sx={{ display: 'flex', mb: 2 }}
              >
                Remove Experience
              </Button>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={exp.title}
                    onChange={(e) => handleChange('experience', index, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={exp.company}
                    onChange={(e) => handleChange('experience', index, 'company', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Period"
                    value={exp.period}
                    onChange={(e) => handleChange('experience', index, 'period', e.target.value)}
                  />
                </Grid>
              </Grid>
              <Typography variant="subtitle1" mt={2}>Duties</Typography>
              <List>
                {exp.duties.map((duty, dutyIndex) => (
                  <ListItem key={dutyIndex}>
                    <ListItemText
                      primary={<TextField
                        fullWidth
                        label={`Duty ${dutyIndex + 1}`}
                        value={duty}
                        onChange={(e) => {
                          const newDuties = [...exp.duties];
                          newDuties[dutyIndex] = e.target.value;
                          handleChange('experience', index, 'duties', newDuties);
                        }}
                      />}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" color="error" onClick={() => removeDuty(index, dutyIndex)}>
                        <RemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => addDuty(index)}
                variant="outlined"
                sx={{ ml: 2 }}
              >
                Add Duty
              </Button>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => addField('experience', true)}
            variant="outlined"
          >
            Add Experience
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Personal Interests</Typography>
          {cvData.interests.length > 0 &&
            <List>
              {cvData.interests.map((interest, index) => (
                <ListItem key={index} sx={{ pl: 0 }}>
                  <ListItemText
                    primary={<TextField
                      fullWidth
                      label={`Interest ${index + 1}`}
                      value={interest}
                      onChange={(e) => handleChange('interests', index, null, e.target.value)}
                    />}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" color="error" onClick={() => removeField('interests', index)}>
                      <RemoveIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          }
          <Button
            startIcon={<AddIcon />}
            onClick={() => addField('interests')}
            variant="outlined"
          >
            Add Interest
          </Button>
        </Paper>

        <Box display="flex" mt={4} justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            sx={{ mr: 2 }}
          >
            {isGeneratingPDF ? 'Generating...' : (isMobile ? 'Download PDF' : 'Preview PDF')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportJSON}
          >
            Export Data (JSON)
          </Button>
        </Box>

        {!isMobile && (
          <Dialog
            open={openPdfDialog}
            onClose={handleClosePdfDialog}
            fullScreen
          >
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Your CV Preview</Typography>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  variant="contained"
                  color="primary"
                >
                  Download PDF
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box
                component="iframe"
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
              <Button onClick={handleClosePdfDialog} color="secondary" variant="contained" sx={{ mb: 1, mr: 2 }}>
                Close Preview
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Container>
  );
};

export default CVBuilder;