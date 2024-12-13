import React, { useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIndicatorIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

const WidgetContainer = ({ id, title, children, onMove, index, controls = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('widgetIndex', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    const dragIndex = parseInt(e.dataTransfer.getData('widgetIndex'));
    if (dragIndex !== index) {
      onMove(dragIndex, index);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        m: 1,
        transition: 'all 0.3s ease',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          m: 0,
          borderRadius: 0,
        }),
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'move',
        }}
        draggable
        onDragStart={handleDragStart}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <IconButton size="small" sx={{ mr: 1 }}>
            <DragIndicatorIcon />
          </IconButton>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => {}}>
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <FullscreenIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => {}}>
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          height: expanded ? 'auto' : '0px',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
      >
        <Box sx={{ p: 2 }}>
          {children}
          {expanded && controls.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Widget Controls
              </Typography>
              {controls.map((control, index) => (
                <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                  • {control}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default WidgetContainer;
