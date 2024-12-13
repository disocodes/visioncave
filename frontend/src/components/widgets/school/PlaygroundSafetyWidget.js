import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Grid,
  Box,
  Paper,
  IconButton,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Map as MapIcon,
  NotificationsActive as AlertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayCircle as PlayIcon,
  PauseCircle as PauseIcon,
  Shield as ShieldIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CameraAlt as CameraIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Line, Scatter } from 'react-chartjs-2';
import BaseWidget from '../BaseWidget';

const PlaygroundSafetyWidget = () => {
  const [safetyData, setSafetyData] = useState({
    currentOccupancy: 45,
    maxCapacity: 60,
    activeAlerts: 2,
    averageSpeed: 3.2,
    zones: [
      { id: 'A', name: 'Swing Area', occupancy: 12, status: 'normal' },
      { id: 'B', name: 'Slide Zone', occupancy: 8, status: 'warning' },
      { id: 'C', name: 'Climbing Frame', occupancy: 15, status: 'normal' },
      { id: 'D', name: 'Sand Pit', occupancy: 10, status: 'normal' },
    ],
    recentEvents: [
      {
        id: 1,
        timestamp: '14:30:25',
        type: 'overcrowding',
        zone: 'Slide Zone',
        severity: 'warning',
        details: 'High density of children detected',
      },
      {
        id: 2,
        timestamp: '14:28:15',
        type: 'running',
        zone: 'Swing Area',
        severity: 'caution',
        details: 'Fast movement detected near swings',
      },
    ],
  });

  const [selectedZone, setSelectedZone] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [isStreaming, setIsStreaming] = useState(true);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef({
    isDrawing: false,
    startX: 0,
    startY: 0,
    zones: [],
  });

  useEffect(() => {
    initializeCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsStreaming(false);
    }
  };

  const toggleStream = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => {
        track.enabled = !isStreaming;
      });
      setIsStreaming(!isStreaming);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Draw safety zones
      drawingRef.current.zones.forEach(zone => {
        context.strokeStyle = zone.status === 'warning' ? '#ff9800' : '#4caf50';
        context.lineWidth = 2;
        context.strokeRect(zone.x, zone.y, zone.width, zone.height);
        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        context.fillText(zone.name, zone.x + 5, zone.y + 20);
      });

      const snapshot = canvasRef.current.toDataURL('image/jpeg');
      // TODO: Send snapshot to backend for safety analysis
    }
  };

  const handleMouseDown = (e) => {
    if (!isDrawingZone) return;
    const rect = canvasRef.current.getBoundingClientRect();
    drawingRef.current = {
      ...drawingRef.current,
      isDrawing: true,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDrawingZone || !drawingRef.current.isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw existing zones
    drawingRef.current.zones.forEach(zone => {
      ctx.strokeStyle = zone.status === 'warning' ? '#ff9800' : '#4caf50';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(zone.name, zone.x + 5, zone.y + 20);
    });

    // Draw current zone
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      drawingRef.current.startX,
      drawingRef.current.startY,
      currentX - drawingRef.current.startX,
      currentY - drawingRef.current.startY
    );
  };

  const handleMouseUp = (e) => {
    if (!isDrawingZone || !drawingRef.current.isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newZone = {
      x: drawingRef.current.startX,
      y: drawingRef.current.startY,
      width: endX - drawingRef.current.startX,
      height: endY - drawingRef.current.startY,
      name: `Zone ${drawingRef.current.zones.length + 1}`,
      status: 'normal',
    };

    drawingRef.current.zones.push(newZone);
    drawingRef.current.isDrawing = false;
    setIsDrawingZone(false);
  };

  const occupancyTrendData = {
    labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50'],
    datasets: [
      {
        label: 'Occupancy',
        data: [35, 42, 38, 45, 43, 45],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Max Capacity',
        data: [60, 60, 60, 60, 60, 60],
        fill: false,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const zoneActivityData = {
    datasets: [
      {
        label: 'Activity Hotspots',
        data: [
          { x: 2, y: 3, r: 15 },
          { x: 4, y: 1, r: 10 },
          { x: 3, y: 4, r: 8 },
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'success',
      warning: 'warning',
      danger: 'error',
      caution: 'info',
    };
    return colors[status] || 'default';
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
  };

  const summaryContent = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          icon={<GroupIcon />}
          label={`${safetyData.currentOccupancy}/${safetyData.maxCapacity}`}
          color="primary"
        />
        <Chip
          icon={<WarningIcon />}
          label={`${safetyData.activeAlerts} Alerts`}
          color={safetyData.activeAlerts > 0 ? "warning" : "success"}
        />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={monitoringActive}
            onChange={(e) => setMonitoringActive(e.target.checked)}
            color="success"
            size="small"
          />
        }
        label={monitoringActive ? 'Monitoring Active' : 'Monitoring Paused'}
      />
    </Box>
  );

  const expandedContent = (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Camera</InputLabel>
          <Select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            label="Camera"
          >
            <MenuItem value="all">All Cameras</MenuItem>
            <MenuItem value="cam1">Camera 1</MenuItem>
            <MenuItem value="cam2">Camera 2</MenuItem>
            <MenuItem value="cam3">Camera 3</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={toggleStream}>
          {isStreaming ? <VideocamOffIcon /> : <VideocamIcon />}
        </IconButton>
        <IconButton onClick={captureSnapshot}>
          <CameraIcon />
        </IconButton>
        <IconButton 
          onClick={() => setIsDrawingZone(!isDrawingZone)}
          color={isDrawingZone ? "primary" : "default"}
        >
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => setSettingsOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Camera Feed */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Live Camera Feed
            </Typography>
            <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: 'black' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: isStreaming ? 'block' : 'none'
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: isDrawingZone ? 'block' : 'none',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
              {!isStreaming && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white'
                }}>
                  <Typography>Camera Paused</Typography>
                </Box>
              )}
              {isDrawingZone && (
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  p: 1,
                  borderRadius: 1,
                }}>
                  <Typography variant="caption">
                    Click and drag to draw a safety zone
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Occupancy
                </Typography>
                <Typography variant="h4">
                  {safetyData.currentOccupancy}/{safetyData.maxCapacity}
                </Typography>
                <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Active Alerts
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {safetyData.activeAlerts}
                </Typography>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mt: 1 }} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Occupancy Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Occupancy Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={occupancyTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: safetyData.maxCapacity + 10,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Zone Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Zone Status
            </Typography>
            <List>
              {safetyData.zones.map((zone) => (
                <ListItem
                  key={zone.id}
                  button
                  onClick={() => handleZoneClick(zone)}
                >
                  <ListItemIcon>
                    <MapIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={zone.name}
                    secondary={`Occupancy: ${zone.occupancy}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={zone.status}
                      color={getStatusColor(zone.status)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Events
            </Typography>
            <List>
              {safetyData.recentEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    <AlertIcon color={getStatusColor(event.severity)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.details}
                    secondary={`${event.timestamp} - ${event.zone}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={event.severity}
                      color={getStatusColor(event.severity)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Safety Monitoring Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maximum Capacity"
                type="number"
                value={safetyData.maxCapacity}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Speed Threshold (m/s)"
                type="number"
                value="5"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Automatic Alerts"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Motion Detection"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Last updated: 2 minutes ago
        </Typography>
        <Button startIcon={<RefreshIcon />} size="small">
          Refresh
        </Button>
      </Box>
    </Box>
  );

  return (
    <BaseWidget
      title="Playground Safety Monitor"
      icon={<ShieldIcon />}
      summary={summaryContent}
      expandable={true}
    >
      {expandedContent}
    </BaseWidget>
  );
};

export default PlaygroundSafetyWidget;
