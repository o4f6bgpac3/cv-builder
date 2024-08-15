import {
  Box,
  Button,
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
import { useStore } from './state';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useCVBuilder } from './CVBuilder.hook';

export const KeySkills: React.FC = () => {
  const { cvData } = useStore();
  const { handleChange, addField } = useCVBuilderContext();
  const { onDragEnd, removeField } = useCVBuilder();
  const id = 'skills';
  const section = cvData.skills;
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display='flex' justifyContent='space-between'>
        <Typography variant='h5' alignSelf='center'>
          Key Skills
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => addField('skills')} variant='outlined'>
          Add Skill
        </Button>
      </Box>
      {cvData.skills.length > 0 && (
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
                        <ListItemText
                          primary={
                            <TextField
                              fullWidth
                              label={`Skill ${index + 1}`}
                              value={item}
                              onChange={(e) => handleChange('skills', index, null, e.target.value)}
                            />
                          }
                        />
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
      )}
    </Paper>
  );
};
