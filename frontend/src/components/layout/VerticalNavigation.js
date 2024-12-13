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
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  Traffic as TrafficIcon,
  Construction as MineIcon,
  House as ResidentialIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const navigationItems = [
  { text: 'Residential Vision', icon: <ResidentialIcon />, path: '/modules/residential' },
  { text: 'School Vision', icon: <SchoolIcon />, path: '/modules/school' },
  { text: 'Hospital Vision', icon: <HospitalIcon />, path: '/modules/hospital' },
  { text: 'Traffic Vision', icon: <TrafficIcon />, path: '/modules/traffic' },
  { text: 'Mine Site Vision', icon: <MineIcon />, path: '/modules/mine' },
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
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/')} selected={location.pathname === '/'}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default VerticalNavigation;
