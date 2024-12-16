import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  FullscreenExit,
  Fullscreen,
  Settings,
} from '@mui/icons-material';
import { useWidget } from '../../contexts/WidgetContext';

const CameraStreamWidget = ({ config = {} }) => {
  const { currentModule } = useWidget();
  const [isStreaming, setIsStreaming] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('camera1');
  const [streamQuality, setStreamQuality] = useState(config.streamQuality || 'HD');

  // Update stream quality when config changes
  useEffect(() => {
    if (config.streamQuality) {
      setStreamQuality(config.streamQuality);
    }
  }, [config.streamQuality]);

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCameraChange = (camera) => {
    setSelectedCamera(camera);
  };

  const handleQualityChange = (event) => {
    setStreamQuality(event.target.value);
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Stream Controls */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton onClick={toggleStream} size="small" sx={{ mr: 1 }}>
          {isStreaming ? <VideocamOff /> : <Videocam />}
        </IconButton>
        <IconButton onClick={toggleFullscreen} size="small">
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>

      {/* Stream Display */}
      <Box
        sx={{
          height: 'calc(100% - 80px)', // Account for controls at bottom
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {isStreaming ? (
          <>
            <Box
              component="img"
              src={`/api/stream/${currentModule}/${selectedCamera}?quality=${streamQuality}`}
              alt="Camera Stream"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Stream Info Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              {streamQuality} • {selectedCamera}
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Stream paused
          </Typography>
        )}
      </Box>

      {/* Camera Controls */}
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: selectedCamera === 'camera1' ? 'primary.main' : 'background.paper',
              color: selectedCamera === 'camera1' ? 'white' : 'text.primary',
              '&:hover': { bgcolor: selectedCamera === 'camera1' ? 'primary.dark' : 'action.hover' },
            }}
            onClick={() => handleCameraChange('camera1')}
          >
            <Typography variant="body2">Camera 1</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: selectedCamera === 'camera2' ? 'primary.main' : 'background.paper',
              color: selectedCamera === 'camera2' ? 'white' : 'text.primary',
              '&:hover': { bgcolor: selectedCamera === 'camera2' ? 'primary.dark' : 'action.hover' },
            }}
            onClick={() => handleCameraChange('camera2')}
          >
            <Typography variant="body2">Camera 2</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: selectedCamera === 'camera3' ? 'primary.main' : 'background.paper',
              color: selectedCamera === 'camera3' ? 'white' : 'text.primary',
              '&:hover': { bgcolor: selectedCamera === 'camera3' ? 'primary.dark' : 'action.hover' },
            }}
            onClick={() => handleCameraChange('camera3')}
          >
            <Typography variant="body2">Camera 3</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <Select
              value={streamQuality}
              onChange={handleQualityChange}
              variant="outlined"
              sx={{ height: '40px' }}
            >
              <MenuItem value="HD">HD</MenuItem>
              <MenuItem value="4K">4K</MenuItem>
              <MenuItem value="8K">8K</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CameraStreamWidget;
