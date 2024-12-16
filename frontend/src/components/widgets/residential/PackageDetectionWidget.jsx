import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { LocalShipping as PackageIcon } from '@mui/icons-material';

const PackageDetectionWidget = ({ config }) => {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    let websocket = null;
    
    const connectWebSocket = () => {
      try {
        websocket = new WebSocket(config.socketUrl);

        websocket.onopen = () => {
          console.log('Package detection WebSocket connected');
          setError(null);
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'package_detection') {
              setPackages(prev => [data.package_id, ...prev].slice(0, 5));
            }
          } catch (err) {
            console.error('Error parsing package detection message:', err);
          }
        };

        websocket.onerror = (error) => {
          console.error('Package detection WebSocket error:', error);
          setError('Connection error. Retrying...');
        };

        websocket.onclose = () => {
          console.log('Package detection WebSocket closed');
          setError('Connection lost. Reconnecting...');
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        setWs(websocket);
      } catch (err) {
        console.error('Failed to connect to package detection WebSocket:', err);
        setError('Failed to connect. Retrying...');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [config.socketUrl]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PackageIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Package Detection</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {packages.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Recent Detections:
          </Typography>
          {packages.map((packageId, index) => (
            <Alert 
              key={index} 
              severity="info" 
              sx={{ mb: 1 }}
              icon={<PackageIcon />}
            >
              Package detected: {packageId}
            </Alert>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">
          No recent package detections
        </Typography>
      )}
    </Box>
  );
};

export default PackageDetectionWidget;
