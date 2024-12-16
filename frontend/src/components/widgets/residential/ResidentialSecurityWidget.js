import React, { useState, useEffect } from 'react';
import { Typography, Grid, Alert, CircularProgress } from '@mui/material';
import { getSecurityStatus, getSecurityEvents } from '../../../services/residentialService';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useWidget } from '../../../contexts/WidgetContext';
import { widgetService } from '../../../services/widgetService';
import WidgetContainer from '../WidgetContainer';

const ResidentialSecurityWidget = ({ siteId, widgetId, position }) => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { updateWidget } = useWidget();
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

        // Update widget metrics and alerts
        if (widgetId) {
          // Add metrics
          await widgetService.addMetric(widgetId, {
            label: 'Perimeter Status',
            value: statusRes.data.perimeter_status.toUpperCase()
          });
          await widgetService.addMetric(widgetId, {
            label: 'Camera Status',
            value: statusRes.data.camera_status.toUpperCase()
          });

          // Add latest event as alert if it's a security concern
          const latestEvent = eventsRes.data[0];
          if (latestEvent && ['medium', 'high'].includes(latestEvent.severity)) {
            await widgetService.addAlert(widgetId, {
              message: latestEvent.message,
              severity: latestEvent.severity,
              status: 'active'
            });
          }

          // Update widget configuration
          await updateWidget(widgetId, {
            config: {
              lastStatus: statusRes.data,
              lastUpdate: new Date().toISOString()
            }
          });
        }
      } catch (err) {
        setError('Failed to fetch security data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up periodic refresh
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [siteId, widgetId, updateWidget]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'security_update') {
          setSecurityStatus(prev => ({ ...prev, ...data.status }));
          
          // Update widget metrics
          if (widgetId) {
            await widgetService.addMetric(widgetId, {
              label: 'Perimeter Status',
              value: data.status.perimeter_status.toUpperCase()
            });
            await widgetService.addMetric(widgetId, {
              label: 'Camera Status',
              value: data.status.camera_status.toUpperCase()
            });
          }
        } else if (data.type === 'new_event') {
          setEvents(prev => [data.event, ...prev.slice(0, 4)]);
          
          // Add new event as alert if it's a security concern
          if (widgetId && ['medium', 'high'].includes(data.event.severity)) {
            await widgetService.addAlert(widgetId, {
              message: data.event.message,
              severity: data.event.severity,
              status: 'active'
            });
          }
        }
      };
    }
  }, [ws, widgetId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!securityStatus) return null;

  const metrics = [
    {
      label: 'Perimeter Status',
      value: securityStatus.perimeter_status.toUpperCase()
    },
    {
      label: 'Camera Status',
      value: securityStatus.camera_status.toUpperCase()
    }
  ];

  const alerts = events
    .filter(event => ['medium', 'high'].includes(event.severity))
    .map(event => ({
      message: event.message,
      severity: event.severity
    }));

  const content = (
    <>
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
    </>
  );

  return (
    <WidgetContainer
      id={widgetId}
      title="Security Status"
      siteId={siteId}
      position={position}
      metrics={metrics}
      alerts={alerts}
    >
      {content}
    </WidgetContainer>
  );
};

export default ResidentialSecurityWidget;
