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
  LocalHospital as HospitalIcon,
  MonitorHeart as MonitorIcon,
  People as StaffIcon
} from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { BASE_WIDGETS } from '../../config/baseWidgets';

// Import hospital widgets
import PatientFallDetectionWidget from '../../components/widgets/hospital/PatientFallDetectionWidget';
import PatientMonitorWidget from '../../components/widgets/hospital/PatientMonitorWidget';
import StaffTrackingWidget from '../../components/widgets/hospital/StaffTrackingWidget';

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
      recordingEnabled: true,
      retentionPeriod: 30
    }
  },
  {
    id: 'fall-detection',
    title: 'Patient Fall Detection',
    icon: <HospitalIcon />,
    type: 'fall_detection',
    config: {
      refreshInterval: 1,
      alertThreshold: 95,
      detectionSensitivity: 0.8,
      monitoredAreas: 'Ward A,Ward B,ICU',
      responseTimeout: 30
    }
  },
  {
    id: 'patient-monitor',
    title: 'Patient Monitoring',
    icon: <MonitorIcon />,
    type: 'patient_monitor',
    config: {
      refreshInterval: 10,
      alertThreshold: 85,
      vitalCheckInterval: 300,
      criticalConditions: 'Heart Rate,Blood Pressure,Oxygen Level',
      notificationGroups: 'Nurses,Doctors,Emergency'
    }
  },
  {
    id: 'staff-tracking',
    title: 'Staff Tracking',
    icon: <StaffIcon />,
    type: 'staff_tracking',
    config: {
      refreshInterval: 30,
      alertThreshold: 80,
      trackingRadius: 50,
      staffGroups: 'Doctors,Nurses,Support Staff',
      shiftDuration: 8
    }
  }
];

const HospitalVision = () => {
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
    setCurrentModule('hospital');
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
        module: 'hospital'
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
      title="Hospital Vision"
      actions={addWidgetButton}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const Widget = widget.type === 'camera_stream' ? BASE_WIDGETS[0].component :
                         widget.type === 'fall_detection' ? PatientFallDetectionWidget :
                         widget.type === 'patient_monitor' ? PatientMonitorWidget :
                         widget.type === 'staff_tracking' ? StaffTrackingWidget : null;
            
            if (!Widget) {
              console.warn(`No component found for widget type: ${widget.type}`);
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

export default HospitalVision;
