import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import VerticalNavigation from './VerticalNavigation';
import { useWidget } from '../../contexts/WidgetContext';

const drawerWidth = 240;

const ModuleLayout = ({ children, title, actions }) => {
  const { isAnyWidgetFullscreen } = useWidget();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: isAnyWidgetFullscreen ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: isAnyWidgetFullscreen ? 0 : `${drawerWidth}px`,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>
          {actions && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {actions}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {!isAnyWidgetFullscreen && <VerticalNavigation />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: isAnyWidgetFullscreen ? '100%' : { sm: `calc(100% - ${drawerWidth}px)` },
          ml: isAnyWidgetFullscreen ? 0 : undefined,
          mt: 8,
          backgroundColor: 'background.default',
          transition: 'all 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ModuleLayout;
