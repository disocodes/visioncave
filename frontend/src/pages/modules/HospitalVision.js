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
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import { useWidget } from '../../contexts/WidgetContext';
import { getModuleWidgets, getWidgetConfig } from '../../config/baseWidgets';

const HospitalVision = () => {
  const { widgets, setCurrentModule, createWidget, currentSiteId } = useWidget();
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentModule('hospital');
  }, [setCurrentModule]);

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddWidget = async (widgetConfig) => {
    if (!currentSiteId) {
      setError('No site selected. Please select a site first.');
      return;
    }

    try {
      await createWidget({
        name: widgetConfig.title,
        type: widgetConfig.id,
        site_id: currentSiteId,
        config: widgetConfig.configDefaults,
        description: `${widgetConfig.title} widget for site ${currentSiteId}`,
        module: 'hospital'
      });
      handleMenuClose();
    } catch (error) {
      console.error('Failed to add widget:', error);
      setError(`Failed to add widget: ${error.message}`);
    }
  };

  const addWidgetButton = (
    <Tooltip title="Add Widget">
      <IconButton 
        color="primary"
        onClick={handleAddClick}
        size="large"
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          mr: 2
        }}
      >
        <AddIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <ModuleLayout 
      title="Hospital Vision"
      actions={addWidgetButton}
      error={error}
      onErrorClose={() => setError(null)}
    >
      <Box sx={{ p: 3 }}>
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
          {getModuleWidgets('hospital').map((widgetConfig) => (
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

export default HospitalVision;
