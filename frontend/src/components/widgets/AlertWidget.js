import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
} from '@mui/icons-material';

const AlertWidget = ({ moduleType }) => {
  // Sample alerts - in a real app, these would come from Redux or an API
  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Motion detected in restricted area',
      timestamp: '2 minutes ago',
    },
    {
      id: 2,
      type: 'error',
      message: 'Camera 2 connection lost',
      timestamp: '5 minutes ago',
    },
    {
      id: 3,
      type: 'info',
      message: 'System update available',
      timestamp: '10 minutes ago',
    },
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Info />;
    }
  };

  const getAlertChip = (type) => {
    return (
      <Chip
        label={type.toUpperCase()}
        size="small"
        color={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Recent Alerts
      </Typography>
      
      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id}>
            <ListItemIcon>
              {getAlertIcon(alert.type)}
            </ListItemIcon>
            <ListItemText
              primary={alert.message}
              secondary={alert.timestamp}
            />
            {getAlertChip(alert.type)}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AlertWidget;
