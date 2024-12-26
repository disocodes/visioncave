import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Button,
  TextField,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Draw as DrawIcon,
  Build as ToolsIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  AddCircleOutline as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import recordingsService from '../../services/recordingsService';

const ArenaViewer = () => {
  const { recordingId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // State declarations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [regions, setRegions] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [models, setModels] = useState([]);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [storageProvider, setStorageProvider] = useState('local');
  const [vlmConfig, setVlmConfig] = useState({
    enabled: false,
    model: 'default',
    confidence: 0.5
  });
  const [filterConfig, setFilterConfig] = useState({
    timeRange: null,
    eventTypes: [],
    confidence: 0.5,
    regions: []
  });
  const [selectedModels, setSelectedModels] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    filters: false,
    regions: false,
    tasks: false,
    models: false,
    storage: false,
    vlm: false
  });

  useEffect(() => {
    if (!recordingId) {
      navigate('/recordings-list');
      return;
    }
    fetchRecordingData();
    setupCanvas();
    fetchAvailableModels();
  }, [recordingId, navigate]);

  const fetchAvailableModels = async () => {
    try {
      // Fetch available CV models (OpenCV, YOLO, etc.)
      const cvModels = await recordingsService.getAvailableModels();
      setModels(cvModels);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to load available models');
    }
  };

  const setupCanvas = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }
  };

  const fetchRecordingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get recording video URL
      const videoUrl = await recordingsService.getRecording(recordingId);
      setVideoUrl(videoUrl);
      
      // Get recording tasks
      const tasks = await recordingsService.getRecordingTasks(recordingId);
      setAppliedTasks(tasks || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recording data:', error);
      setError(error.message || 'Failed to load recording. Please try again.');
      setLoading(false);
    }
  };

  // Region drawing handlers
  const startDrawing = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentRegion({ x1: x, y1: y, x2: x, y2: y });
  };

  const draw = (e) => {
    if (!isDrawing || !currentRegion) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRegions();
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      currentRegion.x1,
      currentRegion.y1,
      x - currentRegion.x1,
      y - currentRegion.y1
    );
  };

  const endDrawing = (e) => {
    if (!isDrawing || !currentRegion) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRegion = {
      ...currentRegion,
      x2: x,
      y2: y,
      name: `Region ${regions.length + 1}`,
    };
    
    setRegions([...regions, newRegion]);
    setCurrentRegion(null);
    setIsDrawing(false);
  };

  const drawRegions = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    regions.forEach((region) => {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        region.x1,
        region.y1,
        region.x2 - region.x1,
        region.y2 - region.y1
      );
      
      // Draw region name
      ctx.fillStyle = '#00ff00';
      ctx.font = '12px Arial';
      ctx.fillText(region.name, region.x1, region.y1 - 5);
    });
  };

  // Cleanup video URL when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleSectionExpand = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleBack = () => {
    navigate('/recordings-list');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="info" 
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Back to Recordings
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3}>
        <Toolbar>
          <IconButton edge="start" onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Arena Viewer
          </Typography>
          <IconButton onClick={() => setToolsOpen(true)}>
            <ToolsIcon />
          </IconButton>
        </Toolbar>
      </Paper>

      <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: 'black' }}>
        <video
          ref={videoRef}
          controls
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          src={videoUrl}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: isDrawing ? 'auto' : 'none',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
        />
      </Box>

      <Drawer
        anchor="right"
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 320 } }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tools
          </Typography>
          <IconButton onClick={() => setToolsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {/* Filters Section */}
          <ListItem button onClick={() => handleSectionExpand('filters')}>
            <ListItemIcon>
              <FilterIcon />
            </ListItemIcon>
            <ListItemText primary="Filters" />
            {expandedSections.filters ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedSections.filters} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <TextField
                  label="Time Range"
                  type="datetime-local"
                  value={filterConfig.timeRange}
                  onChange={(e) => setFilterConfig({
                    ...filterConfig,
                    timeRange: e.target.value
                  })}
                  fullWidth
                  size="small"
                />
              </ListItem>
              <ListItem>
                <TextField
                  label="Confidence Threshold"
                  type="number"
                  value={filterConfig.confidence}
                  onChange={(e) => setFilterConfig({
                    ...filterConfig,
                    confidence: parseFloat(e.target.value)
                  })}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  fullWidth
                  size="small"
                />
              </ListItem>
            </List>
          </Collapse>

          {/* Regions Section */}
          <ListItem button onClick={() => handleSectionExpand('regions')}>
            <ListItemIcon>
              <DrawIcon />
            </ListItemIcon>
            <ListItemText primary="Regions" />
            {expandedSections.regions ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedSections.regions} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() => setIsDrawing(true)}
                  fullWidth
                >
                  Draw Region
                </Button>
              </ListItem>
              {regions.map((region, index) => (
                <ListItem key={index}>
                  <TextField
                    size="small"
                    value={region.name}
                    onChange={(e) => {
                      const newRegions = [...regions];
                      newRegions[index].name = e.target.value;
                      setRegions(newRegions);
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      const newRegions = regions.filter((_, i) => i !== index);
                      setRegions(newRegions);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Tasks Section */}
          <ListItem button onClick={() => handleSectionExpand('tasks')}>
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Tasks" />
            {expandedSections.tasks ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedSections.tasks} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {appliedTasks.map((task) => (
                <ListItem key={task.id} button>
                  <ListItemText 
                    primary={task.name}
                    secondary={`Status: ${task.status}`}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Models Section */}
          <ListItem button onClick={() => handleSectionExpand('models')}>
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Models" />
            {expandedSections.models ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedSections.models} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {models.map((model) => (
                <ListItem key={model.id}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{model.name}</InputLabel>
                    <Select
                      value={selectedModels.includes(model.id)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedModels([...selectedModels, model.id]);
                        } else {
                          setSelectedModels(selectedModels.filter(id => id !== model.id));
                        }
                      }}
                    >
                      <MenuItem value={false}>Disabled</MenuItem>
                      <MenuItem value={true}>Enabled</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Storage Provider Section */}
          <ListItem button onClick={() => handleSectionExpand('storage')}>
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Storage" />
            {expandedSections.storage ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedSections.storage} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <FormControl fullWidth size="small">
                  <InputLabel>Storage Provider</InputLabel>
                  <Select
                    value={storageProvider}
                    onChange={(e) => setStorageProvider(e.target.value)}
                  >
                    <MenuItem value="local">Local Storage</MenuItem>
                    <MenuItem value="google-drive">Google Drive</MenuItem>
                    <MenuItem value="aws-s3">AWS S3</MenuItem>
                    <MenuItem value="nextcloud">Nextcloud</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            </List>
          </Collapse>

          {/* VLM Tools Section */}
          <ListItem button onClick={() => handleSectionExpand('vlm')}>
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="VLM Tools" />
            {expandedSections.vlm ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={expandedSections.vlm} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <FormControl fullWidth size="small">
                  <InputLabel>VLM Model</InputLabel>
                  <Select
                    value={vlmConfig.model}
                    onChange={(e) => setVlmConfig({
                      ...vlmConfig,
                      model: e.target.value
                    })}
                  >
                    <MenuItem value="default">Default Model</MenuItem>
                    <MenuItem value="custom">Custom Model</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
              <ListItem>
                <TextField
                  label="Confidence Threshold"
                  type="number"
                  value={vlmConfig.confidence}
                  onChange={(e) => setVlmConfig({
                    ...vlmConfig,
                    confidence: parseFloat(e.target.value)
                  })}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  fullWidth
                  size="small"
                />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Drawer>
    </Box>
  );
};

export default ArenaViewer;
