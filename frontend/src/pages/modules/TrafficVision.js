import React, { useEffect, useState } from 'react';
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
  Videocam as CameraIcon,
  Traffic as TrafficIcon,
  LocalParking as ParkingIcon,
  NotificationsActive as AlertIcon
} from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { getWidgetConfig } from '../../config/baseWidgets';

const MODULE_WIDGETS = [
  {
    id: 'camera',
    title: 'Camera Stream',
    icon: <CameraIcon />,
    type: 'camera_stream',
    config: {
      refreshInterval: 5,
      streamQuality: 'HD'
    }
  },
  {
    id: 'traffic',
    title: 'Traffic Flow',
    icon: <TrafficIcon />,
    type: 'traffic_flow',
    config: {
      refreshInterval: 15,
      congestionThreshold: 75
    }
  },
  {
    id: 'parking',
    title: 'Parking',
    icon: <ParkingIcon />,
    type: 'parking_occupancy',
    config: {
      refreshInterval: 30,
      fullThreshold: 95
    }
  },
  {
    id: 'alerts',
    title: 'Alerts',
    icon: <AlertIcon />,
    type: 'traffic_alerts',
    config: {
      refreshInterval: 10,
      alertTypes: 'accident,congestion,roadwork'
    }
  }
];

const TrafficVision = () => {
  const { widgets, setCurrentModule, createWidget, currentSiteId } = useWidget();
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentModule('traffic');
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
        module: 'traffic'
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

  return (
    <ModuleLayout 
      title="Traffic Vision"
      actions={addWidgetButton}
      error={error}
      onErrorClose={() => setError(null)}
    >
      <Box sx={{ p: 3, position: 'relative', minHeight: '100vh' }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const widgetConfig = getWidgetConfig(widget.type);
            if (!widgetConfig) return null;
            
            const Widget = widgetConfig.component;
            return (
              <Grid item xs={12} md={6} key={widget.id}>
                <WidgetContainer
                  id={widget.id}
                  title={widget.title}
                  index={index}
                  position={widget.position}
                  config={widget.config}
                  metrics={widget.metrics}
                  alerts={widget.alerts}
                >
                  <Widget config={widget.config} />
                </WidgetContainer>
              </Grid>
            );
          })}
        </Grid>

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
      </Box>
    </ModuleLayout>
  );
};

export default TrafficVision;
