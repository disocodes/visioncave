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
import BaseWidget from '../BaseWidget';

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

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          minHeight: '200px'
        }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <List 
        dense 
        sx={{ 
          maxHeight: '100%',
          overflow: 'auto',
          py: 0
        }}
      >
        {patientData.map((patient) => (
          <ListItem
            key={patient.id}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&:last-child': {
                mb: 0
              }
            }}
          >
            <ListItemIcon>
              {getStatusIcon(patient.status)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle2" component="div">
                  {patient.name}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  Room {patient.room} - {patient.condition}
                </Typography>
              }
            />
            <Chip
              label={patient.status.toUpperCase()}
              color={getStatusColor(patient.status)}
              size="small"
              sx={{ ml: 1 }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <BaseWidget
      title="Patient Monitor"
      summary={
        <Typography variant="body2" color="text.secondary">
          Monitoring {patientData.length} patients
        </Typography>
      }
    >
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderContent()}
      </Box>
    </BaseWidget>
  );
};

export default PatientMonitorWidget;
