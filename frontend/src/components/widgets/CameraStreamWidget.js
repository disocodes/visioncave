import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  FullscreenExit,
  Fullscreen,
} from '@mui/icons-material';

const CameraStreamWidget = ({ moduleType }) => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton onClick={toggleStream} size="small" sx={{ mr: 1 }}>
          {isStreaming ? <VideocamOff /> : <Videocam />}
        </IconButton>
        <IconButton onClick={toggleFullscreen} size="small">
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>

      <Box
        sx={{
          height: '100%',
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isStreaming ? (
          <Box
            component="img"
            src={`/api/stream/${moduleType}/camera1`}
            alt="Camera Stream"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Typography variant="body1" color="text.secondary">
            Stream paused
          </Typography>
        )}
      </Box>

      {/* Camera Controls */}
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="body2">Camera 1</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="body2">Camera 2</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="body2">Camera 3</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CameraStreamWidget;
