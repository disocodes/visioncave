import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Toolbar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Info as InfoIcon,
  Task as TaskIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  ArrowBack as BackIcon,
  CloudUpload as CloudIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import recordingsService from '../../services/recordingsService';

const RecordingMetadata = ({ recording }) => (
  <Stack spacing={1}>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Chip
        icon={<ScheduleIcon />}
        label={new Date(recording.created_at).toLocaleString()}
        size="small"
        variant="outlined"
      />
      <Chip
        icon={<StorageIcon />}
        label={recording.file_path}
        size="small"
        variant="outlined"
      />
    </Stack>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {recording.applied_tasks && recording.applied_tasks.map(task => (
        <Chip
          key={task.id}
          icon={<TaskIcon />}
          label={`${task.name}: ${task.status}`}
          size="small"
          color={task.status === 'completed' ? 'success' : 'warning'}
        />
      ))}
    </Stack>
  </Stack>
);

const RecordingsList = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [storageMenuAnchor, setStorageMenuAnchor] = useState(null);
  const [retentionPeriod, setRetentionPeriod] = useState('30');
  const [selectedStorage, setSelectedStorage] = useState('local');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const data = await recordingsService.getRecordings();
      setRecordings(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to fetch recordings. Please try again later.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlay = (recordingId) => {
    navigate(`/arena/viewer/${recordingId}`);
  };

  const handleDelete = async (recordingId, event) => {
    event.stopPropagation();
    try {
      await recordingsService.deleteRecording(recordingId);
      setRecordings(recordings.filter(rec => rec.id !== recordingId));
      setError(null);
    } catch (error) {
      console.error('Error deleting recording:', error);
      setError('Failed to delete recording. Please try again later.');
    }
  };

  const handleInfo = (recording, event) => {
    event.stopPropagation();
    setSelectedRecording(recording);
    setInfoDialogOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoDialogOpen(false);
    setSelectedRecording(null);
  };

  const handleStorageMenu = (event) => {
    setStorageMenuAnchor(event.currentTarget);
  };

  const handleCloseStorageMenu = () => {
    setStorageMenuAnchor(null);
  };

  const handleStorageSelect = (storage) => {
    setSelectedStorage(storage);
    handleCloseStorageMenu();
  };

  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
  };

  const handleSaveSettings = async () => {
    try {
      await recordingsService.updateSettings({
        retentionPeriod,
        storage: selectedStorage,
      });
      handleCloseSettings();
      setError(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again later.');
      handleCloseSettings();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar sx={{ mb: 2 }}>
        <IconButton edge="start" onClick={handleBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Arena
        </Typography>
        <IconButton onClick={handleStorageMenu}>
          <CloudIcon />
        </IconButton>
        <IconButton onClick={handleOpenSettings}>
          <SettingsIcon />
        </IconButton>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
        <List>
          {recordings.map((recording) => (
            <React.Fragment key={recording.id}>
              <ListItem 
                onClick={() => handlePlay(recording.id)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {recording.name}
                  </Typography>
                  <RecordingMetadata recording={recording} />
                </Box>
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="info"
                    onClick={(e) => handleInfo(recording, e)}
                    sx={{ mr: 1 }}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => handleDelete(recording.id, e)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Storage Menu */}
      <Menu
        anchorEl={storageMenuAnchor}
        open={Boolean(storageMenuAnchor)}
        onClose={handleCloseStorageMenu}
      >
        <MenuItem onClick={() => handleStorageSelect('local')}>Local Storage</MenuItem>
        <MenuItem onClick={() => handleStorageSelect('google-drive')}>Google Drive</MenuItem>
        <MenuItem onClick={() => handleStorageSelect('aws-s3')}>AWS S3</MenuItem>
        <MenuItem onClick={() => handleStorageSelect('nextcloud')}>Nextcloud</MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={handleCloseSettings}>
        <DialogTitle>Arena Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Storage Provider</InputLabel>
              <Select
                value={selectedStorage}
                label="Storage Provider"
                onChange={(e) => setSelectedStorage(e.target.value)}
              >
                <MenuItem value="local">Local Storage</MenuItem>
                <MenuItem value="google-drive">Google Drive</MenuItem>
                <MenuItem value="aws-s3">AWS S3</MenuItem>
                <MenuItem value="nextcloud">Nextcloud</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Retention Period (days)</InputLabel>
              <Select
                value={retentionPeriod}
                label="Retention Period (days)"
                onChange={(e) => setRetentionPeriod(e.target.value)}
              >
                <MenuItem value="7">7 days</MenuItem>
                <MenuItem value="30">30 days</MenuItem>
                <MenuItem value="90">90 days</MenuItem>
                <MenuItem value="180">180 days</MenuItem>
                <MenuItem value="365">1 year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Recording Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={handleCloseInfo}>
        <DialogTitle>Recording Details</DialogTitle>
        <DialogContent>
          {selectedRecording && (
            <Card>
              <CardContent>
                <Typography variant="h6">{selectedRecording.name}</Typography>
                <Typography>Created: {new Date(selectedRecording.created_at).toLocaleString()}</Typography>
                <Typography>File: {selectedRecording.file_path}</Typography>
                {selectedRecording.applied_tasks && selectedRecording.applied_tasks.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2 }}>Tasks</Typography>
                    {selectedRecording.applied_tasks.map(task => (
                      <Box key={task.id} sx={{ mt: 1 }}>
                        <Typography variant="subtitle1">{task.name}</Typography>
                        <Typography color="textSecondary">Status: {task.status}</Typography>
                        {task.results && (
                          <Box sx={{ pl: 2 }}>
                            {Object.entries(task.results).map(([key, value]) => (
                              <Typography key={key}>
                                {key}: {value}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfo}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordingsList;
