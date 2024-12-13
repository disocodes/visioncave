import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import CameraStreamWidget from '../../components/widgets/CameraStreamWidget';
import TrafficFlowWidget from '../../components/widgets/traffic/TrafficFlowWidget';
import ParkingOccupancyWidget from '../../components/widgets/traffic/ParkingOccupancyWidget';
import AlertWidget from '../../components/widgets/AlertWidget';

const TrafficVision = () => {
  return (
    <ModuleLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Traffic Vision
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CameraStreamWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <TrafficFlowWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <ParkingOccupancyWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <AlertWidget />
          </Grid>
        </Grid>
      </Box>
    </ModuleLayout>
  );
};

export default TrafficVision;
