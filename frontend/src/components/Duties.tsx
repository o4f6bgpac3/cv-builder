import React from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { CVData, useStore } from './state';
import { useCVBuilder } from './CVBuilder.hook';
import { useCVBuilderContext } from './CVBuilderContext';

type Props = {
  index: number;
};

export const Duties: React.FC<Props> = (props) => {
  const { index } = props;
  const { cvData } = useStore();
  const { handleChange, addDuty } = useCVBuilderContext();
  const { onDragEnd, removeDuty } = useCVBuilder();
  return (
    <>
      <Box display='flex' justifyContent='space-between' mt={2}>
        <Typography variant='h5' alignSelf='center'>
          Duties
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => addDuty(index)} variant='outlined' sx={{ mt: 2 }}>
          Add Duty
        </Button>
      </Box>
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, `experience[${index}].duties` as keyof CVData)}
      >
        <Droppable droppableId={`duties-${index}`}>
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {cvData.experience[index].duties.map((duty, dutyIndex) => (
                <Draggable key={dutyIndex} draggableId={`duty-${index}-${dutyIndex}`} index={dutyIndex}>
                  {(provided) => (
                    <ListItem ref={provided.innerRef} {...provided.draggableProps} sx={{ px: 0 }}>
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
    </>
  );
};
