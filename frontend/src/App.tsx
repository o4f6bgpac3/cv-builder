import React, { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
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
  DialogTitle,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Download as DownloadIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';

type Experience = {
  title: string;
  company: string;
  period: string;
  duties: string[];
};

type CVData = {
  name: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  statement: string;
  skills: string[];
  experience: Experience[];
  interests: string[];
};

const CVBuilder: React.FC = () => {
  const [cvData, setCvData] = useState<CVData>({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    statement: '',
    skills: [''],
    experience: [
      {
        title: '',
        company: '',
        period: '',
        duties: [''],
      },
    ],
    interests: [''],
  });

  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  const onDragEnd = (result: DropResult, section: keyof CVData) => {
    if (!result.destination) {
      return;
    }

    if (section.startsWith('experience[')) {
      const matches = section.match(/\d+/g);
      if (!matches) {
        return;
      }
      const expIndex = parseInt(matches[0], 10);
      const items = Array.from(cvData.experience[expIndex].duties);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setCvData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp, i) => (i === expIndex ? { ...exp, duties: items } : exp)),
      }));
    } else if (Array.isArray(cvData[section])) {
      const items = Array.from(cvData[section] as string[]);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setCvData((prev) => ({
        ...prev,
        [section]: items,
      }));
    }
  };

  const addField = useCallback((section: keyof CVData, isNestedArray = false) => {
    setCvData((prev) => {
      if (section === 'experience' && isNestedArray) {
        return {
          ...prev,
          [section]: [...prev[section], { title: '', company: '', period: '', duties: [''] }],
        };
      } else if (Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: [...(prev[section] as string[]), ''],
        };
      }
      return prev;
    });
  }, []);

  const removeField = useCallback((section: keyof CVData, index: number) => {
    setCvData((prev) => {
      if (Array.isArray(prev[section])) {
        const newArray = [...(prev[section] as any[])];
        newArray.splice(index, 1);
        return { ...prev, [section]: newArray };
      }
      return prev;
    });
  }, []);

  const addDuty = useCallback((expIndex: number) => {
    setCvData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].duties.push('');
      return { ...prev, experience: newExperience };
    });
  }, []);

  const removeDuty = useCallback((expIndex: number, dutyIndex: number) => {
    setCvData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].duties.splice(dutyIndex, 1);
      return { ...prev, experience: newExperience };
    });
  }, []);

  const handleChange = useCallback(
    (section: keyof CVData, index: number, field: string | null, value: string | string[]) => {
      setCvData((prev) => {
        if (section === 'experience' && field) {
          const newExperience = [...prev.experience];
          newExperience[index] = { ...newExperience[index], [field]: value };
          return { ...prev, experience: newExperience };
        } else if (Array.isArray(prev[section])) {
          const newArray = [...(prev[section] as string[])];
          newArray[index] = value as string;
          return { ...prev, [section]: newArray };
        }
        return prev;
      });
    },
    []
  );

  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false);
    setIsGeneratingPDF(false);
  };

  const handleDownload = (href: string, fileName: string) => {
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Unable to download ${fileName}. Please try again.`);
    }
  };

  const handleMobileDownload = (href: string, fileName: string) => {
    const newWindow = window.open(href, '_blank');

    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      const link = document.createElement('a');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getResponse = useCallback(
    async (url: string) => {
      try {
        let prefix = '';
        if (
          window.location.origin === 'http://localhost:3000' ||
          window.location.origin === 'http://localhost:5173'
        ) {
          prefix = 'http://localhost';
        }

        return await fetch(`${prefix}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cvData),
        });
      } catch (error) {
        console.error('Failed to get response:', error);
        alert('Failed to get response from server. Please try again.');
      }
    },
    [cvData]
  );

  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      const response = await getResponse('/api/generate-pdf');
      if (response && response.ok) {
        const data = await response.json();
        if (isMobile) {
          handleMobileDownload(data.download_link, `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`);
        } else {
          const pdfContent = `data:application/pdf;base64,${data.pdf_preview}`;
          setPdfBlob(pdfContent);
          setOpenPdfDialog(true);
        }
      } else {
        console.error('Failed to generate PDF:', response?.statusText || 'No response');
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [cvData, isMobile, getResponse]);

  const exportJSON = useCallback(async () => {
    try {
      setIsExportingJSON(true);
      const response = await getResponse('/api/export-json');
      if (response && response.ok) {
        const data = await response.json();
        if (isMobile) {
          handleMobileDownload(data.download_link, `${cvData.name.replace(/\s+/g, '_')}_CV_data.json`);
        } else {
          let prefix = '';
          if (
            window.location.origin === 'http://localhost:3000' ||
            window.location.origin === 'http://localhost:5173'
          ) {
            prefix = 'http://localhost';
          }
          handleDownload(
            `${prefix}${data.download_link}`,
            `${cvData.name.replace(/\s+/g, '_')}_CV_data.json`
          );
        }
      } else {
        console.error('Failed to export JSON:', response?.statusText || 'No response');
        alert('Failed to export JSON. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('An error occurred while exporting JSON. Please try again.');
    } finally {
      setIsExportingJSON(false);
    }
  }, [cvData, isMobile, getResponse]);

  const importJSON = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setCvData(importedData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Error importing data. Please make sure the file is a valid JSON.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const renderDraggableList = (
    id: keyof CVData,
    section: string[],
    itemRenderer: (item: string, index: number) => React.ReactNode
  ) => (
    <DragDropContext onDragEnd={(result) => onDragEnd(result, id)}>
      <Droppable droppableId={id}>
        {(provided) => (
          <List {...provided.droppableProps} ref={provided.innerRef}>
            {section.map((item: string, index: number) => (
              <Draggable key={index} draggableId={`${id}-${index}`} index={index}>
                {(provided) => (
                  <ListItem ref={provided.innerRef} {...provided.draggableProps} sx={{ pl: 0 }}>
                    <Box {...provided.dragHandleProps} sx={{ mr: 2, cursor: 'move' }}>
                      <DragIndicatorIcon />
                    </Box>
                    {itemRenderer(item, index)}
                    <ListItemSecondaryAction>
                      <IconButton edge='end' color='error' onClick={() => removeField(id, index)}>
                        <RemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );

  const renderDraggableDuties = (expIndex: number) => (
    <DragDropContext
      onDragEnd={(result) => onDragEnd(result, `experience[${expIndex}].duties` as keyof CVData)}
    >
      <Droppable droppableId={`duties-${expIndex}`}>
        {(provided) => (
          <List {...provided.droppableProps} ref={provided.innerRef}>
            {cvData.experience[expIndex].duties.map((duty, dutyIndex) => (
              <Draggable key={dutyIndex} draggableId={`duty-${expIndex}-${dutyIndex}`} index={dutyIndex}>
                {(provided) => (
                  <ListItem ref={provided.innerRef} {...provided.draggableProps}>
                    <Box {...provided.dragHandleProps} sx={{ mr: 2, cursor: 'move' }}>
                      <DragIndicatorIcon />
                    </Box>
                    <ListItemText
                      primary={
                        <TextField
                          fullWidth
                          label={`Duty ${dutyIndex + 1}`}
                          value={duty}
                          onChange={(e) => {
                            const newDuties = [...cvData.experience[expIndex].duties];
                            newDuties[dutyIndex] = e.target.value;
                            handleChange('experience', expIndex, 'duties', newDuties);
                          }}
                        />
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge='end'
                        color='error'
                        onClick={() => removeDuty(expIndex, dutyIndex)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );

  return (
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

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h5' gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Name'
                value={cvData.name}
                onChange={(e) => setCvData({ ...cvData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Address'
                value={cvData.address}
                onChange={(e) => setCvData({ ...cvData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone1'
                value={cvData.phone1}
                onChange={(e) => setCvData({ ...cvData, phone1: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone2'
                value={cvData.phone2}
                onChange={(e) => setCvData({ ...cvData, phone2: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={cvData.email}
                onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h5' gutterBottom>
            Key Skills
          </Typography>
          {cvData.skills.length > 0 &&
            renderDraggableList('skills', cvData.skills, (skill, index) => (
              <ListItemText
                primary={
                  <TextField
                    fullWidth
                    label={`Skill ${index + 1}`}
                    value={skill}
                    onChange={(e) => handleChange('skills', index, null, e.target.value)}
                  />
                }
              />
            ))}
          <Button startIcon={<AddIcon />} onClick={() => addField('skills')} variant='outlined'>
            Add Skill
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h5' gutterBottom>
            Professional Experience
          </Typography>
          {cvData.experience.map((exp, index) => (
            <Box key={index} mb={3} p={2} border={1} borderColor='grey.300' borderRadius={1}>
              <Button
                startIcon={<RemoveIcon />}
                onClick={() => removeField('experience', index)}
                variant='outlined'
                color='error'
                sx={{ display: 'flex', mb: 2 }}
              >
                Remove Experience
              </Button>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Job Title'
                    value={exp.title}
                    onChange={(e) => handleChange('experience', index, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Company'
                    value={exp.company}
                    onChange={(e) => handleChange('experience', index, 'company', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Period'
                    value={exp.period}
                    onChange={(e) => handleChange('experience', index, 'period', e.target.value)}
                  />
                </Grid>
              </Grid>
              <Typography variant='subtitle1' mt={2}>
                Duties
              </Typography>
              {renderDraggableDuties(index)}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addDuty(index)}
                variant='outlined'
                sx={{ mt: 2 }}
              >
                Add Duty
              </Button>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => addField('experience', true)}
            variant='outlined'
          >
            Add Experience
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h5' gutterBottom>
            Personal Interests
          </Typography>
          {cvData.interests.length > 0 &&
            renderDraggableList('interests', cvData.interests, (interest: string, index: number) => (
              <ListItemText
                primary={
                  <TextField
                    fullWidth
                    label={`Interest ${index + 1}`}
                    value={interest}
                    onChange={(e) => handleChange('interests', index, null, e.target.value)}
                  />
                }
              />
            ))}
          <Button startIcon={<AddIcon />} onClick={() => addField('interests')} variant='outlined'>
            Add Interest
          </Button>
        </Paper>

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

        {!isMobile && pdfBlob && (
          <Dialog open={openPdfDialog} onClose={handleClosePdfDialog} fullScreen>
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
        )}
      </Box>
    </Container>
  );
};

export default CVBuilder;
