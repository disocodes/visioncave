import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ZoneIcon from '@mui/icons-material/Room';

const OccupancyTrackingWidget = ({ socketUrl, isExpanded }) => {
  const [occupancyData, setOccupancyData] = useState([]);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    maxOccupancy: 50,
    warningThreshold: 80,
    criticalThreshold: 90,
    updateInterval: 5,
    enableAlerts: true,
    selectedZone: 'all',
  });

  useEffect(() => {
    const ws = new WebSocket(socketUrl || 'ws://localhost:8000/ws/occupancy');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'occupancy_update') {
        setCurrentOccupancy(data.current_occupancy);
        setOccupancyData(prevData => {
          const newData = [...prevData, {
            time: new Date().toLocaleTimeString(),
            occupancy: data.current_occupancy,
            capacity: settings.maxOccupancy,
          }];
          return newData.slice(-20); // Keep last 20 data points
        });
      }
      setLoading(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };

    return () => {
      ws.close();
    };
  }, [socketUrl, settings.maxOccupancy]);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const CollapsedView = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Box sx={{
          textAlign: 'center',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}>
          <Typography variant="h3">{currentOccupancy}</Typography>
          <Typography variant="subtitle1">Current Occupancy</Typography>
          <Typography variant="caption" color="textSecondary">
            {Math.round((currentOccupancy / settings.maxOccupancy) * 100)}% of capacity
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={occupancyData.slice(-10)}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="occupancy" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Grid>
    </Grid>
  );

  const ExpandedView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Box sx={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="occupancy" stroke="#8884d8" />
              <Line type="monotone" dataKey="capacity" stroke="#82ca9d" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Settings</Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Zone</InputLabel>
            <Select
              value={settings.selectedZone}
              onChange={(e) => handleSettingChange('selectedZone', e.target.value)}
            >
              <MenuItem value="all">All Zones</MenuItem>
              <MenuItem value="entrance">Entrance</MenuItem>
              <MenuItem value="lobby">Lobby</MenuItem>
              <MenuItem value="common">Common Areas</MenuItem>
            </Select>
          </FormControl>

          <Typography gutterBottom>Maximum Occupancy</Typography>
          <Slider
            value={settings.maxOccupancy}
            onChange={(_, value) => handleSettingChange('maxOccupancy', value)}
            min={10}
            max={200}
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />

          <Typography gutterBottom>Warning Threshold (%)</Typography>
          <Slider
            value={settings.warningThreshold}
            onChange={(_, value) => handleSettingChange('warningThreshold', value)}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Notifications</Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableAlerts}
                onChange={(e) => handleSettingChange('enableAlerts', e.target.checked)}
              />
            }
            label="Enable Alerts"
          />

          <TextField
            fullWidth
            type="number"
            label="Update Interval (minutes)"
            value={settings.updateInterval}
            onChange={(e) => handleSettingChange('updateInterval', parseInt(e.target.value))}
            sx={{ mt: 2 }}
          />

          <Button
            variant="contained"
            startIcon={<NotificationsIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            Test Alert
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isExpanded ? <ExpandedView /> : <CollapsedView />}
        </>
      )}
    </Box>
  );
};

export default OccupancyTrackingWidget;
