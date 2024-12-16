import React, { useEffect, useState } from 'react';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ModuleLayout from '../../components/layout/ModuleLayout';
import WidgetContainer from '../../components/widgets/WidgetContainer';
import WidgetConfigDialog from '../../components/widgets/WidgetConfigDialog';
import { useWidget } from '../../contexts/WidgetContext';

// Import traffic widgets
import CameraStreamWidget from '../../components/widgets/CameraStreamWidget';
import TrafficFlowWidget from '../../components/widgets/traffic/TrafficFlowWidget';
import ParkingOccupancyWidget from '../../components/widgets/traffic/ParkingOccupancyWidget';
import AlertWidget from '../../components/widgets/AlertWidget';

// Built-in widgets available for this module
const BUILT_IN_WIDGETS = [
  {
    id: 'camera',
    title: 'Camera Stream',
    component: CameraStreamWidget,
    type: 'camera_stream',
    configDefaults: {
      refreshInterval: 5,
      alertThreshold: 90,
      streamQuality: 'HD'
    },
    customConfig: [
      {
        name: 'streamQuality',
        label: 'Stream Quality',
        type: 'select',
        options: ['SD', 'HD', '4K']
      },
      {
        name: 'recordingEnabled',
        label: 'Enable Recording',
        type: 'boolean'
      },
      {
        name: 'motionDetection',
        label: 'Enable Motion Detection',
        type: 'boolean'
      }
    ]
  },
  {
    id: 'traffic-flow',
    title: 'Traffic Flow Analysis',
    component: TrafficFlowWidget,
    type: 'traffic_flow',
    supportsSecondarySource: true,
    configDefaults: {
      refreshInterval: 15,
      alertThreshold: 85,
      congestionThreshold: 75
    },
    customConfig: [
      {
        name: 'congestionThreshold',
        label: 'Congestion Threshold (%)',
        type: 'number'
      },
      {
        name: 'vehicleClassification',
        label: 'Enable Vehicle Classification',
        type: 'boolean'
      },
      {
        name: 'speedLimit',
        label: 'Speed Limit (km/h)',
        type: 'number'
      },
      {
        name: 'monitoredLanes',
        label: 'Monitored Lanes (comma-separated)',
        type: 'text'
      }
    ]
  },
  {
    id: 'parking',
    title: 'Parking Occupancy',
    component: ParkingOccupancyWidget,
    type: 'parking_occupancy',
    configDefaults: {
      refreshInterval: 30,
      alertThreshold: 90,
      fullThreshold: 95
    },
    customConfig: [
      {
        name: 'fullThreshold',
        label: 'Full Capacity Threshold (%)',
        type: 'number'
      },
      {
        name: 'parkingZones',
        label: 'Parking Zones (comma-separated)',
        type: 'text'
      },
      {
        name: 'timeLimit',
        label: 'Time Limit (minutes)',
        type: 'number'
      },
      {
        name: 'enableVehicleTracking',
        label: 'Enable Vehicle Tracking',
        type: 'boolean'
      }
    ]
  },
  {
    id: 'alerts',
    title: 'Traffic Alerts',
    component: AlertWidget,
    type: 'traffic_alerts',
    supportsSecondarySource: true,
    configDefaults: {
      refreshInterval: 10,
      alertThreshold: 80,
      priorityLevel: 'medium'
    },
    customConfig: [
      {
        name: 'priorityLevel',
        label: 'Priority Level',
        type: 'select',
        options: ['low', 'medium', 'high']
      },
      {
        name: 'alertTypes',
        label: 'Alert Types (comma-separated)',
        type: 'text'
      },
      {
        name: 'notificationChannels',
        label: 'Notification Channels (comma-separated)',
        type: 'text'
      }
    ]
  }
];

const TrafficVision = () => {
  const { 
    widgets, 
    setCurrentModule, 
    createWidget, 
    handleWidgetReorder, 
    currentSiteId,
    getCustomWidgets 
  } = useWidget();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState(BUILT_IN_WIDGETS);

  // Load both built-in and custom widgets
  useEffect(() => {
    const loadCustomWidgets = async () => {
      try {
        const customWidgets = await getCustomWidgets('traffic');
        setAvailableWidgets([
          ...BUILT_IN_WIDGETS,
          ...customWidgets.map(widget => ({
            ...widget,
            component: widget.component || (() => <div>Custom Widget: {widget.title}</div>)
          }))
        ]);
      } catch (error) {
        console.error('Failed to load custom widgets:', error);
      }
    };
    loadCustomWidgets();
  }, [getCustomWidgets]);

  useEffect(() => {
    setCurrentModule('traffic');
  }, [setCurrentModule]);

  const handleAddWidget = async (widgetData) => {
    try {
      await createWidget(widgetData);
    } catch (error) {
      console.error('Failed to add widget:', error);
    }
  };

  const addWidgetButton = (
    <Tooltip title="Add Widget">
      <IconButton 
        color="primary"
        onClick={() => setConfigDialogOpen(true)}
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
      title="Traffic Vision"
      actions={addWidgetButton}
    >
      <Box sx={{ p: 3, position: 'relative', minHeight: '100vh' }}>
        <Grid container spacing={3}>
          {widgets.map((widget, index) => {
            const widgetTemplate = availableWidgets.find(w => w.type === widget.type);
            if (!widgetTemplate) return null;
            
            const Widget = widgetTemplate.component;
            return (
              <Grid item xs={12} md={6} key={widget.id}>
                <WidgetContainer
                  id={widget.id}
                  title={widget.title}
                  index={index}
                  position={widget.position}
                  config={widget.config}
                  metrics={widget.metrics}
                  alerts={widget.alerts}
                  siteId={currentSiteId}
                >
                  <Widget config={widget.config} />
                </WidgetContainer>
              </Grid>
            );
          })}
        </Grid>

        <WidgetConfigDialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          availableWidgets={availableWidgets}
          onAddWidget={handleAddWidget}
          currentSiteId={currentSiteId}
        />
      </Box>
    </ModuleLayout>
  );
};

export default TrafficVision;
