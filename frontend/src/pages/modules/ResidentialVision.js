import React from 'react';
import ModuleLayout from '../../components/layout/ModuleLayout';
import { Box, Typography, IconButton } from '@mui/material';
import { 
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Import residential widgets
import OccupancyTrackingWidget from '../../components/widgets/residential/OccupancyTrackingWidget';
import PackageDetectionWidget from '../../components/widgets/residential/PackageDetectionWidget';
import ResidentialSecurityWidget from '../../components/widgets/residential/ResidentialSecurityWidget';

const WidgetHeader = ({ title, onExpand }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <Typography variant="h6">{title}</Typography>
    <Box>
      <IconButton size="small" onClick={() => {}}>
        <SettingsIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={onExpand}>
        <FullscreenIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => {}}>
        <SaveIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
);

const ExpandedControls = ({ title }) => (
  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
    <Typography variant="subtitle2" gutterBottom>
      {title} Controls
    </Typography>
    {/* Add widget-specific controls here */}
  </Box>
);

const ResidentialVision = () => {
  const [expandedWidget, setExpandedWidget] = React.useState(null);

  const handleExpand = (widgetId) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  const widgets = [
    {
      id: 'occupancy',
      title: 'Occupancy Tracking',
      description: 'Monitor and analyze occupancy patterns',
      component: OccupancyTrackingWidget,
      controls: [
        'Occupancy threshold settings',
        'Zone configuration',
        'Alert preferences'
      ]
    },
    {
      id: 'package',
      title: 'Package Detection',
      description: 'Detect and track package deliveries',
      component: PackageDetectionWidget,
      controls: [
        'Detection sensitivity',
        'Notification settings',
        'Package history'
      ]
    },
    {
      id: 'security',
      title: 'Suspicious Activity Alert',
      description: 'Monitor and alert suspicious activities',
      component: ResidentialSecurityWidget,
      controls: [
        'Activity threshold',
        'Alert zones',
        'Notification rules'
      ]
    }
  ];

  return (
    <ModuleLayout title="Residential Vision">
      {widgets.map((widget) => {
        const isExpanded = expandedWidget === widget.id;
        const Widget = widget.component;

        return (
          <Box
            key={widget.id}
            sx={{
              height: isExpanded ? '100%' : 'auto',
              transition: 'all 0.3s ease',
              ...(isExpanded && {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                bgcolor: 'background.paper',
                p: 3,
              }),
            }}
          >
            <WidgetHeader 
              title={widget.title} 
              onExpand={() => handleExpand(widget.id)}
            />
            <Widget />
            {isExpanded && (
              <ExpandedControls 
                title={widget.title}
                controls={widget.controls}
              />
            )}
          </Box>
        );
      })}
    </ModuleLayout>
  );
};

export default ResidentialVision;
