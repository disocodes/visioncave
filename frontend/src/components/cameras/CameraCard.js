import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
} from '@mui/icons-material';

const CameraCard = ({ camera, onEdit, onDelete, onStream, onToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStreamToggle = () => {
    setIsStreaming(!isStreaming);
    onToggle(camera);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      error: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
        <Box
          component="img"
          src={camera.thumbnail || '/camera-placeholder.png'}
          alt={camera.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <Chip
            icon={<CircleIcon sx={{ fontSize: '14px !important' }} />}
            label={camera.status}
            color={getStatusColor(camera.status)}
            size="small"
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {camera.name}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">
              {camera.type}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1">
              {camera.location}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={isStreaming ? <VideocamOffIcon /> : <VideocamIcon />}
          onClick={() => onStream(camera)}
        >
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </Button>
        <IconButton
          size="small"
          onClick={handleMenuClick}
        >
          <MoreVertIcon />
        </IconButton>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onEdit(camera); handleMenuClose(); }}>
          Edit
        </MenuItem>
        <MenuItem onClick={handleStreamToggle}>
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </MenuItem>
        <MenuItem onClick={() => { onDelete(camera); handleMenuClose(); }}>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default CameraCard;
