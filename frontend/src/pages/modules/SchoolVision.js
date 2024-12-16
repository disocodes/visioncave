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
  School as SchoolIcon,
  Park as PlaygroundIcon,
  Class as ClassroomIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { BASE_WIDGETS } from '../../config/baseWidgets';

// Import school widgets
import StudentAttendanceWidget from '../../components/widgets/school/StudentAttendanceWidget';
import PlaygroundSafetyWidget from '../../components/widgets/school/PlaygroundSafetyWidget';
import ClassroomAttentionWidget from '../../components/widgets/school/ClassroomAttentionWidget';

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
    id: 'attendance',
    title: 'Student Attendance',
    icon: <SchoolIcon />,
    type: 'student_attendance',
    config: {
      refreshInterval: 300,
      alertThreshold: 85,
      attendanceThreshold: 90,
      classGroups: 'Class A,Class B,Class C',
      reportingTime: '09:00'
    }
  },
  {
    id: 'playground',
    title: 'Playground Safety',
    icon: <PlaygroundIcon />,
    type: 'playground_safety',
    config: {
      refreshInterval: 10,
      alertThreshold: 90,
      crowdingThreshold: 25,
      safetyZones: 'Playground A,Playground B,Sports Field',
      supervisorCount: 2
    }
  },
  {
    id: 'classroom',
    title: 'Classroom Attention',
    icon: <ClassroomIcon />,
    type: 'classroom_attention',
    config: {
      refreshInterval: 30,
      alertThreshold: 70,
      attentionThreshold: 75,
      classroomCapacity: 30,
      monitoringPeriod: 45
    }
  }
];

const SchoolVision = () => {
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
    setCurrentModule('school');
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
        module: 'school'
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
      title="School Vision"
      actions={addWidgetButton}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const Widget = widget.type === 'camera_stream' ? BASE_WIDGETS[0].component :
                         widget.type === 'student_attendance' ? StudentAttendanceWidget :
                         widget.type === 'playground_safety' ? PlaygroundSafetyWidget :
                         widget.type === 'classroom_attention' ? ClassroomAttentionWidget : null;
            
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

export default SchoolVision;
