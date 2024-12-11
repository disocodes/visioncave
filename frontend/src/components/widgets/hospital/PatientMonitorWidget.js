import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAnalytics } from '../../../contexts/AnalyticsContext';

const PatientMonitorWidget = () => {
  const { analytics, loading } = useAnalytics();
  const [patientData, setPatientData] = useState([]);

  useEffect(() => {
    if (analytics.patientMonitoring) {
      setPatientData(analytics.patientMonitoring.patients || []);
    }
  }, [analytics]);

  const getStatusColor = (status) => {
    const colors = {
      normal: 'success',
      warning: 'warning',
      critical: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <CheckCircleIcon color="success" />;
      case 'warning':
      case 'critical':
        return <ErrorIcon color={status === 'warning' ? 'warning' : 'error'} />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <List dense>
        {patientData.map((patient) => (
          <ListItem
            key={patient.id}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>
              {getStatusIcon(patient.status)}
            </ListItemIcon>
            <ListItemText
              primary={patient.name}
              secondary={`Room ${patient.room} - ${patient.condition}`}
            />
            <Chip
              label={patient.status.toUpperCase()}
              color={getStatusColor(patient.status)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PatientMonitorWidget;
