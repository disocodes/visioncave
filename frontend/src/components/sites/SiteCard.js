import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoCam as VideoCamIcon,
  LocationOn as LocationIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';

const SiteCard = ({ site, onEdit, onDelete, onManage }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      maintenance: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {site.name}
          </Typography>
          <Chip
            icon={<CircleIcon sx={{ fontSize: '14px !important' }} />}
            label={site.status}
            color={getStatusColor(site.status)}
            size="small"
          />
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
          {site.address}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">
              {site.type}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Cameras
            </Typography>
            <Typography variant="body1">
              <VideoCamIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
              {site.cameras?.length || 0} active
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onManage(site)}
        >
          Manage
        </Button>
        <IconButton
          size="small"
          onClick={() => onEdit(site)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(site)}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default SiteCard;
