import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import VerticalNavigation from './VerticalNavigation';
import { useWidget } from '../../contexts/WidgetContext';
import { useSite } from '../../contexts/SiteContext';

const drawerWidth = 240;

const ModuleLayout = ({ children, title, actions }) => {
  const { isAnyWidgetFullscreen } = useWidget();
  const { sites, selectedSite, selectSite } = useSite();

  const handleSiteChange = (event) => {
    selectSite(event.target.value);
  };

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
            <Divider orientation="vertical" flexItem sx={{ mx: 2, height: '30px', alignSelf: 'center' }} />
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="site-select-label">Select Site</InputLabel>
              <Select
                labelId="site-select-label"
                value={selectedSite?.id || ''}
                label="Select Site"
                onChange={handleSiteChange}
              >
                {sites.map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{site.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({site.type})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
