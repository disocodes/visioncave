import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import CameraStreamWidget from '../../components/widgets/CameraStreamWidget';
import StudentAttendanceWidget from '../../components/widgets/school/StudentAttendanceWidget';
import PlaygroundSafetyWidget from '../../components/widgets/school/PlaygroundSafetyWidget';
import ClassroomAttentionWidget from '../../components/widgets/school/ClassroomAttentionWidget';

const SchoolVision = () => {
  return (
    <ModuleLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          School Vision
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CameraStreamWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <StudentAttendanceWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <PlaygroundSafetyWidget />
          </Grid>
          <Grid item xs={12} md={6}>
            <ClassroomAttentionWidget />
          </Grid>
        </Grid>
      </Box>
    </ModuleLayout>
  );
};

export default SchoolVision;
