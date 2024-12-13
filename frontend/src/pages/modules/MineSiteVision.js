import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import CameraStreamWidget from '../../components/widgets/CameraStreamWidget';
import HeavyMachineryTrackingWidget from '../../components/widgets/mine/HeavyMachineryTrackingWidget';
import SafetyMonitorWidget from '../../components/widgets/SafetyMonitorWidget';
import ZoneManagementWidget from '../../components/widgets/ZoneManagementWidget';

const MineSiteVision = () => {
  return (
    <ModuleLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mine Site Vision
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CameraStreamWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <HeavyMachineryTrackingWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <SafetyMonitorWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <ZoneManagementWidget />
          </Grid>
        </Grid>
      </Box>
    </ModuleLayout>
  );
};

export default MineSiteVision;
