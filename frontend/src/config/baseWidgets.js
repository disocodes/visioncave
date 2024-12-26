// Base Widgets
import CameraStreamWidget from '../components/widgets/CameraStreamWidget';
import AnalyticsWidget from '../components/widgets/AnalyticsWidget';
import AlertWidget from '../components/widgets/AlertWidget';
import OccupancyWidget from '../components/widgets/OccupancyWidget';
import SafetyMonitorWidget from '../components/widgets/SafetyMonitorWidget';
import ZoneManagementWidget from '../components/widgets/ZoneManagementWidget';

// Module-specific Widgets
import PackageDetectionWidget from '../components/widgets/residential/PackageDetectionWidget';
import PatientMonitorWidget from '../components/widgets/hospital/PatientMonitorWidget';
import HeavyMachineryTrackingWidget from '../components/widgets/mine/HeavyMachineryTrackingWidget';

// Widget registry - combines both base and module-specific widgets
const widgetRegistry = {
  // Base widgets
  camera_stream: {
    id: 'camera_stream',
    title: 'Camera Stream',
    component: CameraStreamWidget,
    configDefaults: {
      refreshInterval: 5,
      streamQuality: 'HD'
    },
    customConfig: [
      {
        name: 'streamQuality',
        label: 'Stream Quality',
        type: 'select',
        options: ['HD', '4K', '8K']
      },
      {
        name: 'enableAudio',
        label: 'Enable Audio',
        type: 'boolean'
      }
    ]
  },
  analytics: {
    id: 'analytics',
    title: 'Analytics Dashboard',
    component: AnalyticsWidget,
    configDefaults: {
      refreshInterval: 30,
      metrics: ['occupancy', 'incidents', 'alerts']
    }
  },
  alerts: {
    id: 'alerts',
    title: 'Alert Center',
    component: AlertWidget,
    configDefaults: {
      refreshInterval: 10,
      severity: ['high', 'medium', 'low']
    }
  },
  occupancy: {
    id: 'occupancy',
    title: 'Occupancy Tracking',
    component: OccupancyWidget,
    configDefaults: {
      refreshInterval: 15,
      threshold: 85
    }
  },
  safety: {
    id: 'safety',
    title: 'Safety Monitor',
    component: SafetyMonitorWidget,
    configDefaults: {
      refreshInterval: 5,
      zones: []
    }
  },
  zones: {
    id: 'zones',
    title: 'Zone Management',
    component: ZoneManagementWidget,
    configDefaults: {
      refreshInterval: 10,
      zoneTypes: ['restricted', 'public', 'staff']
    }
  },
  // Module-specific widgets
  package_detection: {
    id: 'package_detection',
    title: 'Package Detection',
    component: PackageDetectionWidget,
    configDefaults: {
      socketUrl: 'ws://localhost:8000/ws/package-detection',
      refreshInterval: 5
    }
  },
  patient_monitor: {
    id: 'patient_monitor',
    title: 'Patient Monitor',
    component: PatientMonitorWidget,
    configDefaults: {
      refreshInterval: 5,
      alertThreshold: 'medium'
    }
  },
  machinery_tracking: {
    id: 'machinery_tracking',
    title: 'Machinery Tracking',
    component: HeavyMachineryTrackingWidget,
    configDefaults: {
      refreshInterval: 10,
      trackingMode: 'realtime'
    }
  }
};

// Module-specific widget configurations
export const MODULE_WIDGETS = {
  residential: ['camera_stream', 'alerts', 'occupancy', 'package_detection'],
  school: ['camera_stream', 'analytics', 'safety', 'zones'],
  hospital: ['camera_stream', 'analytics', 'occupancy', 'safety', 'patient_monitor'],
  mine: ['camera_stream', 'safety', 'zones', 'analytics', 'machinery_tracking'],
  traffic: ['camera_stream', 'analytics', 'alerts']
};

// Get available widgets for a specific module
export const getModuleWidgets = (module) => {
  const widgetIds = MODULE_WIDGETS[module] || [];
  return widgetIds.map(id => widgetRegistry[id]);
};

// Get a specific widget configuration
export const getWidgetConfig = (widgetId) => {
  return widgetRegistry[widgetId];
};

// Base widgets available for all modules
export const BASE_WIDGETS = Object.values(widgetRegistry);
