import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import CameraStreamWidget from '../../components/widgets/CameraStreamWidget';
import OccupancyTrackingWidget from '../../components/widgets/residential/OccupancyTrackingWidget';
import PackageDetectionWidget from '../../components/widgets/residential/PackageDetectionWidget';
import { ResidentialSecurityWidget } from '../../components/widgets/residential/ResidentialSecurityWidget';

const ResidentialVision = () => {
  return (
    <ModuleLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Residential Vision
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CameraStreamWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <OccupancyTrackingWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <PackageDetectionWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <ResidentialSecurityWidget />
          </Grid>
        </Grid>
      </Box>
    </ModuleLayout>
  );
};

export default ResidentialVision;
