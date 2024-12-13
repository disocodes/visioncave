import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Videocam as CameraIcon,
  ModelTraining as ModelsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const navigationItems = [
  { 
    section: 'Main',
    items: [
      { text: 'Module Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Widget Builder', icon: <BuildIcon />, path: '/widget-builder' },
      { text: 'Camera Management', icon: <CameraIcon />, path: '/camera-management' },
      { text: 'Models', icon: <ModelsIcon />, path: '/models' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ]
  }
];

const VerticalNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        {navigationItems.map((section) => (
          <React.Fragment key={section.section}>
            <List>
              <ListItem>
                <Typography
                  variant="overline"
                  color="textSecondary"
                  sx={{ fontWeight: 'bold' }}
                >
                  {section.section}
                </Typography>
              </ListItem>
              {section.items.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.dark',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: { fontWeight: location.pathname === item.path ? 'bold' : 'normal' }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </Box>
    </Drawer>
  );
};

export default VerticalNavigation;
