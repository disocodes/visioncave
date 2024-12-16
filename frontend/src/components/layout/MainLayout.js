import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            VisionCave
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Main>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default MainLayout;
