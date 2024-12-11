import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import { Add as AddIcon, Settings as SettingsIcon } from '@mui/icons-material';

// Import base widgets
import CameraStreamWidget from '../components/widgets/CameraStreamWidget';
import AnalyticsDashboardWidget from '../components/widgets/AnalyticsDashboardWidget';
import SafetyMonitorWidget from '../components/widgets/SafetyMonitorWidget';
import AlertWidget from '../components/widgets/AlertWidget';

// Import module-specific widgets
import { ResidentialSecurityWidget } from '../components/widgets/residential';
import { SchoolAttendanceWidget } from '../components/widgets/school';
import { PatientMonitorWidget, StaffTrackingWidget } from '../components/widgets/hospital';

const moduleConfigs = {
  residential: {
    title: 'Residential Vision Dashboard',
    widgets: [
      { id: 'camera', component: CameraStreamWidget, title: 'Live Camera Feed', w: 6, h: 4 },
      { id: 'analytics', component: AnalyticsDashboardWidget, title: 'Analytics Overview', w: 6, h: 4 },
      { id: 'security', component: ResidentialSecurityWidget, title: 'Security Status', w: 4, h: 3 },
      { id: 'alerts', component: AlertWidget, title: 'Security Alerts', w: 4, h: 3 },
    ],
  },
  school: {
    title: 'School Vision Dashboard',
    widgets: [
      { id: 'camera', component: CameraStreamWidget, title: 'Live Camera Feed', w: 6, h: 4 },
      { id: 'analytics', component: AnalyticsDashboardWidget, title: 'Analytics Overview', w: 6, h: 4 },
      { id: 'attendance', component: SchoolAttendanceWidget, title: 'Student Attendance', w: 4, h: 3 },
      { id: 'safety', component: SafetyMonitorWidget, title: 'Safety Monitor', w: 4, h: 3 },
    ],
  },
  hospital: {
    title: 'Hospital Vision Dashboard',
    widgets: [
      { id: 'camera', component: CameraStreamWidget, title: 'Live Camera Feed', w: 6, h: 4 },
      { id: 'analytics', component: AnalyticsDashboardWidget, title: 'Analytics Overview', w: 6, h: 4 },
      { id: 'patients', component: PatientMonitorWidget, title: 'Patient Monitoring', w: 6, h: 3 },
      { id: 'staff', component: StaffTrackingWidget, title: 'Staff Tracking', w: 6, h: 3 },
      { id: 'safety', component: SafetyMonitorWidget, title: 'Safety Monitor', w: 4, h: 3 },
      { id: 'alerts', component: AlertWidget, title: 'Medical Alerts', w: 4, h: 3 },
    ],
  },
};

const Dashboard = () => {
  const { moduleType } = useParams();
  const navigate = useNavigate();
  const [activeWidgets, setActiveWidgets] = useState([]);

  useEffect(() => {
    if (!moduleType || !moduleConfigs[moduleType]) {
      navigate('/');
      return;
    }
    setActiveWidgets(moduleConfigs[moduleType].widgets);
  }, [moduleType, navigate]);

  if (!moduleType || !moduleConfigs[moduleType]) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{moduleConfigs[moduleType].title}</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            Add Widget
          </Button>
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {activeWidgets.map((widget) => {
          const WidgetComponent = widget.component;
          return (
            <Grid item xs={12} md={widget.w} key={widget.id}>
              <Paper
                sx={{
                  p: 2,
                  height: widget.h * 100,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {widget.title}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <WidgetComponent moduleType={moduleType} />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Dashboard;
