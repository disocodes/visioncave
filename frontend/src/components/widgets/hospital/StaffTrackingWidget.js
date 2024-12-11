import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Tooltip,
  CircularProgress,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAnalytics } from '../../../contexts/AnalyticsContext';

const StyledBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'active' ? '#44b700' : '#ff9800',
    color: status === 'active' ? '#44b700' : '#ff9800',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'active' ? 'ripple 1.2s infinite ease-in-out' : 'none',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StaffTrackingWidget = () => {
  const { analytics, loading } = useAnalytics();
  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    if (analytics.staffTracking) {
      setStaffData(analytics.staffTracking.staff || []);
    }
  }, [analytics]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {staffData.map((staff) => (
          <Grid item xs={4} sm={3} md={2} key={staff.id}>
            <Tooltip
              title={`${staff.name} - ${staff.role}
Location: ${staff.location}
Status: ${staff.status}`}
              arrow
            >
              <Paper
                elevation={2}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  status={staff.status}
                >
                  <Avatar
                    alt={staff.name}
                    src={staff.avatar}
                    sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }}
                  />
                </StyledBadge>
                <Typography variant="body2" noWrap>
                  {staff.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {staff.role}
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StaffTrackingWidget;
