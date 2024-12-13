import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Grid } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import VerticalNavigation from './VerticalNavigation';

const drawerWidth = 240;

const ModuleLayout = ({ children, title }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="textPrimary">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <VerticalNavigation />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: 'background.default',
        }}
      >
        <Grid container spacing={3}>
          {/* Default Live Camera Stream Widget */}
          <Grid item xs={12} md={6} lg={4}>
            <Box
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 1,
                p: 2,
                height: '100%',
                minHeight: 300,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              {/* Live Camera Stream Widget Content */}
              <Typography variant="h6" gutterBottom>
                Live Camera Stream
              </Typography>
              {/* Widget content will be injected here */}
            </Box>
          </Grid>

          {/* Module-specific widgets */}
          {React.Children.map(children, (child) => (
            <Grid item xs={12} md={6} lg={4}>
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  p: 2,
                  height: '100%',
                  minHeight: 300,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                {child}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ModuleLayout;
