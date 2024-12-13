import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Button,
  Divider,
  Tooltip,
  Tab,
  Tabs,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  FilterList,
  Timeline,
  CropFree,
  Search,
  Save,
  Close,
  SkipNext,
  SkipPrevious,
  Speed,
  Refresh,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Videocam,
  VideocamOff,
  FullscreenExit,
  Fullscreen,
} from '@mui/icons-material';
import BaseWidget from '../widgets/BaseWidget';
import VLMConfig from '../widgets/VLMConfig';

const TOOLS_DRAWER_WIDTH = 320;

const ArenaViewer = ({ recordingId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [activeTools, setActiveTools] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTab, setCurrentTab] = useState(0);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [regions, setRegions] = useState([]);
  const [drawingRegion, setDrawingRegion] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    objectTypes: [],
    confidence: 0.5,
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchRecordingData();
    fetchAvailableTasks();
    fetchModels();
  }, []);

  const fetchRecordingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recordings/${recordingId}`);
      if (!response.ok) throw new Error('Failed to fetch recording data');
      const data = await response.json();
      
      if (videoRef.current) {
        videoRef.current.src = data.videoUrl;
      }
      setAppliedTasks(data.appliedTasks || []);
      setRegions(data.regions || []);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchAvailableTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setAvailableTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeSliderChange = (_, value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToolClick = (tool) => {
    if (tool === 'region') {
      setDrawingMode(drawingMode === 'region' ? null : 'region');
      return;
    }
    
    setActiveTools(prev => 
      prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const handleCanvasMouseDown = (e) => {
    if (drawingMode === 'region') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDrawingRegion({ startX: x, startY: y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (drawingMode === 'region' && drawingRegion) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawRegions();
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        drawingRegion.startX,
        drawingRegion.startY,
        x - drawingRegion.startX,
        y - drawingRegion.startY
      );
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (drawingMode === 'region' && drawingRegion) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRegion = {
        id: Date.now(),
        x: Math.min(drawingRegion.startX, x),
        y: Math.min(drawingRegion.startY, y),
        width: Math.abs(x - drawingRegion.startX),
        height: Math.abs(y - drawingRegion.startY),
      };
      
      setRegions(prev => [...prev, newRegion]);
      setDrawingRegion(null);
      setTaskDialogOpen(true);
    }
  };

  const drawRegions = () => {
    const ctx = canvasRef.current.getContext('2d');
    regions.forEach(region => {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(region.x, region.y, region.width, region.height);
    });
  };

  const handleApplyTask = async () => {
    if (!selectedTask || !selectedModel) return;

    try {
      const response = await fetch(`/api/recordings/${recordingId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: selectedTask,
          modelId: selectedModel,
          region: regions[regions.length - 1],
          filterSettings,
        }),
      });

      if (!response.ok) throw new Error('Failed to apply task');

      const result = await response.json();
      setAppliedTasks(prev => [...prev, result]);
      setTaskDialogOpen(false);
    } catch (error) {
      console.error('Error applying task:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const tools = [
    { id: 'line', name: 'Count Line', icon: <Timeline />, description: 'Draw a line to count objects crossing it' },
    { id: 'region', name: 'Focus Region', icon: <CropFree />, description: 'Define a region to focus analysis' },
    { id: 'filter', name: 'Filters', icon: <FilterList />, description: 'Apply visual filters to the video' },
    { id: 'query', name: 'Query Tools', icon: <Search />, description: 'Search and analyze video content' },
  ];

  const content = (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ position: 'relative', flexGrow: 1 }}>
            {/* Video Controls */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <IconButton onClick={togglePlay} size="small" sx={{ mr: 1 }}>
                {isPlaying ? <VideocamOff /> : <Videocam />}
              </IconButton>
              <IconButton onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>

            {/* Video Player */}
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
            
            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: drawingMode ? 'auto' : 'none',
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
          </Box>
          
          {/* Playback Controls */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton onClick={skipBackward}>
                <SkipPrevious />
              </IconButton>
              <IconButton onClick={togglePlay}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={skipForward}>
                <SkipNext />
              </IconButton>
              <Typography sx={{ ml: 1, mr: 2 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
              <Slider
                value={currentTime}
                max={duration}
                onChange={handleTimeSliderChange}
                sx={{ flexGrow: 1, mr: 2 }}
              />
              <FormControl sx={{ minWidth: 100 }}>
                <Select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(e.target.value)}
                  size="small"
                >
                  <MenuItem value={0.5}>0.5x</MenuItem>
                  <MenuItem value={1}>1x</MenuItem>
                  <MenuItem value={1.5}>1.5x</MenuItem>
                  <MenuItem value={2}>2x</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Tools Drawer */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={toolsOpen}
        sx={{
          width: TOOLS_DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: TOOLS_DRAWER_WIDTH,
            position: 'relative',
            border: 'none',
            borderLeft: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Tools" />
            <Tab label="Tasks" />
            <Tab label="Filters" />
            <Tab label="VLM" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <List>
            {tools.map((tool) => (
              <ListItem key={tool.id} disablePadding>
                <Tooltip title={tool.description} placement="left">
                  <ListItemText
                    primary={
                      <Button
                        startIcon={tool.icon}
                        onClick={() => handleToolClick(tool.id)}
                        variant={activeTools.includes(tool.id) || drawingMode === tool.id ? 'contained' : 'text'}
                        fullWidth
                      >
                        {tool.name}
                      </Button>
                    }
                  />
                </Tooltip>
              </ListItem>
            ))}
          </List>
        )}

        {currentTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Applied Tasks
            </Typography>
            {appliedTasks.map((task) => (
              <Chip
                key={task.id}
                label={task.name}
                onDelete={() => {/* TODO: Handle task removal */}}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        )}

        {currentTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Video Filters
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography>Brightness</Typography>
              <Slider
                value={filterSettings.brightness}
                onChange={(_, value) => setFilterSettings(prev => ({
                  ...prev,
                  brightness: value
                }))}
                min={0}
                max={200}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Contrast</Typography>
              <Slider
                value={filterSettings.contrast}
                onChange={(_, value) => setFilterSettings(prev => ({
                  ...prev,
                  contrast: value
                }))}
                min={0}
                max={200}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Saturation</Typography>
              <Slider
                value={filterSettings.saturation}
                onChange={(_, value) => setFilterSettings(prev => ({
                  ...prev,
                  saturation: value
                }))}
                min={0}
                max={200}
              />
            </Box>
          </Box>
        )}

        {currentTab === 3 && (
          <Box sx={{ p: 2 }}>
            <VLMConfig />
          </Box>
        )}

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            fullWidth
            onClick={() => {/* TODO: Save analysis */}}
          >
            Save Analysis
          </Button>
        </Box>
      </Drawer>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)}>
        <DialogTitle>Apply Task to Region</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Task</InputLabel>
            <Select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              label="Select Task"
            >
              {availableTasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Model</InputLabel>
            <Select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              label="Select Model"
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApplyTask} variant="contained">
            Apply Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <BaseWidget
      title="Arena Viewer"
      expandable={false}
      configurable={false}
      sx={{ height: '100%' }}
    >
      {content}
    </BaseWidget>
  );
};

export default ArenaViewer;
