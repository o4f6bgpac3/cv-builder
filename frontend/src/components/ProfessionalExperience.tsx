import { Box, Button, Grid, List, ListItem, Paper, TextField, Typography } from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import React from 'react';
import { useCVBuilderContext } from './CVBuilderContext';
import { useStore } from './state';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useCVBuilder } from './CVBuilder.hook';
import { Duties } from './Duties';

export const ProfessionalExperience: React.FC = () => {
  const { cvData } = useStore();
  const { handleChange, addField, removeField } = useCVBuilderContext();
  const { onDragEnd } = useCVBuilder();
  const id = 'experience';
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display='flex' justifyContent='space-between'>
        <Typography variant='h5' alignSelf='center'>
          Professional Experience
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => addField('experience', true)} variant='outlined'>
          Add Experience
        </Button>
      </Box>
      {cvData.experience.length > 0 && (
        <DragDropContext onDragEnd={(result) => onDragEnd(result, id)}>
          <Droppable droppableId={id}>
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {cvData.experience.map((exp, index) => (
                  <Draggable key={index} draggableId={`${id}-${index}`} index={index}>
                    {(provided) => (
                      <ListItem ref={provided.innerRef} {...provided.draggableProps} sx={{ px: 0 }}>
                        <Box {...provided.dragHandleProps} sx={{ mr: 2, cursor: 'move' }}>
                          <DragIndicatorIcon />
                        </Box>
                        <Box
                          key={index}
                          p={2}
                          flexGrow={1}
                          border={1}
                          borderColor='grey.300'
                          borderRadius={1}
                        >
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
                                onChange={(e) =>
                                  handleChange('experience', index, 'title', e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label='Company'
                                value={exp.company}
                                onChange={(e) =>
                                  handleChange('experience', index, 'company', e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label='Period'
                                value={exp.period}
                                onChange={(e) =>
                                  handleChange('experience', index, 'period', e.target.value)
                                }
                              />
                            </Grid>
                          </Grid>
                          <Duties index={index} />
                        </Box>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Paper>
  );
};
