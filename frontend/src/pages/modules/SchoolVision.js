import React from 'react';
import { Box, Typography, IconButton, Grid, Paper, Divider } from '@mui/material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { 
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  DragIndicator as DragIndicatorIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import StudentAttendanceWidget from '../../components/widgets/school/StudentAttendanceWidget';
import PlaygroundSafetyWidget from '../../components/widgets/school/PlaygroundSafetyWidget';
import ClassroomAttentionWidget from '../../components/widgets/school/ClassroomAttentionWidget';

const WidgetHeader = ({ title, onExpand, onDragStart }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2,
      cursor: 'move'
    }}
    draggable
    onDragStart={onDragStart}
  >
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton size="small" sx={{ mr: 1 }}>
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <Typography variant="h6">{title}</Typography>
    </Box>
    <Box>
      <IconButton size="small" onClick={() => {}}>
        <SettingsIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={onExpand}>
        <FullscreenIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => {}}>
        <SaveIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

const ExpandedView = ({ widget }) => (
  <Box sx={{ mt: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Real-time Data
          </Typography>
          <Box sx={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
            {widget.component && <widget.component expanded={true} />}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Analytics
              </Typography>
              {widget.analytics?.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="h4">{item.value}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Alerts & Notifications
              </Typography>
              {widget.alerts?.map((alert, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" color={alert.severity === 'high' ? 'error' : 'text.secondary'}>
                    • {alert.message}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Controls & Settings</Typography>
          <Grid container spacing={2}>
            {widget.controls?.map((control, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {control}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

const SchoolVision = () => {
  const [expandedWidget, setExpandedWidget] = React.useState(null);
  const [widgets, setWidgets] = React.useState([
    {
      id: 'attendance',
      title: 'Student Attendance',
      component: StudentAttendanceWidget,
      controls: [
        'Attendance threshold',
        'Notification settings',
        'Report generation',
        'Alert configuration',
        'Data export options',
        'Visualization preferences'
      ],
      analytics: [
        { label: 'Present Today', value: '95%' },
        { label: 'Weekly Average', value: '92%' },
        { label: 'Monthly Trend', value: '+2.5%' }
      ],
      alerts: [
        { message: 'Class 10B attendance below threshold', severity: 'high' },
        { message: 'Weekly report generated', severity: 'low' }
      ]
    },
    {
      id: 'playground',
      title: 'Playground Safety',
      component: PlaygroundSafetyWidget,
      controls: [
        'Safety zones',
        'Alert settings',
        'Monitoring schedule',
        'Camera selection',
        'Detection sensitivity',
        'Response protocols'
      ],
      analytics: [
        { label: 'Safety Score', value: '98%' },
        { label: 'Active Zones', value: '5/6' },
        { label: 'Daily Incidents', value: '0' }
      ],
      alerts: [
        { message: 'Zone 3 monitoring active', severity: 'low' },
        { message: 'Equipment check scheduled', severity: 'low' }
      ]
    },
    {
      id: 'classroom',
      title: 'Classroom Attention',
      component: ClassroomAttentionWidget,
      controls: [
        'Attention metrics',
        'Alert thresholds',
        'Reporting preferences',
        'Class scheduling',
        'Analytics display',
        'Integration settings'
      ],
      analytics: [
        { label: 'Average Attention', value: '87%' },
        { label: 'Active Classes', value: '12' },
        { label: 'Peak Hours', value: '10AM' }
      ],
      alerts: [
        { message: 'High engagement in Class 8A', severity: 'low' },
        { message: 'Attention drop in Class 11C', severity: 'high' }
      ]
    }
  ]);

  const handleExpand = (widgetId) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('widgetIndex', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData('widgetIndex'));
    if (dragIndex === dropIndex) return;

    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedWidget);
    setWidgets(newWidgets);
  };

  return (
    <ModuleLayout title="School Vision">
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const isExpanded = expandedWidget === widget.id;
            const Widget = widget.component;

            return (
              <Grid item xs={12} md={isExpanded ? 12 : 6} lg={isExpanded ? 12 : 4} key={widget.id}>
                <Box
                  sx={{
                    height: isExpanded ? 'calc(100vh - 200px)' : '400px',
                    transition: 'all 0.3s ease',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 3,
                    p: 2,
                    ...(isExpanded && {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1000,
                      m: 3,
                      overflow: 'auto'
                    }),
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <WidgetHeader 
                    title={widget.title} 
                    onExpand={() => handleExpand(widget.id)}
                    onDragStart={(e) => handleDragStart(e, index)}
                  />
                  <Box sx={{ height: isExpanded ? 'calc(100% - 48px)' : '320px', overflow: 'auto' }}>
                    {isExpanded ? (
                      <ExpandedView widget={widget} />
                    ) : (
                      <Widget />
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </ModuleLayout>
  );
};

export default SchoolVision;
