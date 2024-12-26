import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  IconButton, 
  Tooltip, 
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  LocalShipping as PackageIcon,
  Security as SecurityIcon,
  People as OccupancyIcon,
  Videocam as CameraIcon
} from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { getWidgetConfig } from '../../config/baseWidgets';
import { WS_BASE_URL } from '../../config';

// Generate a unique client ID for websocket connections
const generateClientId = () => `client_${Math.random().toString(36).substr(2, 9)}`;

// Module-specific widgets with default configurations
const MODULE_WIDGETS = [
  {
    id: 'camera',
    title: 'Camera Stream',
    icon: <CameraIcon />,
    type: 'camera_stream',
    config: {
      refreshInterval: 5,
      alertThreshold: 90,
      streamQuality: 'HD'
    }
  },
  {
    id: 'package',
    title: 'Package Detection',
    icon: <PackageIcon />,
    type: 'package_detection',
    config: {
      refreshInterval: 5,
      alertThreshold: 85,
      detectionConfidence: 0.8,
      notifyOnDetection: true
    }
  },
  {
    id: 'security',
    title: 'Security Monitor',
    icon: <SecurityIcon />,
    type: 'residential_security',
    config: {
      refreshInterval: 5,
      alertThreshold: 95,
      motionSensitivity: 'medium',
      notifyOnMotion: true
    }
  },
  {
    id: 'occupancy',
    title: 'Occupancy Tracking',
    icon: <OccupancyIcon />,
    type: 'occupancy_tracking',
    config: {
      refreshInterval: 30,
      alertThreshold: 80,
      occupancyLimit: 10,
      trackingZones: 'entrance,living room,kitchen'
    }
  }
];

const ResidentialVision = () => {
  const { 
    widgets, 
    setCurrentModule, 
    createWidget, 
    currentSiteId 
  } = useWidget();
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentModule('residential');
  }, [setCurrentModule]);

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddWidget = async (widget) => {
    if (!currentSiteId) {
      setError('No site selected. Please select a site first.');
      return;
    }

    try {
      await createWidget({
        name: widget.title,
        type: widget.type,
        site_id: currentSiteId,
        config: widget.config,
        description: `${widget.title} widget for site ${currentSiteId}`,
        module: 'residential'
      });
      handleMenuClose();
    } catch (error) {
      console.error('Failed to add widget:', error);
      setError('Failed to add widget. Please try again.');
    }
  };

  const addWidgetButton = (
    <Tooltip title="Add Widget">
      <IconButton 
        color="primary"
        onClick={handleAddClick}
        size="large"
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          mr: 2
        }}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  );

  const renderWidget = (widget, index) => {
    const widgetConfig = getWidgetConfig(widget.type);
    if (!widgetConfig) {
      console.warn(`No configuration found for widget type: ${widget.type}`);
      return null;
    }

    const Widget = widgetConfig.component;
    const widgetProps = {
      config: widget.config
    };

    // Add socketUrl for package detection widgets
    if (widget.type === 'package_detection') {
      widgetProps.config = {
        ...widgetProps.config,
        socketUrl: `${WS_BASE_URL}/package-detection/${generateClientId()}`
      };
    }

    return (
      <Grid item xs={12} md={6} lg={4} key={widget.id}>
        <WidgetContainer
          id={widget.id}
          title={widget.title}
          index={index}
          position={widget.position}
          config={widget.config}
          metrics={widget.metrics}
          alerts={widget.alerts}
        >
          <Widget {...widgetProps} />
        </WidgetContainer>
      </Grid>
    );
  };

  return (
    <ModuleLayout 
      title="Residential Vision"
      module="residential"
      actions={addWidgetButton}
      error={error}
      onErrorClose={() => setError(null)}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => renderWidget(widget, index))}
        </Grid>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {MODULE_WIDGETS.map((widget) => (
          <MenuItem 
            key={widget.id}
            onClick={() => handleAddWidget(widget)}
            sx={{ minWidth: '200px' }}
          >
            <ListItemIcon>
              {widget.icon}
            </ListItemIcon>
            <ListItemText 
              primary={widget.title}
              secondary={
                <Typography variant="caption" color="text.secondary">
                  Click to add
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </ModuleLayout>
  );
};

export default ResidentialVision;
