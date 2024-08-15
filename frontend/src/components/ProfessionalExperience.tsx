import {
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import React from 'react';
import { useCVBuilderContext } from './CVBuilderContext';
import { CVData, useStore } from './state';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useCVBuilder } from './CVBuilder.hook';

export const ProfessionalExperience: React.FC = () => {
  const { cvData } = useStore();
  const { handleChange, addField, removeField, addDuty } = useCVBuilderContext();
  const { onDragEnd, removeDuty } = useCVBuilder();
  return (
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
          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, `experience[${index}].duties` as keyof CVData)}
          >
            <Droppable droppableId={`duties-${index}`}>
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {cvData.experience[index].duties.map((duty, dutyIndex) => (
                    <Draggable
                      key={dutyIndex}
                      draggableId={`duty-${index}-${dutyIndex}`}
                      index={dutyIndex}
                    >
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
                                  const newDuties = [...cvData.experience[index].duties];
                                  newDuties[dutyIndex] = e.target.value;
                                  handleChange('experience', index, 'duties', newDuties);
                                }}
                              />
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge='end'
                              color='error'
                              onClick={() => removeDuty(index, dutyIndex)}
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
      <Button startIcon={<AddIcon />} onClick={() => addField('experience', true)} variant='outlined'>
        Add Experience
      </Button>
    </Paper>
  );
};
