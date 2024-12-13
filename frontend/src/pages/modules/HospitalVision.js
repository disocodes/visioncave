import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import CameraStreamWidget from '../../components/widgets/CameraStreamWidget';
import PatientFallDetectionWidget from '../../components/widgets/hospital/PatientFallDetectionWidget';
import PatientMonitorWidget from '../../components/widgets/hospital/PatientMonitorWidget';
import StaffTrackingWidget from '../../components/widgets/hospital/StaffTrackingWidget';

const HospitalVision = () => {
  return (
    <ModuleLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hospital Vision
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CameraStreamWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <PatientFallDetectionWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <PatientMonitorWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <StaffTrackingWidget />
          </Grid>
        </Grid>
      </Box>
    </ModuleLayout>
  );
};

export default HospitalVision;
