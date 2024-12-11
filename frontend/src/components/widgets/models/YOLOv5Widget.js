import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  CenterFocusStrong,
  Settings,
  Fullscreen,
  Close,
  CropFree,
  PhotoCamera
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const DetectionBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: '4px',
  pointerEvents: 'none',
  '&::before': {
    content: 'attr(data-label)',
    position: 'absolute',
    top: '-20px',
    left: '-2px',
    padding: '2px 4px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '12px',
    borderRadius: '2px',
  },
}));

const YOLOv5Widget = ({ 
  title = 'YOLOv5 Detection',
  streamUrl,
  config = {},
  onClose,
  onSettings,
  onFullscreen
}) => {
  const [detections, setDetections] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [fps, setFps] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Connect to WebSocket for real-time detections
    const ws = new WebSocket(streamUrl);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'yolov5_detection') {
        setDetections(data.data.detections);
        setLastUpdate(new Date());
        
        // Calculate FPS
        const now = performance.now();
        if (lastUpdate) {
          const timeDiff = now - lastUpdate;
          setFps(Math.round(1000 / timeDiff));
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [streamUrl]);

  return (
    <StyledCard>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CenterFocusStrong color="primary" />
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={onSettings}>
            <Settings />
          </IconButton>
          <IconButton size="small" onClick={onFullscreen}>
            <Fullscreen />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, position: 'relative', p: '8px !important' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          {/* Video Stream */}
          <img
            src={streamUrl}
            alt="Video Stream"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />

          {/* Detection Boxes */}
          {detections.map((detection, index) => (
            <DetectionBox
              key={index}
              style={{
                left: `${detection.bbox[0]}%`,
                top: `${detection.bbox[1]}%`,
                width: `${detection.bbox[2] - detection.bbox[0]}%`,
                height: `${detection.bbox[3] - detection.bbox[1]}%`,
              }}
              data-label={`${detection.class} ${Math.round(detection.confidence * 100)}%`}
            />
          ))}
        </Box>
      </CardContent>

      <Box sx={{ p: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            size="small"
            icon={<PhotoCamera />}
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
          />
          <Chip
            size="small"
            icon={<CropFree />}
            label={`Objects: ${detections.length}`}
            color="primary"
          />
          <Chip
            size="small"
            label={`${fps} FPS`}
            color="secondary"
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={isConnected ? 100 : 0}
          sx={{ height: 2 }}
        />
      </Box>
    </StyledCard>
  );
};

export default YOLOv5Widget;
