import React, { useState, useEffect } from 'react';
import { Typography, Grid, Alert, CircularProgress } from '@mui/material';
import { getSecurityStatus, getSecurityEvents } from '../../../services/residentialService';
import { useWebSocket } from '../../../hooks/useWebSocket';
import BaseWidget from '../BaseWidget';

const ResidentialSecurityWidget = ({ siteId }) => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ws = useWebSocket(`ws://localhost:5000/ws/residential/${siteId}/security`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statusRes, eventsRes] = await Promise.all([
          getSecurityStatus(siteId),
          getSecurityEvents(siteId, { limit: 5 })
        ]);
        setSecurityStatus(statusRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        setError('Failed to fetch security data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'security_update') {
          setSecurityStatus(prev => ({ ...prev, ...data.status }));
        } else if (data.type === 'new_event') {
          setEvents(prev => [data.event, ...prev.slice(0, 4)]);
        }
      };
    }
  }, [ws]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!securityStatus) return null;

  const summary = (
    <Typography variant="body2" color="text.secondary">
      Status: {securityStatus.perimeter_status === 'secure' ? 'Secure' : 'Alert'}
    </Typography>
  );

  return (
    <BaseWidget
      title="Security Status"
      summary={summary}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Perimeter Status</Typography>
          <Typography color={securityStatus.perimeter_status === 'secure' ? 'success.main' : 'error.main'}>
            {securityStatus.perimeter_status.toUpperCase()}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Camera Status</Typography>
          <Typography color={securityStatus.camera_status === 'online' ? 'success.main' : 'error.main'}>
            {securityStatus.camera_status.toUpperCase()}
          </Typography>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Recent Events
      </Typography>
      {events.map((event, index) => (
        <Alert 
          key={event.id || index}
          severity={event.severity}
          sx={{ mb: 1 }}
        >
          {event.message}
        </Alert>
      ))}
    </BaseWidget>
  );
};

export default ResidentialSecurityWidget;
