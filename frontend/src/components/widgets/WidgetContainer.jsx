import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useWidget } from '../../contexts/WidgetContext';
import { widgetService } from '../../services/widgetService';

const WidgetContainer = ({ 
  id, 
  title, 
  children, 
  onMove, 
  index,
  siteId,
  position,
  config = {},
  metrics = [],
  alerts = []
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState(config);
  const { 
    setIsAnyWidgetFullscreen, 
    updateWidget,
    updateWidgetPosition,
    handleWidgetReorder,
    deleteWidget
  } = useWidget();

  // Load widget summary data
  React.useEffect(() => {
    const loadSummary = async () => {
      if (!isFullscreen) {
        try {
          setLoading(true);
          const data = await widgetService.getWidgetSummary(id);
          setSummary(data);
        } catch (error) {
          console.error('Failed to load widget summary:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSummary();
  }, [id, isFullscreen]);

  React.useEffect(() => {
    setIsAnyWidgetFullscreen(isFullscreen);
    return () => {
      setIsAnyWidgetFullscreen(false);
    };
  }, [isFullscreen, setIsAnyWidgetFullscreen]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('widgetIndex', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    const dragIndex = parseInt(e.dataTransfer.getData('widgetIndex'));
    if (dragIndex !== index) {
      handleWidgetReorder(dragIndex, index);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSave = async () => {
    try {
      await updateWidget(id, {
        config: widgetConfig,
        position: {
          ...position,
          isFullscreen
        }
      });
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Failed to save widget state:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWidget(id);
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  const handlePositionChange = async (newPosition) => {
    try {
      await updateWidgetPosition(id, newPosition);
    } catch (error) {
      console.error('Failed to update widget position:', error);
    }
  };

  const handleConfigChange = (field) => (event) => {
    setWidgetConfig(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const renderSummaryCards = () => {
    if (loading) {
      return <Typography>Loading summary...</Typography>;
    }

    const summaryData = summary || {
      metrics: metrics.length > 0 ? metrics : [
        { label: 'Status', value: 'Active' },
        { label: 'Last Updated', value: new Date().toLocaleTimeString() }
      ],
      alerts: alerts.length > 0 ? alerts : [
        { message: 'System running normally', severity: 'low' }
      ]
    };

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'background.paper', mb: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Metrics</Typography>
              </Box>
              <Grid container spacing={2}>
                {summaryData.metrics.map((metric, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="h6">
                      {metric.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Alerts</Typography>
              </Box>
              {summaryData.alerts.map((alert, index) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  color={alert.severity === 'high' ? 'error.main' : 'text.secondary'}
                  sx={{ mb: 0.5 }}
                >
                  • {alert.message}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        m: 1,
        cursor: isFullscreen ? 'default' : 'move',
      }}
      draggable={!isFullscreen}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {!isFullscreen && (
            <IconButton size="small" sx={{ mr: 1 }}>
              <DragIndicatorIcon />
            </IconButton>
          )}
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => setIsSettingsOpen(true)}>
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={handleSave}>
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {isFullscreen ? children : renderSummaryCards()}
      </Box>
    </Paper>
  );
};

export default WidgetContainer;
