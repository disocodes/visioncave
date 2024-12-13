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
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import BaseWidget from '../BaseWidget';

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
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (analytics.staffTracking) {
      const staff = analytics.staffTracking.staff || [];
      setStaffData(staff);
      setActiveCount(staff.filter(s => s.status === 'active').length);
    }
  }, [analytics]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          minHeight: '200px'
        }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100%' }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Chip 
            label={`${activeCount} Active`} 
            color="success" 
            size="small" 
          />
          <Chip 
            label={`${staffData.length - activeCount} Away`} 
            color="warning" 
            size="small" 
          />
        </Box>
        
        <Grid 
          container 
          spacing={2}
          sx={{ 
            maxHeight: 'calc(100% - 40px)',
            overflow: 'auto',
            pb: 1
          }}
        >
          {staffData.map((staff) => (
            <Grid item xs={6} sm={4} md={3} key={staff.id}>
              <Tooltip
                title={`${staff.name} - ${staff.role}
Location: ${staff.location}
Status: ${staff.status}`}
                arrow
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      elevation: 3,
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
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
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        mx: 'auto', 
                        mb: 1,
                        bgcolor: staff.avatar ? 'transparent' : 'primary.main'
                      }}
                    >
                      {!staff.avatar && staff.name.charAt(0)}
                    </Avatar>
                  </StyledBadge>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      lineHeight: 1.2,
                      mb: 0.5
                    }}
                  >
                    {staff.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{
                      display: 'block',
                      lineHeight: 1.2
                    }}
                  >
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

  return (
    <BaseWidget
      title="Staff Tracking"
      summary={
        <Typography variant="body2" color="text.secondary">
          Tracking {staffData.length} staff members ({activeCount} active)
        </Typography>
      }
    >
      {renderContent()}
    </BaseWidget>
  );
};

export default StaffTrackingWidget;
