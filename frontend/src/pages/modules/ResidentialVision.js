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
  Videocam as VideocamIcon,
  People as PeopleIcon,
  LocalShipping as PackageIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { BASE_WIDGETS } from '../../config/baseWidgets';
import { WS_BASE_URL } from '../../config';

// Import residential widgets
import OccupancyTrackingWidget from '../../components/widgets/residential/OccupancyTrackingWidget';
import PackageDetectionWidget from '../../components/widgets/residential/PackageDetectionWidget';
import ResidentialSecurityWidget from '../../components/widgets/residential/ResidentialSecurityWidget';

// Generate a unique client ID for websocket connections
const generateClientId = () => `client_${Math.random().toString(36).substr(2, 9)}`;

// Module-specific widgets with default configurations
const MODULE_WIDGETS = [
  {
    id: 'camera',
    title: 'Camera Stream',
    icon: <VideocamIcon />,
    type: 'camera_stream',
    config: {
      refreshInterval: 5,
      alertThreshold: 90,
      streamQuality: 'HD',
      enableAudio: true,
      recordStream: false
    }
  },
  {
    id: 'occupancy',
    title: 'Occupancy Tracking',
    icon: <PeopleIcon />,
    type: 'occupancy_tracking',
    config: {
      refreshInterval: 30,
      alertThreshold: 80,
      occupancyLimit: 10,
      zoneNames: 'Living Room,Kitchen,Entrance'
    }
  },
  {
    id: 'package',
    title: 'Package Detection',
    icon: <PackageIcon />,
    type: 'package_detection',
    config: {
      refreshInterval: 15,
      alertThreshold: 90,
      detectionConfidence: 0.8,
      notificationDelay: 5,
      socketUrl: `${WS_BASE_URL}/package-detection/${generateClientId()}`
    }
  },
  {
    id: 'security',
    title: 'Suspicious Activity Alert',
    icon: <SecurityIcon />,
    type: 'security_alert',
    config: {
      refreshInterval: 10,
      alertThreshold: 75,
      motionSensitivity: 0.6,
      restrictedZones: 'front door,back door,windows'
    }
  }
];

const ResidentialVision = () => {
  const { 
    widgets, 
    setCurrentModule, 
    createWidget, 
    handleWidgetReorder, 
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
      // For package detection widget, ensure socketUrl is set with a unique client ID
      const config = widget.type === 'package_detection' 
        ? { ...widget.config, socketUrl: `${WS_BASE_URL}/package-detection/${generateClientId()}` }
        : widget.config;

      await createWidget({
        name: widget.title,
        type: widget.type,
        site_id: currentSiteId,
        config,
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
    let Widget;
    let widgetProps = { config: widget.config };

    switch (widget.type) {
      case 'camera_stream':
        Widget = BASE_WIDGETS[0].component;
        break;
      case 'occupancy_tracking':
        Widget = OccupancyTrackingWidget;
        break;
      case 'package_detection':
        Widget = PackageDetectionWidget;
        // Ensure socketUrl is available with a unique client ID if not already set
        if (!widget.config?.socketUrl) {
          widgetProps = {
            config: {
              ...widget.config,
              socketUrl: `${WS_BASE_URL}/package-detection/${generateClientId()}`
            }
          };
        }
        break;
      case 'security_alert':
        Widget = ResidentialSecurityWidget;
        break;
      default:
        console.warn(`No component found for widget type: ${widget.type}`);
        return null;
    }

    if (!Widget) {
      console.error(`Widget component not found for type: ${widget.type}`);
      return null;
    }

    return (
      <Grid item xs={12} md={6} lg={4} key={widget.id}>
        <WidgetContainer
          id={widget.id}
          title={widget.title || widget.name}
          index={index}
          position={widget.position}
          config={widget.config}
          metrics={widget.metrics}
          alerts={widget.alerts}
          siteId={currentSiteId}
        >
          <Widget {...widgetProps} />
        </WidgetContainer>
      </Grid>
    );
  };

  return (
    <ModuleLayout 
      title="Residential Vision"
      actions={addWidgetButton}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => renderWidget(widget, index))}
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

export default ResidentialVision;
