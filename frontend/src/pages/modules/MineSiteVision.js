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
  DirectionsCar as CarIcon,
  Security as SecurityIcon,
  Map as MapIcon
} from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { BASE_WIDGETS } from '../../config/baseWidgets';

// Import mine site widgets
import HeavyMachineryTrackingWidget from '../../components/widgets/mine/HeavyMachineryTrackingWidget';
import SafetyMonitorWidget from '../../components/widgets/SafetyMonitorWidget';
import ZoneManagementWidget from '../../components/widgets/ZoneManagementWidget';

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
      streamQuality: 'HD'
    }
  },
  {
    id: 'machinery',
    title: 'Heavy Machinery Tracking',
    icon: <CarIcon />,
    type: 'machinery_tracking',
    config: {
      refreshInterval: 10,
      alertThreshold: 85,
      proximityThreshold: 20,
      vehicleTypes: 'excavator,dump truck,loader',
      maintenanceInterval: 24,
      fuelMonitoring: true
    }
  },
  {
    id: 'safety',
    title: 'Safety Monitor',
    icon: <SecurityIcon />,
    type: 'safety_monitor',
    config: {
      refreshInterval: 5,
      alertThreshold: 95,
      hazardLevel: 'medium',
      monitoredConditions: 'gas,dust,temperature',
      evacuationZones: 'A,B,C',
      gasMonitoring: true
    }
  },
  {
    id: 'zones',
    title: 'Zone Management',
    icon: <MapIcon />,
    type: 'zone_management',
    config: {
      refreshInterval: 30,
      alertThreshold: 80,
      zoneUpdateInterval: 300,
      restrictedAreas: 'blast zone,hazardous materials,heavy machinery',
      accessLevels: 'worker,supervisor,manager',
      blastZones: 'north quarry,south pit'
    }
  }
];

const MineSiteVision = () => {
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
    setCurrentModule('mine');
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
        module: 'mine'
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
      title="Mine Site Vision"
      actions={addWidgetButton}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const Widget = widget.type === 'camera_stream' ? BASE_WIDGETS[0].component :
                         widget.type === 'machinery_tracking' ? HeavyMachineryTrackingWidget :
                         widget.type === 'safety_monitor' ? SafetyMonitorWidget :
                         widget.type === 'zone_management' ? ZoneManagementWidget : null;
            
            if (!Widget) {
              console.warn(`No component found for widget type: ${widget.type}`);
              return null;
            }
            
            return (
              <Grid item xs={12} md={6} key={widget.id}>
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

export default MineSiteVision;
