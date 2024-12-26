import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  IconButton, 
  Tooltip, 
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { useSite } from '../../contexts/SiteContext';
import { getModuleWidgets, getWidgetConfig } from '../../config/baseWidgets';

const MineSiteVision = () => {
  const { 
    widgets, 
    setCurrentModule, 
    createWidget, 
    handleWidgetReorder, 
    currentSiteId,
    loading: widgetLoading 
  } = useWidget();
  const { selectedSite } = useSite();
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  const [isCreatingWidget, setIsCreatingWidget] = useState(false);

  useEffect(() => {
    setCurrentModule('mine');
  }, [setCurrentModule]);

  const handleAddClick = (event) => {
    if (!selectedSite) {
      setError('Please select a site first');
      return;
    }
    if (selectedSite.status !== 'active') {
      setError('Selected site is not active');
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddWidget = async (widgetConfig) => {
    if (!selectedSite?.id) {
      setError('No site selected. Please select a site first.');
      return;
    }

    if (selectedSite.status !== 'active') {
      setError('Cannot add widgets to an inactive site');
      return;
    }

    try {
      setIsCreatingWidget(true);
      setError(null);
      
      await createWidget({
        name: widgetConfig.title,
        type: widgetConfig.id,
        site_id: selectedSite.id,
        config: widgetConfig.configDefaults,
        description: `${widgetConfig.title} widget for ${selectedSite.name}`,
        module: 'mine',
        status: 'active'
      });
      
      handleMenuClose();
      console.log(`Successfully added ${widgetConfig.title} widget`);
    } catch (error) {
      console.error('Failed to add widget:', error);
      setError(`Failed to add widget: ${error.message}`);
    } finally {
      setIsCreatingWidget(false);
    }
  };

  const addWidgetButton = (
    <Tooltip title={!selectedSite ? "Please select a site first" : "Add Widget"}>
      <span>
        <IconButton 
          color="primary"
          onClick={handleAddClick}
          size="large"
          disabled={!selectedSite || selectedSite.status !== 'active' || isCreatingWidget}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled'
            },
            mr: 2
          }}
        >
          {isCreatingWidget ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <ModuleLayout 
      title="Mine Site Vision"
      actions={addWidgetButton}
      error={error}
      onErrorClose={() => setError(null)}
    >
      <Box sx={{ p: 3, position: 'relative' }}>
        {widgetLoading && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const widgetConfig = getWidgetConfig(widget.type);
            if (!widgetConfig) {
              console.error(`No configuration found for widget type: ${widget.type}`);
              return null;
            }
            
            return (
              <Grid item xs={12} md={6} key={widget.id}>
                <WidgetContainer
                  id={widget.id}
                  title={widget.name || widgetConfig.title}
                  index={index}
                  position={widget.position}
                  config={widget.config}
                  metrics={widget.metrics}
                  alerts={widget.alerts}
                >
                  <widgetConfig.component config={widget.config} />
                </WidgetContainer>
              </Grid>
            );
          })}
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {getModuleWidgets('mine').map((widgetConfig) => (
            <MenuItem 
              key={widgetConfig.id}
              onClick={() => handleAddWidget(widgetConfig)}
              sx={{ minWidth: '200px' }}
            >
              <ListItemText 
                primary={widgetConfig.title}
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Click to add
                  </Typography>
                }
              />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </ModuleLayout>
  );
};

export default MineSiteVision;
