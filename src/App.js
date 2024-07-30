import React, { useState, useCallback, useRef } from 'react';
import { 
  TextField, Button, Container, Typography, Box, IconButton,
  Paper, Grid, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faEgg, faSeedling } from '@fortawesome/free-solid-svg-icons';

library.add(faCircleCheck, faEgg, faSeedling);

const CVBuilder = () => {
  const [cvData, setCvData] = useState({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    statement: 'Use <br> to start a new line',
    skills: [
      '',
    ],
    experience: [
      { title: '', company: '', period: '', duties: [
        '',
      ] },
    ],
    interests: [''],
  });

  const fileInputRef = useRef(null);

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

  const generateHTML = useCallback(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${cvData.name} - CV</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          html {
            margin: 1rem;
          }
          body {
            font-family: Arial, sans-serif;
          }
          section {
            margin-top: .75rem;
            text-align: justify;
            border-radius: 1.5rem;
            background-color: #f8f8f8;
            padding: 1rem;
            justify-content: flex-start;
            border: 2px solid gold;
          }
          #contact {
            display: flex;
            justify-content: flex-start;
            background: #fff;
            padding-bottom: 0;
            border: none;
          }
          #contact #name {
            display: flex;
            line-height: 0.85;
            margin: 0;
            padding: 0;
            font-size: 3rem;
            font-weight: bold;
          }
          #contact #address {
            margin-left: auto;
            text-align: end;
            justify-content: flex-start;
            margin-top: 0;
          }
          .no-break {
            page-break-inside: avoid;
          }
          h2 {
            margin-top: 0;
            margin-bottom: .25rem;
          }
          .interests > div,
          #skills > div,
          .indent {
            padding: .25rem;
          }
          i {
            width: 20px;
            margin-right: .5rem;
          }
          .title {
            text-decoration: underline;
            margin-bottom: .5rem;
          }
          .indent {
            margin-left: 1.5rem;
          }
          .ps-2 {
            padding-top: .5rem;
          }
          .pe-0 {
            padding-bottom: 0;
          }
          .mt-2 {
            margin-top: .5rem;
          }
          .mb-1 {
            margin-bottom: .25rem;
          }
          .fa-circle-check {
            color: limegreen;
          }
          .fa-egg {
            color: peachpuff;
          }
          .fa-seedling {
            color: green;
          }
          @page {
            size: A4;
            margin: 0mm;
          }
          /* Ensure Key Skills and Professional Experience start on a new page if they don't fit */
          #skills, .experience {
            page-break-before: auto;
          }
          @media print {
            .no-break {
              page-break-inside: avoid;
              padding-top: 20px;
            }
            
            .no-break > *:first-child {
              margin-top: 0;
            }
            
            @page {
              margin-top: 20px;
            }
            
            .experience > div {
              margin-bottom: 20px;
            }
            
            body {
              font-size: 12pt;
            }
            
            h2 {
              margin-top: 20px;
            }
          }

          .experience > div {
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            margin-bottom: 15px;
          }

          .experience div > span {
            font-weight: bold;
            display: block;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <section id="contact">
          <div id="name">${cvData.name}</div>
          <div id="address">
            <div>${cvData.address}</div>
            <div>${cvData.phone1}</div>
            <div>${cvData.phone2}</div>
            <div>${cvData.email}</div>
          </div>
        </section>
  
        <section id="statement">
          <h2>Personal Statement</h2>
          <div>${cvData.statement}</div>
        </section>
  
        <section id="skills">
          <h2>Key Skills</h2>
          <div>
            ${cvData.skills.map(skill => `<div><i class="fa-regular fa-circle-check"></i>${skill}</div>`).join('')}
          </div>
        </section>
  
        <section class="experience">
          <h2>Professional Experience</h2>
          ${cvData.experience.map(exp => `
            <div class="no-break">
              <span>${exp.title}</span>
              <div class="mt-2 mb-1">${exp.period}; ${exp.company}</div>
              <ul>
                ${exp.duties.map(duty => `<li>${duty}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </section>
  
        <section>
          <h2>Personal Interests</h2>
          <div style="display: flex; justify-content: flex-start;">
            <div class="interests">
              ${cvData.interests.map(interest => `<div>${interest}</div>`).join('')}
            </div>
            <div></div>
          </div>
        </section>
        <div style="display: flex; justify-content: flex-end;">
          <small style="margin-top: .25rem;">Icons provided by FontAwesome</small>
        </div>
      </body>
      </html>
    `;
  }, [cvData]);

  const downloadFile = (content, fileName, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCV = useCallback(() => {
    const html = generateHTML();
    const baseName = cvData.name.replace(/\s+/g, '_');
  
    downloadFile(html, `${baseName}_CV.html`, 'text/html');
  }, [cvData, generateHTML]);

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(cvData, null, 2);
    const baseName = cvData.name.replace(/\s+/g, '_');
  
    downloadFile(json, `${baseName}_CV_data.json`, 'application/json');
  }, [cvData, generateHTML]);

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
        <Box display='flex' justifyContent='space-between' mb={2}>
          <Typography variant="h4" component="h1">
            CV Builder
          </Typography>
          <Button
            variant="outlined"
            size='small'
            color="info"
            onClick={() => fileInputRef.current.click()}
          >
            Import Data (JSON)
          </Button>
          <input
            type="file"
            ref={fileInputRef}
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
          <List>
            {cvData.skills.map((skill, index) => (
              <ListItem key={index}>
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
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeField('skills', index)}>
                    <RemoveIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
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
                      primary={
                        <TextField
                          fullWidth
                          label={`Duty ${dutyIndex + 1}`}
                          value={duty}
                          onChange={(e) => {
                            const newDuties = [...exp.duties];
                            newDuties[dutyIndex] = e.target.value;
                            handleChange('experience', index, 'duties', newDuties);
                          }}
                        />
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeDuty(index, dutyIndex)}>
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
          <List>
            {cvData.interests.map((interest, index) => (
              <ListItem key={index}>
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
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeField('interests', index)}>
                    <RemoveIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            startIcon={<AddIcon />}
            onClick={() => addField('interests')}
            variant="outlined"
          >
            Add Interest
          </Button>
        </Paper>
      
        <Box display='flex' mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={downloadCV}
            sx={{ mr: 2 }}
          >
            Download CV
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportJSON}
          >
            Export Data (JSON)
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CVBuilder;