import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Box,
  Paper,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  PersonOff as FallIcon,
  Timer as TimerIcon,
  NotificationsActive as AlertIcon,
  Refresh as RefreshIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Line, Pie } from 'react-chartjs-2';
import BaseWidget from '../BaseWidget';

const PatientFallDetectionWidget = () => {
  const dispatch = useDispatch();
  const [fallData, setFallData] = useState({
    totalPatients: 45,
    activeAlerts: 2,
    averageResponseTime: '45s',
    detectedFalls: 3,
    rooms: [
      { id: '101', name: 'Room 101', status: 'normal', patient: 'John Doe' },
      { id: '102', name: 'Room 102', status: 'alert', patient: 'Jane Smith' },
      { id: '103', name: 'Room 103', status: 'normal', patient: 'Bob Johnson' },
    ],
    recentEvents: [
      {
        id: 1,
        timestamp: '14:30:25',
        room: '102',
        patient: 'Jane Smith',
        type: 'fall',
        status: 'active',
        responseTime: '30s',
      },
      {
        id: 2,
        timestamp: '14:15:10',
        room: '105',
        patient: 'Mike Brown',
        type: 'fall',
        status: 'resolved',
        responseTime: '45s',
      },
    ],
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('all');

  useEffect(() => {
    // Fetch fall detection data from backend
    // dispatch(fetchFallData());
  }, []);

  const fallDistributionData = {
    labels: ['Normal Activity', 'Near Falls', 'Detected Falls'],
    datasets: [
      {
        data: [85, 12, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const responseTimeTrendData = {
    labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50'],
    datasets: [
      {
        label: 'Response Time (seconds)',
        data: [55, 48, 42, 45, 40, 45],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'success',
      alert: 'error',
      warning: 'warning',
      active: 'error',
      resolved: 'success',
    };
    return colors[status] || 'default';
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const renderContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Camera</InputLabel>
          <Select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            label="Camera"
          >
            <MenuItem value="all">All Cameras</MenuItem>
            <MenuItem value="floor1">Floor 1</MenuItem>
            <MenuItem value="floor2">Floor 2</MenuItem>
            <MenuItem value="floor3">Floor 3</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {/* Summary Cards */}
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <HospitalIcon sx={{ fontSize: 24, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">{fallData.totalPatients}</Typography>
            <Typography variant="caption">Monitored Patients</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 24, color: 'error.main', mb: 1 }} />
            <Typography variant="h6" color="error.main">
              {fallData.activeAlerts}
            </Typography>
            <Typography variant="caption">Active Alerts</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <TimerIcon sx={{ fontSize: 24, color: 'info.main', mb: 1 }} />
            <Typography variant="h6">{fallData.averageResponseTime}</Typography>
            <Typography variant="caption">Avg Response Time</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <FallIcon sx={{ fontSize: 24, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6">{fallData.detectedFalls}</Typography>
            <Typography variant="caption">Detected Falls</Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Activity Distribution
            </Typography>
            <Box sx={{ height: 'calc(100% - 24px)' }}>
              <Pie
                data={fallDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Response Time Trend
            </Typography>
            <Box sx={{ height: 'calc(100% - 24px)' }}>
              <Line
                data={responseTimeTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Lists */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '300px', overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Room Status
            </Typography>
            <List dense>
              {fallData.rooms.map((room) => (
                <ListItem
                  key={room.id}
                  button
                  onClick={() => handleRoomClick(room)}
                >
                  <ListItemIcon>
                    <RoomIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={room.name}
                    secondary={`Patient: ${room.patient}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={room.status}
                      color={getStatusColor(room.status)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '300px', overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Events
            </Typography>
            <List dense>
              {fallData.recentEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    <AlertIcon color={getStatusColor(event.status)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${event.type.toUpperCase()} - ${event.patient}`}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {event.room}
                        </Typography>
                        {` - ${event.timestamp}`}
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Response Time">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          {event.responseTime}
                        </Typography>
                      </Tooltip>
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Last updated: 2 minutes ago
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          size="small"
          onClick={() => {
            // dispatch(fetchFallData());
          }}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );

  const settingsContent = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Alert Threshold"
          type="number"
          defaultValue={75}
          helperText="Confidence threshold for fall detection (%)"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Response Time Threshold"
          type="number"
          defaultValue={60}
          helperText="Maximum response time in seconds"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Automatic Alerts"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Night Mode Detection"
        />
      </Grid>
    </Grid>
  );

  return (
    <BaseWidget
      title="Patient Fall Detection"
      summary={
        <Typography variant="body2" color="text.secondary">
          Monitoring {fallData.totalPatients} patients with {fallData.activeAlerts} active alerts
        </Typography>
      }
      configurable
      settings={settingsContent}
    >
      {renderContent()}
    </BaseWidget>
  );
};

export default PatientFallDetectionWidget;
