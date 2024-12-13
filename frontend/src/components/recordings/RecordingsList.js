import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Task as TaskIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RecordingsList = () => {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      if (response.ok) {
        const data = await response.json();
        setRecordings(data);
      } else {
        // Fallback to mock data for development
        setRecordings([
          {
            id: '1',
            name: 'Camera 1 Recording',
            date: '2024-01-20 14:30',
            duration: '1:30:00',
            size: '2.3 GB',
            source: 'Camera 1 - Main Entrance',
            tasks: [
              { 
                id: '1', 
                name: 'Object Detection',
                status: 'completed',
                results: {
                  objectsDetected: 156,
                  accuracy: '94%'
                }
              },
              { 
                id: '2', 
                name: 'People Counting',
                status: 'completed',
                results: {
                  totalCount: 45,
                  peakTime: '15:30'
                }
              }
            ],
            storageLocation: 'Local Storage',
            retention: '30 days'
          },
          {
            id: '2',
            name: 'Camera 2 Recording',
            date: '2024-01-20 15:45',
            duration: '0:45:00',
            size: '1.1 GB',
            source: 'Camera 2 - Parking Lot',
            tasks: [
              { 
                id: '3', 
                name: 'Motion Detection',
                status: 'completed',
                results: {
                  motionEvents: 23,
                  significantEvents: 5
                }
              }
            ],
            storageLocation: 'AWS S3',
            retention: '60 days'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  const handlePlayRecording = (recordingId) => {
    navigate(`/recordings-arena/viewer/${recordingId}`);
  };

  const handleDeleteRecording = async (recordingId) => {
    try {
      const response = await fetch(`/api/recordings/${recordingId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRecordings(recordings.filter(rec => rec.id !== recordingId));
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const handleShowInfo = (recording) => {
    setSelectedRecording(recording);
    setInfoDialogOpen(true);
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Recordings Arena
        </Typography>
        <List>
          {recordings.map((recording, index) => (
            <React.Fragment key={recording.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6">{recording.name}</Typography>
                      <Chip
                        label={recording.storageLocation}
                        size="small"
                        icon={<StorageIcon />}
                        sx={{ ml: 2 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {recording.date} • Duration: {recording.duration} • Size: {recording.size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Source: {recording.source}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Applied Tasks:
                        </Typography>
                        {recording.tasks.map((task) => (
                          <Chip
                            key={task.id}
                            icon={<TaskIcon />}
                            label={task.name}
                            color={getTaskStatusColor(task.status)}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handlePlayRecording(recording.id)}
                    sx={{ mr: 1 }}
                  >
                    <PlayIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleShowInfo(recording)}
                    sx={{ mr: 1 }}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteRecording(recording.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecording && (
          <>
            <DialogTitle>
              Recording Details - {selectedRecording.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        General Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {selectedRecording.date}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duration:</strong> {selectedRecording.duration}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Size:</strong> {selectedRecording.size}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Source:</strong> {selectedRecording.source}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Storage:</strong> {selectedRecording.storageLocation}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Retention Period:</strong> {selectedRecording.retention}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Task Results
                      </Typography>
                      {selectedRecording.tasks.map((task) => (
                        <Box key={task.id} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1">
                            {task.name}
                            <Chip
                              size="small"
                              label={task.status}
                              color={getTaskStatusColor(task.status)}
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          {task.results && Object.entries(task.results).map(([key, value]) => (
                            <Typography key={key} variant="body2">
                              <strong>{key}:</strong> {value}
                            </Typography>
                          ))}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setInfoDialogOpen(false);
                  handlePlayRecording(selectedRecording.id);
                }}
              >
                Open in Arena Viewer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RecordingsList;
