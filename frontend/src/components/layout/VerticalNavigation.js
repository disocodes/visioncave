import React, { useState } from 'react';
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
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Videocam as CameraIcon,
  ModelTraining as ModelsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  VideoLibrary as ArenaIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const navigationItems = [
  { 
    section: 'Main',
    items: [
      { text: 'Module Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { 
        text: 'Task and Flow Management',
        icon: <BuildIcon />,
        subitems: [
          { text: 'Widget Builder', icon: <AddIcon />, path: '/widget-builder' },
          { text: 'Task Builder', icon: <AddIcon />, path: '/task-builder' }
        ]
      },
      { 
        text: 'Arena',
        icon: <ArenaIcon />,
        subitems: [
          { text: 'Recordings List', icon: <ArenaIcon />, path: '/recordings-list' },
          { text: 'Arena Settings', icon: <SettingsIcon />, path: '/arena-settings' }
        ]
      },
      { text: 'Camera Management', icon: <CameraIcon />, path: '/camera-management' },
      { text: 'Models', icon: <ModelsIcon />, path: '/models' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ]
  }
];

const VerticalNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const handleMenuClick = (text) => {
    setOpenMenus(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderNavItem = (item, depth = 0) => {
    const hasSubitems = item.subitems && item.subitems.length > 0;
    const isSelected = location.pathname === item.path;
    const isOpen = openMenus[item.text];

    return (
      <React.Fragment key={item.text}>
        <ListItem 
          disablePadding 
          sx={{ pl: depth * 2 }}
        >
          <ListItemButton
            onClick={() => {
              if (hasSubitems) {
                handleMenuClick(item.text);
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            selected={isSelected}
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
                sx: { 
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: depth > 0 ? '0.9rem' : '1rem'
                }
              }}
            />
            {hasSubitems && (
              isOpen ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasSubitems && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subitems.map(subitem => renderNavItem(subitem, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

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
        <ListItem>
          <IconButton onClick={handleBack} edge="start">
            <BackIcon />
          </IconButton>
        </ListItem>
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
              {section.items.map(item => renderNavItem(item))}
            </List>
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </Box>
    </Drawer>
  );
};

export default VerticalNavigation;
