import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  School,
  Person,
  Group,
} from '@mui/icons-material';

const AttendanceMetric = ({ icon: Icon, title, value, total, color }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Icon sx={{ mr: 1, color }} />
      <Typography variant="body1">{title}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      <Typography variant="h6" sx={{ mr: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        / {total}
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={(value / total) * 100}
      sx={{ height: 8, borderRadius: 4, bgcolor: `${color}22` }}
      style={{ backgroundColor: `${color}22`, '& .MuiLinearProgress-bar': { backgroundColor: color } }}
    />
  </Box>
);

const SchoolAttendanceWidget = () => {
  const analyticsData = useSelector((state) => state.widgetData.analytics);

  // Sample data - replace with actual data from Redux store
  const attendanceData = {
    students: { present: 450, total: 500 },
    teachers: { present: 28, total: 30 },
    classes: { active: 15, total: 18 },
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <School sx={{ mr: 1 }} />
        <Typography variant="h6">Attendance Tracking</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AttendanceMetric
            icon={Group}
            title="Students Present"
            value={attendanceData.students.present}
            total={attendanceData.students.total}
            color="#2196f3"
          />
        </Grid>
        
        <Grid item xs={12}>
          <AttendanceMetric
            icon={Person}
            title="Teachers Present"
            value={attendanceData.teachers.present}
            total={attendanceData.teachers.total}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12}>
          <AttendanceMetric
            icon={School}
            title="Active Classes"
            value={attendanceData.classes.active}
            total={attendanceData.classes.total}
            color="#ff9800"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolAttendanceWidget;
